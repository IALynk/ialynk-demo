import { NextResponse } from "next/server";
import OpenAI from "openai";
import { twiml } from "twilio";

function limitVoice(text: string, max = 220) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export async function POST(req: Request) {
  const response = new twiml.VoiceResponse();

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const speechResult = params.get("SpeechResult");

    // =========================
    // 1️⃣ PREMIER PASSAGE → ÉCOUTE
    // =========================
    if (!speechResult) {
      const gather = response.gather({
        input: ["speech"],
        language: "fr-FR",
        speechTimeout: "auto",
        action: "https://www.ialynk.fr/api/twilio/voice",
        method: "POST",
      });

      gather.say(
        { voice: "alice", language: "fr-FR" },
        "Bonjour, je suis l’assistante IALynk. Comment puis-je vous aider ?"
      );

      return new NextResponse(response.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // =========================
    // 2️⃣ TEXTE COMPRIS
    // =========================
    const userText = speechResult.trim();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // =========================
    // 3️⃣ IA IMMOBILIÈRE
    // =========================
    const chat = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content: `
Tu es IALynk, assistante téléphonique immobilière professionnelle en France.

RÈGLES :
- Français uniquement
- 1 à 2 phrases max
- Ton naturel et humain
- Toujours poser UNE question de qualification

INTENTIONS :
- location
- achat
- vente
- problème locataire
- rendez-vous
- urgence
          `,
        },
        { role: "user", content: userText },
      ],
    });

    const aiReply =
      chat.choices[0]?.message?.content ||
      "Pouvez-vous préciser votre demande, s’il vous plaît ?";

    // =========================
    // 4️⃣ RÉPONSE + RELANCE ÉCOUTE
    // =========================
    response.say(
      { voice: "alice", language: "fr-FR" },
      limitVoice(aiReply)
    );

    response.redirect("https://www.ialynk.fr/api/twilio/voice");

    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });

  } catch (error) {
    console.error("❌ TWILIO ERROR:", error);

    response.say(
      { voice: "alice", language: "fr-FR" },
      "Désolée, une erreur technique est survenue."
    );

    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
