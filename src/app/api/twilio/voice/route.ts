// src/app/api/twilio/voice/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { twiml } from "twilio";

// 🔒 Limite pour éviter les réponses trop longues en vocal
function limitVoice(text: string, max = 280) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export async function POST(req: Request) {
  const response = new twiml.VoiceResponse();

  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const recordingUrl = params.get("RecordingUrl");

    // =========================
    // 1️⃣ APPEL ENTRANT
    // =========================
    if (!recordingUrl) {
      response.say(
        { voice: "alice", language: "fr-FR" },
        "Bonjour, je suis l’assistante IA Link. Comment puis-je vous aider aujourd’hui ?"
      );

      response.record({
        timeout: 5,
        maxLength: 30,
        playBeep: true,

        action: "https://www.ialynk.fr/api/twilio/voice",
        method: "POST",

        recordingStatusCallback: "https://www.ialynk.fr/api/twilio/voice",
        recordingStatusCallbackMethod: "POST",

        // 🔴 CRUCIAL : empêche Twilio de couper l'audio trop tôt
        trim: "do-not-trim",
      });

      return new NextResponse(response.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // =========================
    // 2️⃣ TRANSCRIPTION
    // =========================
    const audioUrl = `${recordingUrl}.wav`;
    const audioResponse = await fetch(audioUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioFile = new File([audioBuffer], "audio.wav", {
      type: "audio/wav",
    });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const transcript = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "chatgpt_5.1-transcribe",
    });

    const userText = transcript.text?.trim() || "";

    if (!userText) {
      response.say(
        { voice: "alice", language: "fr-FR" },
        "Je suis désolée, je n’ai rien entendu. Pouvez-vous reformuler ?"
      );
      response.hangup();

      return new NextResponse(response.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // =========================
    // 3️⃣ IA MÉTIER IMMOBILIER
    // =========================
    const chat = await openai.chat.completions.create({
      model: "chatgpt-5.1",
      messages: [
        {
          role: "system",
          content: `
Tu es IA Link, assistante téléphonique immobilière professionnelle en France.

RÈGLES ABSOLUES :
- Tu réponds TOUJOURS en français
- Tu fais des réponses COURTES (1 à 2 phrases max)
- Tu parles naturellement, comme une humaine
- Tu poses TOUJOURS une question utile
- Tu aides à qualifier le besoin

INTENTIONS À IDENTIFIER :
- location
- achat
- vente
- problème locataire
- rendez-vous
- urgence

FORMAT DE RÉPONSE :
Phrase 1 : réponse claire et rassurante
Phrase 2 : question de qualification
          `,
        },
        { role: "user", content: userText },
      ],
    });

    const aiReply =
      chat.choices[0]?.message?.content ||
      "Pouvez-vous préciser votre demande, s’il vous plaît ?";

    response.say(
      { voice: "alice", language: "fr-FR" },
      limitVoice(aiReply)
    );

    // 🔴 On raccroche SEULEMENT après la réponse
    response.hangup();

    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });

  } catch (error) {
    console.error("❌ TWILIO ERROR:", error);

    response.say(
      { voice: "alice", language: "fr-FR" },
      "Une erreur est survenue. Veuillez réessayer plus tard."
    );
    response.hangup();

    return new NextResponse(response.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
