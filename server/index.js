// Reference backend for the restaurant POS.
//
// Stores app state (menu, tickets, bills, calls) as JSON under server/data.json.
// This is a STARTER implementation, good for one location and a handful of
// tablets. Before relying on this in a busy restaurant, swap readData/writeData
// for a real database (Postgres, Supabase, Firebase, etc.) — a flat JSON file
// can lose writes if two tablets save at the exact same instant.

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    return {};
  }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const app = express();

// Lock this down to your real frontend domain before going live, e.g.
// cors({ origin: 'https://your-restaurant-app.com' })
app.use(cors());

// Menu photos are sent as base64 strings, so allow a generous body size.
app.use(express.json({ limit: '15mb' }));

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/state/:key', (req, res) => {
  const data = readData();
  if (!(req.params.key in data)) return res.status(404).json({ error: 'not found' });
  res.json({ key: req.params.key, value: data[req.params.key] });
});

app.put('/state/:key', (req, res) => {
  const data = readData();
  data[req.params.key] = req.body.value;
  writeData(data);
  res.json({ key: req.params.key, value: data[req.params.key] });
});

app.delete('/state/:key', (req, res) => {
  const data = readData();
  delete data[req.params.key];
  writeData(data);
  res.json({ key: req.params.key, deleted: true });
});

app.get('/state', (req, res) => {
  const data = readData();
  res.json({ keys: Object.keys(data) });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`POS backend listening on :${PORT}`));
