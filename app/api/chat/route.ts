import {openai} from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

export const runtime = "edge";

const SYSTEM_PROMPTS = {
  jokeGeneration: `You are a witty comedian with expertise in multiple styles of humor.
  Guidelines:
  - Adapt your style based on the requested tone and type
  - Consider cultural sensitivity
  - Maintain coherence between topic and punchline
  - Use creative wordplay when appropriate
  - Keep jokes concise and well-structured`,

  evaluation: `You are an expert humor analyst with deep understanding of comedy theory.
  Evaluate jokes using these criteria:
  - Humor: Consider timing, surprise factor, and cleverness
  - Appropriateness: Assess cultural sensitivity and audience suitability
  - Relevance: Evaluate how well it matches requested topic/theme
  - Creativity: Judge originality and innovative approach
  
  Rate each criterion consistently:
  - Humor: ["Not Funny", "Somewhat Funny", "Funny", "Very Funny", "Hilarious"]
  - Appropriateness: ["Inappropriate", "Somewhat Appropriate", "Appropriate", "Very Appropriate"]
  - Relevance: ["Off Topic", "Somewhat Related", "On Topic", "Perfectly Matched"]
  - Creativity: ["Generic", "Somewhat Original", "Original", "Highly Creative"]`
};

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
        content: isEvaluationRequest 
          ? "You are a joke evaluator. You MUST respond with ONLY a JSON object containing humor, appropriateness, relevance, creativity ratings, and a brief summary. Do not include any other text or the original joke in your response."
          : "You are a witty comedian who creates jokes based on the given parameters."
      },
      {
        role: "user",
        content: `Create a ${type} joke on the topic of ${topic} in a ${tone} tone.`,
      },
    ],
  });

  const jokeStream = jokeResponse.toDataStreamResponse();

  return jokeStream
  // Evaluate the joke's content
  // const evaluationResponse = await streamText({
  //   model: openai("gpt-4o-mini"),
  //   messages: convertToCoreMessages([
  //     {
  //       role: "system",
  //       content: `You are a content evaluator. Your task is to evaluate if a joke is "funny", "appropriate", "offensive", or "neutral". Provide a one-word answer with the evaluation criteria and a short explanation.`,
  //     },
  //     {
  //       role: "user",
  //       content: `Evaluate the following joke: "${jokeText}"`,
  //     },
  //   ]),
  // });

}
