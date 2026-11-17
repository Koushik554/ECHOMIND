import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.BHARATCODE_API_KEY;
const baseUrl = process.env.BHARATCODE_BASE_URL || 'https://bharatcode.ai/api/model/v1';

console.log('--- BharatCode Live Connection Diagnostic ---');
console.log(`Base URL: ${baseUrl}`);
console.log(`API Key present: ${Boolean(apiKey)} (Length: ${apiKey ? apiKey.length : 0})`);

if (!apiKey || apiKey === 'your_bharatcode_api_key_here') {
  console.error('❌ Error: No valid BHARATCODE_API_KEY set in server/.env');
  process.exit(1);
}

async function testLiveConnection() {
  // 1. Test /models endpoint
  console.log('\n[1/2] Probing /models endpoint...');
  try {
    const modelsRes = await fetch(`${baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    console.log(`Models Endpoint HTTP Status: ${modelsRes.status} ${modelsRes.statusText}`);
    const modelsData = await modelsRes.json();
    console.log('Available Models:', JSON.stringify(modelsData, null, 2));
  } catch (err) {
    console.log(`Probing /models failed: ${err.message}`);
  }

  // 2. Test /chat/completions endpoint
  console.log('\n[2/2] Testing /chat/completions endpoint...');
  try {
    const chatRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.BHARATCODE_MODEL || 'qwen-3.8-27b',
        messages: [
          { role: 'user', content: 'Respond with exactly: {"status": "ok"}' }
        ],
        max_tokens: 50
      })
    });

    console.log(`Chat Completions HTTP Status: ${chatRes.status} ${chatRes.statusText}`);
    const responseText = await chatRes.text();
    console.log('Raw Upstream Response:');
    console.log(responseText);
  } catch (err) {
    console.error('Chat completions request failed:', err);
  }
}

testLiveConnection();

