import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

const bucket = process.env.S3_BUCKET;
const region = process.env.S3_REGION;
const endpoint = process.env.S3_ENDPOINT;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

let cachedClient: S3Client | null = null;

function getClient(): S3Client {
  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('S3 storage is not fully configured');
  }

  if (!cachedClient) {
    cachedClient = new S3Client({
      region,
      endpoint,
      forcePathStyle: Boolean(endpoint), // required for R2/B2 style endpoints
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return cachedClient;
}

function buildPublicUrl(key: string): string {
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, '')}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function tryVercelBlobUpload(file: File): Promise<string | null> {
  try {
    // Prefer Vercel Blob when running on Vercel (no extra config) or when an explicit token is present
    const onVercel = Boolean(process.env.VERCEL);
    const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    if (!onVercel && !hasBlobToken) return null;

    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);
    const key = `${randomUUID()}-${file.name}`;

    const result = await put(key, body, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      token: process.env.BLOB_READ_WRITE_TOKEN, // optional on Vercel when Blob is linked
    });

    return result.url; // already public
  } catch (err) {
    // Fallback to S3 path if Blob upload fails
    console.warn('[storage] Vercel Blob upload failed, falling back to S3 if configured.', err);
    return null;
  }
}

export async function uploadFile(file: File): Promise<string> {
  // 1) Try Vercel Blob (easiest on Vercel Free)
  const blobUrl = await tryVercelBlobUpload(file);
  if (blobUrl) return blobUrl;

  // 2) Fallback to S3-compatible storage (R2/S3)
  try {
    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error('No storage backend is configured (Vercel Blob not available and S3 env vars missing).');
    }

    const arrayBuffer = await file.arrayBuffer();
    const body = Buffer.from(arrayBuffer);
    const key = `${randomUUID()}-${file.name}`;

    const client = getClient();

    const params: PutObjectCommandInput = {
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type || 'application/octet-stream',
    };
    if (process.env.S3_OBJECT_ACL) {
      params.ACL = process.env.S3_OBJECT_ACL;
    }

    await client.send(new PutObjectCommand(params));

    return buildPublicUrl(key);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  try {
    const urls = await Promise.all(files.map((file) => uploadFile(file)));
    return urls;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw new Error('Failed to upload files');
  }
}
