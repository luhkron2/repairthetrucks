import { NextRequest, NextResponse } from 'next/server';
import { uploadFiles, getStorageStatus } from '@/lib/storage';
import { logger } from '@/lib/logger';
import { FILE_UPLOAD } from '@/lib/constants';
import { validateFile } from '@/lib/form-validation';

export async function POST(request: NextRequest) {
  try {
    const { blobEnabled, s3Configured } = getStorageStatus();
    if (!blobEnabled && !s3Configured) {
      return NextResponse.json(
        { error: 'File storage is not configured. Add Vercel Blob or S3 credentials and try again.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > FILE_UPLOAD.maxFiles) {
      return NextResponse.json({ error: `Maximum ${FILE_UPLOAD.maxFiles} files allowed` }, { status: 400 });
    }

    // Validate all files first
    for (const file of files) {
      const validation = validateFile(file, {
        maxSizeMB: FILE_UPLOAD.maxSizeMB,
        allowedTypes: FILE_UPLOAD.allowedTypes,
      });
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // Upload files to configured S3-compatible storage
    const urls = await uploadFiles(files);
    
    logger.info(`Files uploaded to blob storage:`, { count: urls.length });

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    logger.error('Error uploading files:', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}

