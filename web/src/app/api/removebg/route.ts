import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Only POST allowed' }, { status: 405, headers: corsHeaders });
  }

  try {
    const { image_base64 } = await request.json();

    if (!image_base64) {
      return NextResponse.json({ error: 'Missing image_base64' }, { status: 400, headers: corsHeaders });
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'REMOVE_BG_API_KEY not configured' }, { status: 500, headers: corsHeaders });
    }

    // Decode base64 to binary
    const binaryString = atob(image_base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    // Call Remove.bg API
    const formData = new FormData();
    formData.append('image_file', blob, 'image.jpg');
    formData.append('size', 'auto');
    formData.append('format', 'png');

    const apiResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: formData,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.errors?.[0]?.title || 'API error' },
        { status: apiResponse.status, headers: corsHeaders }
      );
    }

    const resultBuffer = await apiResponse.arrayBuffer();
    const resultBase64 = arrayBufferToBase64(resultBuffer);

    return NextResponse.json(
      { success: true, image_base64: resultBase64, format: 'png' },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
