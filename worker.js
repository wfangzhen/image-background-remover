/**
 * Cloudflare Worker - Image Background Remover
 * API Gateway for Remove.bg
 */

const REMOVE_BG_API_KEY = REMOVE_BG_API_KEY;
const REMOVE_BG_API_URL = 'https://api.remove.bg/v1.0/removebg';

export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Only POST allowed' }, 405, corsHeaders);
    }

    try {
      const body = await request.json();
      const { image_base64, image_url } = body;

      if (!image_base64 && !image_url) {
        return jsonResponse({ error: 'Missing image_base64 or image_url' }, 400, corsHeaders);
      }

      // Build form data for Remove.bg API
      const formData = new FormData();
      
      if (image_base64) {
        // Convert base64 to Blob
        const binaryString = atob(image_base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        formData.append('image_file', blob, 'image.jpg');
      } else if (image_url) {
        formData.append('image_url', image_url);
      }

      formData.append('size', 'auto');
      formData.append('format', 'png');

      // Call Remove.bg API
      const apiResponse = await fetch(REMOVE_BG_API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('Remove.bg API error:', errorText);
        
        if (apiResponse.status === 403) {
          return jsonResponse({ error: 'API key invalid or quota exceeded' }, 403, corsHeaders);
        }
        if (apiResponse.status === 429) {
          return jsonResponse({ error: 'Rate limit exceeded. Please try again later.' }, 429, corsHeaders);
        }
        return jsonResponse({ error: 'Failed to process image' }, apiResponse.status, corsHeaders);
      }

      // Get the result image as array buffer
      const resultBuffer = await apiResponse.arrayBuffer();
      
      // Convert to base64 for response
      const base64 = arrayBufferToBase64(resultBuffer);

      return jsonResponse({
        success: true,
        image_base64: base64,
        format: 'png'
      }, 200, corsHeaders);

    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: 'Internal server error: ' + error.message }, 500, corsHeaders);
    }
  }
};

// Helper functions
function jsonResponse(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
