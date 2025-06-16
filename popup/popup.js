const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');

// Handle Translate Button Click
translateBtn.addEventListener('click', async () => {
  const text = inputText.value.trim();
  if (!text) {
    showError('Please enter text to translate.');
    return;
  }

  const { groqApiKey } = await chrome.storage.local.get('groqApiKey');
  const { translationSettings } = await chrome.storage.local.get('translationSettings');

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Translate the following text into ${translationSettings?.style || 'hinglish'} using a ${translationSettings?.level || 'balanced'} language level.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim();
    outputText.value = translated || 'No response received.';
  } catch (err) {
    console.error(err);
    showError(err.message || 'Translation failed');
  }
});

// Handle Clear Button Click
clearBtn.addEventListener('click', () => {
  inputText.value = '';
  outputText.value = '';
});

// Handle Copy Button Click
copyBtn.addEventListener('click', async () => {
  const text = outputText.value.trim();
  if (!text) {
    showError('No translated text to copy');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showSuccess('Translated text copied to clipboard');
  } catch (error) {
    console.error('Copy failed:', error);
    showError('Failed to copy text');
  }
});
