import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI();

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
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];
  const isEvaluationRequest = lastMessage.content.includes('Evaluate this joke');

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    stream: true,
    temperature: isEvaluationRequest ? 0.3 : 0.7,
    messages: [
      {
        role: "system",
        content: isEvaluationRequest 
          ? "You are a joke evaluator. You MUST respond with ONLY a JSON object containing humor, appropriateness, relevance, creativity ratings, and a brief summary. Do not include any other text or the original joke in your response."
          : "You are a witty comedian who creates jokes based on the given parameters."
      },
      ...messages
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
