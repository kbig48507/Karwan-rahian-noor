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
    return res.status(500).json({ error: 'Gemini API Key is missing on server' });
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const promptText = `Extract exact details from this Pakistani passport image. Return strictly a pure JSON object without any markdown formatting, backticks, or extra text:
{
  "fullName": "Given Name and Surname combined",
  "fatherName": "Father Name",
  "cnic": "CNIC number with dashes",
  "passportNumber": "Passport Number (e.g. LS1018043)",
  "dob": "YYYY-MM-DD",
  "passportIssueDate": "YYYY-MM-DD",
  "passportExpiryDate": "YYYY-MM-DD",
  "address": "Place of birth or address"
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
      throw new Error(data.error?.message || 'Google AI error occurred');
    }

    const rawOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsedData = JSON.parse(rawOutput);

    return res.status(200).json(parsedData);
  } catch (err: any) {
    console.error('Scan Error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to scan passport' });
  }
}