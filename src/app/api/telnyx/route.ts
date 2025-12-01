import { NextResponse } from "next/server";
import OpenAI from "openai";

function cmd() {
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

export async function GET() {
  return NextResponse.json({ status: "OK TELNYX ROUTE" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📞 Telnyx event reçu :", JSON.stringify(body, null, 2));

    const eventType = body.data?.event_type;
    const callControlId = body.data?.payload?.call_control_id;

    if (!eventType || !callControlId) {
      return NextResponse.json({ ok: true });
    }

    // 1️⃣ APPEL ENTRANT
    if (eventType === "call.initiated") {
      return NextResponse.json({
        instructions: [
          {
            type: "answer",
            call_control_id: callControlId,
            command_id: cmd(),
          },
          {
            type: "speak",
            call_control_id: callControlId,
            command_id: cmd(),
            voice: "female",
            language: "fr-FR",
            payload: "Bonjour, je suis l’assistante IALynk. Comment puis-je vous aider ?",
          },
          {
            type: "record_start",
            call_control_id: callControlId,
            command_id: cmd(),
          },
        ],
      });
    }

    // 2️⃣ ENREGISTREMENT TERMINÉ
    if (eventType === "call.recording.saved") {
      const fileUrl = body.data?.payload?.recording_urls?.wav;
      if (!fileUrl) return NextResponse.json({ ok: true });

      const audioResponse = await fetch(fileUrl);
      const audioBuffer = await audioResponse.arrayBuffer();
      const audioFile = new File([audioBuffer], "audio.wav", { type: "audio/wav" });

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

      const transcript = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "chatgpt_5.1-transcribe",
      });

      const text = transcript.text || "";

      if (text.trim().length === 0) {
        return NextResponse.json({
          instructions: [
            {
              type: "speak",
              call_control_id: callControlId,
              command_id: cmd(),
              voice: "female",
              language: "fr-FR",
              payload: "Je suis désolée, je n’ai rien entendu.",
            },
            {
              type: "hangup",
              call_control_id: callControlId,
              command_id: cmd(),
            },
          ],
        });
      }

      const aiChat = await openai.chat.completions.create({
        model: "chatgpt-5.1",
        messages: [
          {
            role: "system",
            content: "Tu es IALynk, assistante immobilière professionnelle.",
          },
          { role: "user", content: text },
        ],
      });

      const aiReply = aiChat.choices[0].message.content || "Je n'ai pas compris.";

      return NextResponse.json({
        instructions: [
          {
            type: "speak",
            call_control_id: callControlId,
            command_id: cmd(),
            voice: "female",
            language: "fr-FR",
            payload: aiReply,
          },
          {
            type: "hangup",
            call_control_id: callControlId,
            command_id: cmd(),
          },
        ],
      });
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.log("❌ ERREUR :", error);
    return NextResponse.json({ ok: false });
  }
}
