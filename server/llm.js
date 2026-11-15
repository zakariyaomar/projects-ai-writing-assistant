// llm.js
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

// Initialize clients
const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Default configuration from environment
const DEFAULT_PROVIDER = process.env.DEFAULT_LLM_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai' : 'anthropic');
const DEFAULT_MODELS = {
  anthropic: process.env.DEFAULT_ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
  openai: process.env.DEFAULT_OPENAI_MODEL || 'gpt-4o-mini',
};

function getResponseText(content, provider) {
  const text = typeof content === 'string'
    ? content
    : Array.isArray(content)
      ? content
      .filter((block) => block.type === 'text' && typeof block.text === 'string')
      .map((block) => block.text)
      .join('\n')
      : '';

  if (!text.trim()) {
    throw new Error(`${provider} response did not contain text content.`);
  }

  return text;
}

/**
 * Call Anthropic's Claude API and return a normalized response.
 */
async function callAnthropic({ model, system, messages,  maxTokens }) {
  if (!anthropicClient) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }
  const response = await anthropicClient.messages.create({
    model: model,
    max_tokens: maxTokens,
    system: system || undefined,
    messages: messages,
  });

  return {
    text: getResponseText(response.content, 'Anthropic'),
    model: response.model,
    provider: 'anthropic',
    usage: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
      total: response.usage.input_tokens + response.usage.output_tokens,
    },
    finished: response.stop_reason === 'end_turn',
    raw: response, // Keep the raw response in case you need provider-specific data
  };
}

/**
 * Call OpenAI's GPT API and return a normalized response.
 */
async function callOpenAI({ model, system, messages, temperature, maxTokens }) {
  if (!openaiClient) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }
  // Build messages array with system prompt
  const apiMessages = [];

  if (system) {
    apiMessages.push({ role: 'system', content: system });
  }

  // Add conversation messages
  apiMessages.push(...messages);

  const completion = await openaiClient.chat.completions.create({
    model: model,
    max_tokens: maxTokens,
    temperature: temperature,
    messages: apiMessages,
  });

  const choice = completion.choices[0];

  return {
    text: getResponseText(choice.message.content, 'OpenAI'),
    model: completion.model,
    provider: 'openai',
    usage: {
      input: completion.usage.prompt_tokens,
      output: completion.usage.completion_tokens,
      total: completion.usage.total_tokens,
    },
    finished: choice.finish_reason === 'stop',
    raw: completion,
  };
}

/**
 * Generate a response from an LLM provider.
 *
 * @param {Object} options
 * @param {string} [options.provider] - 'anthropic' or 'openai'. Defaults to DEFAULT_LLM_PROVIDER.
 * @param {string} [options.model] - Model name. Defaults to the provider's default model.
 * @param {string} [options.system] - System prompt.
 * @param {Array} options.messages - Array of { role, content } message objects.
 * @param {number} [options.temperature=0.7] - Temperature for generation.
 * @param {number} [options.maxTokens=1024] - Maximum tokens to generate.
 * @returns {Object} Normalized response with text, model, provider, usage, and finished fields.
 */
async function generateResponse({
  provider = DEFAULT_PROVIDER,
  model,
  system,
  messages,
  maxTokens = 1024,
}) {
  // Validate messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array');
  }

  // Use default model if not specified
  const selectedModel = model || DEFAULT_MODELS[provider];

  if (!selectedModel) {
    throw new Error(`No model specified and no default model for provider "${provider}"`);
  }

 

   const options = {
   model: selectedModel,
    system,
    messages, 
    maxTokens,
  };

  switch (provider) {
    case 'anthropic':
      return await callAnthropic(options);

    case 'openai':
      return await callOpenAI(options);

    default:
      throw new Error(`Unsupported provider: "${provider}". Use "anthropic" or "openai".`);
  }
}

module.exports = { generateResponse };
// Add to llm.js

/**
 * Generate a response with automatic fallback.
 * Tries the primary provider first. If it fails, falls back to the other provider.
 *
 * @param {Object} options - Same options as generateResponse, plus:
 * @param {string} [options.fallbackProvider] - Provider to use if primary fails.
 * @param {string} [options.fallbackModel] - Model to use for fallback.
 * @returns {Object} Normalized response with an additional `fallback` field.
 */
async function generateWithFallback({
  provider = DEFAULT_PROVIDER,
  model,
  system,
  messages,
  temperature = 0.7,
  maxTokens = 1024,
  fallbackProvider,
  fallbackModel,
}) {
  // Determine fallback provider
  const fb = fallbackProvider || (provider === 'anthropic' ? 'openai' : 'anthropic');
  const fbModel = fallbackModel || DEFAULT_MODELS[fb];

  try {
    // Try primary provider
    const response = await generateResponse({
      provider,
      model,
      system,
      messages,
      temperature,
      maxTokens,
    });

    return { ...response, fallback: false };
  } catch (primaryError) {
    console.warn(
      `Primary provider "${provider}" failed: ${primaryError.message}. Trying fallback "${fb}"...`
    );

    try {
      // Try fallback provider
      const response = await generateResponse({
        provider: fb,
        model: fbModel,
        system,
        messages,
        temperature,
        maxTokens,
      });

      return {
        ...response,
        fallback: true,
        fallbackReason: primaryError.message,
        originalProvider: provider,
      };
    } catch (fallbackError) {
      // Both providers failed
      const error = new Error(
        `Both providers failed. Primary (${provider}): ${primaryError.message}. Fallback (${fb}): ${fallbackError.message}`
      );
      error.primaryError = primaryError;
      error.fallbackError = fallbackError;
      throw error;
    }
  }
}

// Update module.exports
module.exports = { generateResponse, generateWithFallback };