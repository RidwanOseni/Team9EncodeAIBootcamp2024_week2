"use client";

import { useState } from "react";
import { useChat } from "ai/react";

export default function JokeGenerator() {
  const { messages, append, isLoading } = useChat();

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

  const [state, setState] = useState({
    topic: "",
    tone: "",
    type: "",
    temperature: 0.7,
  });

  const handleChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      temperature: parseFloat(e.target.value),
    });
  };

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
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            disabled={isLoading || !state.topic || !state.tone || !state.type}
            onClick={() =>
              append({
                role: "user",
                content: `Generate a ${state.type} joke on ${state.topic} in a ${state.tone} tone with a creativity level of ${state.temperature}`,
              })
            }
          >
            Generate Joke
          </button>

          {/* Display the joke and its evaluation */}
          <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
            {messages.map((m) => (
              <div key={m.id} className="whitespace-pre-wrap">
                {m.role === "user" ? "User: " : "AI: "}
                {m.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
