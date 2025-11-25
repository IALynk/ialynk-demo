import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient"; // OK

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es l’assistant IA officiel d’IALynk. Tu aides les professionnels de l’immobilier à gérer leurs biens, locataires et clients avec un ton professionnel et précis.",
        },
        ...messages,
      ],
    });

    const reply =
      completion.choices[0]?.message?.content || "Aucune réponse générée.";

    console.log("✅ Réponse IA :", reply);

    // Sauvegarde dans Supabase
    await supabase.from("messages").insert([
      {
        role: "user",
        content: messages[messages.length - 1].content,
      },
      {
        role: "assistant",
        content: reply,
      },
    ]);

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("❌ Erreur API Assistant :", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération de la réponse.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
