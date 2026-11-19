import type { NextConfig } from 'next';
import { config } from 'dotenv';
import { resolve } from 'node:path';

// Загружаем .env из корня монорепозитория
config({
  path: resolve(process.cwd(), '../../.env'),
  override: false,
});

const nextConfig: NextConfig = {};

export default nextConfig;