import { PutObjectCommand, S3Client, type ObjectCannedACL } from '@aws-sdk/client-s3';
import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

const bucket = process.env.S3_BUCKET;
const region = process.env.S3_REGION;
const endpoint = process.env.S3_ENDPOINT;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
const hasBlobSupport = Boolean(process.env.VERCEL) || Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const hasS3Config = Boolean(bucket && region && accessKeyId && secretAccessKey);

let cachedClient: S3Client | null = null;

export function getStorageStatus() {
  return {
    blobEnabled: hasBlobSupport,
    s3Configured: hasS3Config,
  };
}

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
  if (!hasBlobSupport) return null;

  try {
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
  const { blobEnabled, s3Configured } = getStorageStatus();
  if (!blobEnabled && !s3Configured) {
    throw new Error('No storage backend is configured (enable Vercel Blob or provide S3 credentials).');
  }

  // 1) Try Vercel Blob (easiest on Vercel Free) when available
  if (blobEnabled) {
    const blobUrl = await tryVercelBlobUpload(file);
    if (blobUrl) return blobUrl;
  }

  // 2) Fallback to S3-compatible storage (R2/S3)
  try {
    if (!s3Configured || !bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error('S3 storage is not configured and Vercel Blob upload is unavailable.');
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
      params.ACL = process.env.S3_OBJECT_ACL as ObjectCannedACL;
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
