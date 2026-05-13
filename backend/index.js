const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fetch = global.fetch || ((...a) =>
  import('node-fetch').then(({ default: f }) => f(...a))
);

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ limit: '1000mb', extended: true }));

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get('/', (_req, res) => res.send('Backend is running'));

const upload = multer({ storage: multer.memoryStorage() });
let uploadedBookText = null;

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const file = req.file;
    let text = '';

    if (file.mimetype === 'text/plain') {
      text = file.buffer.toString('utf-8');
    } else if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(file.buffer);
      text = data.text;
    } else {
      return res.status(400).json({ error: 'Only PDF and TXT supported' });
    }

    uploadedBookText = text;
    res.json({ message: 'File uploaded successfully', length: text.length });
  } catch {
    res.status(500).json({ error: 'File processing failed' });
  }
});

const MODEL = 'gemini-2.5-flash';

app.post('/api/gemini', async (req, res) => {
  try {
    const prompt = (req.body?.prompt || '').trim();
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
    if (!GEMINI_API_KEY)
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    if (!uploadedBookText)
      return res
        .status(400)
        .json({ error: 'No book uploaded yet. Please upload a file first.' });

    const combinedPrompt = `${prompt}\n\n---\nBook context:\n${uploadedBookText}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: combinedPrompt }] }],
      }),
      timeout: 0,
    });

    const j = await r.json();
    const geminiError = j?.error?.message || '';

    if (geminiError.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({
        error:
          'You’ve reached Gemini’s rate limit (about 2 requests per minute). Please wait 30–60 seconds and try again.',
      });
    }

    if (
      geminiError.includes('maximum input length') ||
      geminiError.includes('input too long') ||
      geminiError.includes('too large')
    ) {
      return res.status(400).json({
        error:
          'Your manuscript is too long for this model. Try uploading a shorter version or splitting it into sections.',
      });
    }

    if (!r.ok) {
      return res.status(r.status).json({
        error:
          geminiError ||
          'Gemini returned an unexpected error. Try again or adjust your prompt.',
      });
    }

    const text = j?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.json({ text, modelUsed: MODEL });
  } catch {
    res.status(500).json({
      error: 'Unexpected server error. Please try again or check your connection.',
    });
  }
});

app.post('/api/clear', (_req, res) => {
  uploadedBookText = null;
  res.json({ message: 'Server memory cleared' });
});

app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
