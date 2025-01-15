import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    return NextResponse.json({ embedding: response.data[0].embedding });
  } catch (error: unknown) {
    console.error('OpenAI API Error:', error);
    const apiError = error as ApiError;
    return NextResponse.json(
      { error: apiError.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 