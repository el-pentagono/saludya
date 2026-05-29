import { registerAs } from '@nestjs/config';
export default registerAs('shieldai', () => ({
  host: process.env.SHIELDAI_HOST || 'http://localhost:3010',
  apiKey: process.env.SHIELDAI_API_KEY,
  timeout: parseInt(process.env.SHIELDAI_TIMEOUT, 10) || 10000,
}));
