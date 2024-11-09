"use client";

import { useState, useEffect } from "react";
import { useChat } from "ai/react";

// Add interface for state
interface JokeState {
  topic: string;
  tone: string;
  type: string;
  temperature: number;
  currentJoke: string;
  evaluation: {
    humor: string;
    appropriateness: string;
    relevance: string;
    creativity: string;
    summary: string;
  } | null;
  evaluationHistory: {
    joke: string;
    parameters: {
      topic: string;
      tone: string;
      type: string;
      temperature: number;
    };
    evaluation: {
      humor: string;
      appropriateness: string;
      relevance: string;
      creativity: string;
      summary: string;
    };
    timestamp: Date;
  }[];
}

export default function JokeGenerator() {
  const [evaluationRequested, setEvaluationRequested] = useState(false);

  const { messages, append, isLoading } = useChat({
    onFinish: (message) => {
      console.log("=== Message Received ===");
      console.log("Message content:", message.content);
      console.log("Evaluation requested:", evaluationRequested);

      if (!message.content || !evaluationRequested) return;

      try {
        // Clean up and parse the JSON
        const jsonString = message.content.trim();
        const evaluation = JSON.parse(jsonString);
        console.log("Successfully parsed evaluation:", evaluation);
        
        // Find the joke message
        const jokeMessage = messages[messages.length - 2]?.content;
        console.log("Joke being evaluated:", jokeMessage);

        // Update state using a callback to ensure we have the latest state
        setState(prevState => {
          const newHistoryEntry = {
            joke: jokeMessage,
            parameters: {
              topic: prevState.topic,
              tone: prevState.tone,
              type: prevState.type,
              temperature: prevState.temperature
            },
            evaluation: evaluation,
            timestamp: new Date()
          };

          const newHistory = [...prevState.evaluationHistory, newHistoryEntry];
          console.log("Updating state with new history entry:", newHistoryEntry);
          console.log("New history length:", newHistory.length);

          return {
            ...prevState,
            evaluation: evaluation,
            evaluationHistory: newHistory
          };
        });
        
        setEvaluationRequested(false);
      } catch (error) {
        console.error("Failed to parse evaluation:", error);
        setEvaluationRequested(false);
      }
    }
  });

  // Available options for joke parameters
  const topics = [
    { emoji: "💼", value: "Work" },
    { emoji: "🐶", value: "Animals" },
    { emoji: "🍔", value: "Food" },
    { emoji: "📺", value: "Television" },
  ];

  const tones = [
    { emoji: "😏", value: "Witty" },
    { emoji: "😂", value: "Goofy" },
    { emoji: "🌑", value: "Dark" },
    { emoji: "😊", value: "Silly" },
  ];

  const types = [
    { emoji: "🧩", value: "Pun" },
    { emoji: "🚪", value: "Knock-knock" },
    { emoji: "📖", value: "Story" },
  ];

  const [state, setState] = useState<JokeState>({
    topic: "",
    tone: "",
    type: "",
    temperature: 0.7,
    currentJoke: "",
    evaluation: null,
    evaluationHistory: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      temperature: parseFloat(e.target.value),
    });
  };

  // Add loading state
  const [loading, setLoading] = useState(false);

  const handleEvaluateJoke = async () => {
    console.log("=== Starting Joke Evaluation ===");
    
    const lastMessage = messages[messages.length - 1];
    const jokeMessage = lastMessage?.content;
    
    console.log("Found joke message:", jokeMessage);

    if (!jokeMessage) {
        console.log("No valid joke found to evaluate");
        return;
    }

    // More explicit evaluation prompt
    const evaluationPrompt = `You are a joke evaluator. Your task is to evaluate the following joke and respond ONLY with a JSON object.

DO NOT include the joke text or any other text in your response.
ONLY return a JSON object in this exact format:

{
  "humor": "Not Funny" | "Somewhat Funny" | "Funny" | "Very Funny" | "Hilarious",
  "appropriateness": "Inappropriate" | "Somewhat Appropriate" | "Appropriate" | "Very Appropriate",
  "relevance": "Off Topic" | "Somewhat Related" | "On Topic" | "Perfectly Matched",
  "creativity": "Generic" | "Somewhat Original" | "Original" | "Highly Creative",
  "summary": "Brief analysis here"
}

Joke to evaluate: "${jokeMessage}"

Remember: Return ONLY the JSON object, nothing else.`;

    try {
        setLoading(true);
        setEvaluationRequested(true);
        
        console.log("Sending evaluation request...");
        await append({
            role: "user",
            content: evaluationPrompt,
        });
    } catch (error) {
        console.error("Error sending evaluation:", error);
        setEvaluationRequested(false);
    } finally {
        setLoading(false);
    }
};

  const renderActionButton = () => {
    if (loading || isLoading) {
        return (
            <button
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded opacity-50"
                disabled
            >
                Loading...
            </button>
        );
    }

    // Show evaluate button if we have a joke that hasn't been evaluated
    const lastMessage = messages[messages.length - 1];
    if (messages.length > 0 && 
        !evaluationRequested && 
        !lastMessage?.content.includes("evaluate this joke") &&
        !state.evaluation) {
        return (
            <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleEvaluateJoke}
            >
                Evaluate Joke
            </button>
        );
    }

    // Show Generate Joke button in all other cases
    return (
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            disabled={!state.topic || !state.tone || !state.type}
            onClick={() => {
                setState(prev => ({ ...prev, evaluation: null }));
                setEvaluationRequested(false);
                append({
                    role: "user",
                    content: `Generate a ${state.type} joke about ${state.topic} in a ${state.tone} tone with a creativity level of ${state.temperature}`,
                });
            }}
        >
            Generate Joke
        </button>
    );
  };

  const renderEvaluation = () => {
    if (!state.evaluation) return null;

    return (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Joke Evaluation</h3>
            <div className="grid grid-cols-2 gap-2">
                <div>Humor: {state.evaluation.humor}</div>
                <div>Appropriateness: {state.evaluation.appropriateness}</div>
                <div>Relevance: {state.evaluation.relevance}</div>
                <div>Creativity: {state.evaluation.creativity}</div>
            </div>
            <div className="mt-2">
                <strong>Summary:</strong> {state.evaluation.summary}
            </div>
        </div>
    );
  };

  const isEvaluationPrompt = (content: string) => {
    return content.includes("evaluate this joke") || 
           content.includes("Return a JSON") ||
           content.includes("humor") ||
           content.includes("appropriateness");
  };

  // Add these utility functions
  const analyzeEvaluationTrends = () => {
    const history = state.evaluationHistory;
    
    // Analyze success by topic
    const topicAnalysis = history.reduce((acc, entry) => {
      const topic = entry.parameters.topic;
      if (!acc[topic]) acc[topic] = [];
      acc[topic].push(entry.evaluation.humor);
      return acc;
    }, {} as Record<string, string[]>);

    // Analyze success by temperature
    const temperatureAnalysis = history.reduce((acc, entry) => {
      const temp = entry.parameters.temperature.toFixed(1);
      if (!acc[temp]) acc[temp] = [];
      acc[temp].push(entry.evaluation.creativity);
      return acc;
    }, {} as Record<string, string[]>);

    return { topicAnalysis, temperatureAnalysis };
  };

  // Add a component to display trends
  const renderAnalytics = () => {
    const jokesCount = state.evaluationHistory.length;
    console.log("Rendering analytics with jokes count:", jokesCount);
    console.log("Current evaluation history:", state.evaluationHistory);

    return (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            {jokesCount < 5 ? (
                <div className="text-center text-gray-600">
                    Generate at least 5 jokes to see analytics
                    ({jokesCount}/5 jokes generated)
                </div>
            ) : (
                // Your analytics display code here
                <div>
                    <h3 className="text-xl font-bold mb-4">Joke Generation Analytics</h3>
                    {/* Add your analytics visualization here */}
                </div>
            )}
        </div>
    );
  };

  useEffect(() => {
    console.log("Evaluation History Updated:", state.evaluationHistory);
    console.log("Current History Count:", state.evaluationHistory.length);
  }, [state.evaluationHistory]);

  useEffect(() => {
    if (state.evaluation) {
        console.log("New evaluation received:", state.evaluation);
    }
  }, [state.evaluation]);

  return (
    <main className="mx-auto w-full p-24 flex flex-col">
      <div className="p-4 m-4">
        <div className="flex flex-col items-center justify-center space-y-8 text-white">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-black">
              Joke Generator App
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Customize your joke by selecting the topic, tone, type, and
              creativity level.
            </p>
          </div>

          {/* Topic Selection */}
          <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold">Topic</h3>
            <div className="flex flex-wrap justify-center">
              {topics.map(({ value, emoji }) => (
                <div
                  key={value}
                  className="p-4 m-2 bg-opacity-25 bg-gray-600 rounded-lg"
                >
                  <input
                    id={value}
                    type="radio"
                    value={value}
                    name="topic"
                    onChange={handleChange}
                  />
                  <label className="ml-2" htmlFor={value}>
                    {`${emoji} ${value}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold">Tone</h3>
            <div className="flex flex-wrap justify-center">
              {tones.map(({ value, emoji }) => (
                <div
                  key={value}
                  className="p-4 m-2 bg-opacity-25 bg-gray-600 rounded-lg"
                >
                  <input
                    id={value}
                    type="radio"
                    value={value}
                    name="tone"
                    onChange={handleChange}
                  />
                  <label className="ml-2" htmlFor={value}>
                    {`${emoji} ${value}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold">Type</h3>
            <div className="flex flex-wrap justify-center">
              {types.map(({ value, emoji }) => (
                <div
                  key={value}
                  className="p-4 m-2 bg-opacity-25 bg-gray-600 rounded-lg"
                >
                  <input
                    id={value}
                    type="radio"
                    value={value}
                    name="type"
                    onChange={handleChange}
                  />
                  <label className="ml-2" htmlFor={value}>
                    {`${emoji} ${value}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold">Creativity Level</h3>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={state.temperature}
              onChange={handleTemperatureChange}
              className="w-full"
            />
            <p className="text-center">{state.temperature}</p>
          </div>

          {/* Generate Button */}
          {renderActionButton()}

          {/* Display the joke */}
          <div
            hidden={
                messages.length === 0 ||
                messages[messages.length - 1]?.content.startsWith("Generate") ||
                isEvaluationPrompt(messages[messages.length - 1]?.content)
            }
            className="bg-opacity-25 bg-gray-700 rounded-lg p-4 text-black"
          >
            {messages.length > 0 && 
                !isEvaluationPrompt(messages[messages.length - 1]?.content) ? 
                messages[messages.length - 1]?.content :
                messages[messages.length - 2]?.content
            }
          </div>

          {/* Display the evaluation */}
          {renderEvaluation()}

          {/* Display analytics */}
          {renderAnalytics()}
        </div>
      </div>
    </main>
  );
}
