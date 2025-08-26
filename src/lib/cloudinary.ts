// lib/config.ts
import { v2 as cloudinary } from "cloudinary";

export interface CloudinaryImage {
  asset_id: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename?: string;
  tags?: string[];
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  version?: number;
  signature?: string;
  etag?: string;
  placeholder?: boolean;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
