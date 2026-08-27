import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

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
    return res.status(500).json({ error: 'Gemini API Key is missing' });
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
              },
            },
            {
              text: `You are an automated OCR parser for Pakistani Passports. 
Read the provided passport image and extract the following details. 
Return ONLY a valid, raw JSON object without markdown formatting, code blocks or backticks:
{
  "fullName": "Given Name and Surname combined",
  "fatherName": "Father Name",
  "cnic": "CNIC/Citizenship number",
  "passportNumber": "Passport Number (e.g. LS1018043)",
  "dob": "YYYY-MM-DD",
  "passportIssueDate": "YYYY-MM-DD",
  "passportExpiryDate": "YYYY-MM-DD",
  "address": "Place of birth or address"
}`
            }
          ]
        }
      ]
    });

    const rawText = response.text || '{}';
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanJson);

    return res.status(200).json(parsedData);
  } catch (err: any) {
    console.error('Scan Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to scan passport via AI' });
  }
}