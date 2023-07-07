import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export const runtime = 'edge'

const apiConfig = new Configuration({
    apiKey: process.env.OPENAI_API_KEY!
})

const openai = new OpenAIApi(apiConfig)

export async function POST(req: Request) {
    // Extract the `prompt` from the body of the request
    const { prompt } = await req.json()

    // Request the OpenAI API for the response based on the prompt
    const response = await openai.createChatCompletion({
        model: 'gpt-4',
        stream: true,
        // a precise prompt is important for the AI to reply with the correct tokens
        messages: [
            {
                role: 'user',
                content: `In the following messages, the user is looking for information. Answer the user with the corresponding information. Messages:
${prompt}
        
Output:\n`
            }
        ],
        max_tokens: 200,
        temperature: 0, // you want absolute certainty for spell check
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
}