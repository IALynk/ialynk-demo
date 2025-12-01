import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("📞 Telnyx event reçu :", JSON.stringify(body, null, 2));

  const eventType = body.data?.event_type;
  const callControlId = body.data?.payload?.call_control_id;

  if (!eventType || !callControlId) {
    console.log("⚠️ Event Telnyx invalide.");
    return NextResponse.json({ ok: true });
  }

  // --- 1️⃣ APPEL ENTRANT ---
  if (eventType === "call.initiated") {
    console.log("📥 Nouvel appel !");

    return NextResponse.json({
      instructions: [
        {
          type: "answer",
          call_control_id: callControlId,
        },
        {
          type: "speak",
          call_control_id: callControlId,
          payload: {
            voice: "female",
            language: "fr-FR",
            text: "Bonjour, je suis l’assistante I A Lynk. Comment puis je vous aider ?",
          },
        },
        {
          type: "record_start",
          call_control_id: callControlId,
        },
      ],
    });
  }

  // --- 2️⃣ FIN DE L’ENREGISTREMENT ---
  if (eventType === "call.recording.saved") {
    const fileUrl = body.data?.payload?.recording_urls?.wav;

    if (!fileUrl) {
      console.log("⚠️ Aucun fichier audio reçu.");
      return NextResponse.json({ ok: true });
    }

    console.log("🎙️ Audio :", fileUrl);

    // Télécharger le fichier audio
    const audioResponse = await fetch(fileUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioFile = new File([audioBuffer], "audio.wav", {
      type: "audio/wav",
    });

    // Transcription OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const transcript = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "chatgpt_5.1-transcribe",
    });

    const text = transcript.text || "";
    console.log("🗣️ Transcription :", text);

    // IA réponse
    const chat = await openai.chat.completions.create({
      model: "chatgpt-5.1",
      messages: [
        {
          role: "system",
          content: "Tu es IALynk, assistante immobilière française professionnelle.",
        },
        { role: "user", content: text },
      ],
    });

    const aiReply = chat.choices[0].message.content;

    console.log("🤖 Réponse IA :", aiReply);

    return NextResponse.json({
      instructions: [
        {
          type: "speak",
          call_control_id: callControlId,
          payload: {
            voice: "female",
            language: "fr-FR",
            text: aiReply,
          },
        },
        {
          type: "hangup",
          call_control_id: callControlId,
        },
      ],
    });
  }

  return NextResponse.json({ ok: true });
}
