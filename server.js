import express from 'express';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static(join(__dirname, 'dist')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Shock Room Simulator corriendo en puerto ${PORT}`);
});
