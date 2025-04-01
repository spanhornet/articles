// apps/api/src/services/image.service.ts
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, CLOUDFLARE_R2_BUCKET_NAME } from '../config/r2.config';
import crypto from 'crypto';
import { checkRateLimit, getRemainingCalls } from './rate-limiter.service';

export async function uploadImageToR2(file: Buffer, contentType: string, headers: Record<string, string | string[] | undefined>): Promise<string> {
  // Check rate limit before proceeding
  const isAllowed = await checkRateLimit(headers);
  if (!isAllowed) {
    const remainingCalls = await getRemainingCalls(headers);
    throw new Error(`Rate limit exceeded. You have ${remainingCalls} calls remaining.`);
  }

  // Generate a unique key for the image
  const key = `uploads/${crypto.randomUUID()}-${Date.now()}`;
  
  try {
    console.log('Uploading image to R2:', {
      bucket: CLOUDFLARE_R2_BUCKET_NAME,
      key,
      contentType,
      fileSize: file.length,
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL
    });

    // Upload the image to R2
    await r2Client.send(new PutObjectCommand({
      Bucket: CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    }));
    
    // Return the URL to the uploaded image
    // Remove any existing https:// prefix from the public URL to avoid duplication
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/^https?:\/\//, '') || '';
    const finalUrl = `https://${publicUrl}/${CLOUDFLARE_R2_BUCKET_NAME}/${key}`;
    
    console.log('Image uploaded successfully:', {
      finalUrl,
      key,
      publicUrl
    });
    
    return finalUrl;
  } catch (error) {
    console.error('Error uploading image to R2:', {
      error,
      bucket: CLOUDFLARE_R2_BUCKET_NAME,
      key,
      contentType,
      fileSize: file.length,
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL
    });
    throw new Error('Failed to upload image');
  }
}

export async function deleteImageFromR2(imageUrl: string, headers: Record<string, string | string[] | undefined>): Promise<void> {
  // Check rate limit before proceeding
  const isAllowed = await checkRateLimit(headers);
  if (!isAllowed) {
    const remainingCalls = await getRemainingCalls(headers);
    throw new Error(`Rate limit exceeded. You have ${remainingCalls} calls remaining.`);
  }

  try {
    // Extract the key from the image URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1); // Remove the leading slash
    
    // Delete the image from R2
    await r2Client.send(new DeleteObjectCommand({
      Bucket: CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
    })); 
  } catch (error) {
    console.error('Error deleting image from R2:', error);
    throw new Error('Failed to delete image');
  }
}