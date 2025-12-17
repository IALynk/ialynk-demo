// src/app/api/twilio/voice/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { twiml } from "twilio";

export async function POST(req: Request) {
  const response = new twiml.VoiceResponse();

  try {
    // 🔹 Twilio envoie du x-www-form-urlencoded
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);

    const recordingUrl = params.get("RecordingUrl");

    // =========================
    // 1️⃣ APPEL ENTRANT (1er passage)
    // =========================
    if (!recordingUrl) {
      response.say(
        { voice: "alice", language: "fr-FR" },
        "Bonjour, je suis l’assistante IALynk. Comment puis-je vous aider ?"
      );

      response.record({
        timeout: 5,
        maxLength: 30,
        playBeep: true,

        // 🔴 URL ABSOLUE OBLIGATOIRE
        action: "https://www.ialynk.fr/api/twilio/voice",
        method: "POST",

        // 🔴 CALLBACK ENREGISTREMENT (OBLIGATOIRE)
        recordingStatusCallback: "https://www.ialynk.fr/api/twilio/voice",
        recordingStatusCallbackMethod: "POST",
      });

      return new NextResponse(response.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // =========================
    // 2️⃣ ENREGISTREMENT TERMINÉ
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

    // 🎙️ Transcription
    const transcript = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "chatgpt_5.1-transcribe",
    });

    const userText = transcript.text?.trim() || "";

    if (!userText) {
      response.say(
        { voice: "alice", language: "fr-FR" },
        "Je suis désolée, je n’ai rien entendu."
      );
      response.hangup();

      return new NextResponse(response.toString(), {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // 🤖 Réponse IA
    const chat = await openai.chat.completions.create({
      model: "chatgpt-5.1",
      messages: [
        {
          role: "system",
          content:
            "Tu es IALynk, assistante immobilière professionnelle en France.",
        },
        { role: "user", content: userText },
      ],
    });

    const aiReply =
      chat.choices[0]?.message?.content ||
      "Je n’ai pas compris votre demande.";

    response.say(
      { voice: "alice", language: "fr-FR" },
      aiReply
    );
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
