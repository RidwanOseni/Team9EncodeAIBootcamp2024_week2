import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: Request) {
  let parameters;

  try {
    // Attempt to parse request JSON
    parameters = await req.json();
  } catch (error) {
    return new Response("Invalid JSON format", { status: 400 });
  }

  const {
    topic = "general",
    tone = "funny",
    type = "pun",
    temperature = 0.7,
  } = parameters || {};

  if (!topic || !tone || !type) {
    return new Response("Missing required joke parameters", { status: 400 });
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    temperature,
    messages: [
      {
        role: "system",
        content: `You are a witty comedian who crafts jokes with a specific topic, tone, and style. Your jokes should be funny, engaging, and tailored to the parameters provided by the user.`,
      },
      {
        role: "user",
        content: `Create a ${type} joke on the topic of ${topic} in a ${tone} tone.`,
      },
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
