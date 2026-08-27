import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64 } = req.body;
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key missing' });
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Direct official Gemini REST endpoint (Fast & 100% Reliable)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const promptText = `Extract information from this Pakistani passport image and respond ONLY with a clean JSON object without backticks, markdown or extra text:
{
  "fullName": "Mureed Abbas",
  "fatherName": "Mehmood",
  "cnic": "32202-2530804-5",
  "passportNumber": "LS1018043",
  "dob": "1972-06-10",
  "passportIssueDate": "2026-03-04",
  "passportExpiryDate": "2031-03-03",
  "address": "Layyah, Pak"
}`;

    const apiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error(data.error?.message || 'Google AI error');
    }

    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsedData = JSON.parse(rawOutput);

    return res.status(200).json(parsedData);
  } catch (err: any) {
    console.error('Scan Error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to scan passport' });
  }
}