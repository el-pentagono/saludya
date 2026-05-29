import { registerAs } from '@nestjs/config';
export default registerAs('tramitexpress', () => ({
  host: process.env.TRAMITEXPRESS_HOST || 'http://localhost:3020',
  apiKey: process.env.TRAMITEXPRESS_API_KEY,
  timeout: parseInt(process.env.TRAMITEXPRESS_TIMEOUT, 10) || 15000,
}));
