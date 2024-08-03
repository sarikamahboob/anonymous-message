import { openai } from '@ai-sdk/openai';
import { streamText, StreamData, generateText } from 'ai';
import { NextResponse } from 'next/server';
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;

// const openaiInstance = openai({ apiKey });
//@ts-ignore
openai.api_key = apiKey;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log({openai})
  try {
    // const { messages } = await req.json();
    // console.log({messages})
    // const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These question are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently stated?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that you makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to positive and welcoming conversational environment.";

    // const data = new StreamData();
    // data.append({ test: 'value' })

    // const result = await streamText({
    //   model: openai('gpt-4-turbo'),
    //   maxTokens: 400,
    //   prompt,
    //   onFinish() {
    //     data.close();
    //   },
    // });

    // return result.toDataStreamResponse({ data });

    const { messages } = await req.json();
    const data = new StreamData();
    data.append({ test: 'value' });
    const result = await streamText({
      model: openai('gpt-4o-mini-2024-07-18'),
      onFinish() {
        data.close();
      },
      messages,
    });

    // Respond with the stream and additional StreamData
    // return result.toDataStreamResponse({ data });
    return result.toDataStreamResponse();
  } catch (error:any) {
    console.log(error, "suggest-message")
    if(error.response) {
      const {name, status,headers, message} = error.response
      return NextResponse.json(
        {
          name, status,headers, message
        },
        {
          status
        }
      )
    } else {
      console.error("An unexpected error occurred", error);
      throw error;
    }
  }
}