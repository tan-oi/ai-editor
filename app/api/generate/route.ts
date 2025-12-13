import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { contextText, style, isSelection } = await request.json();

    const stylePrompts = {
      auto: "Continue writing naturally, maintaining the existing tone and style.",
      professional:
        "Continue writing in a formal, professional, business-appropriate tone with clear structure and precise language.",
      creative:
        "Continue writing in a creative, imaginative, and expressive way with vivid descriptions and engaging narrative.",
      casual:
        "Continue writing in a casual, friendly, conversational tone as if talking to a friend.",
    };

    const modeInstruction = isSelection
      ? "The user has selected specific text. Expand on this selection, elaborate the ideas, or provide additional detail related to what they've highlighted."
      : "Continue writing seamlessly from where the user left off, maintaining narrative flow and coherence.";

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a writing assistant. ${
            stylePrompts[style as keyof typeof stylePrompts]
          } ${modeInstruction} 

Rules:
- Provide ONLY the continuation text, no preamble, no explanation, no meta-commentary
- Write 2-4 sentences that flow naturally from the context
- Do NOT repeat or rephrase what's already written
- Start writing immediately, as if you're the next word in the document`,
        },
        {
          role: "user",
          content: isSelection
            ? `Expand on this selected text:\n\n${contextText}`
            : `Continue writing after:\n\n${contextText}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate text" },
      { status: 500 }
    );
  }
}
