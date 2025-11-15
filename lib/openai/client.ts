import OpenAI from 'openai'

export function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  return new OpenAI({
    apiKey,
  })
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = createOpenAIClient()
  
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

