import { NextResponse } from "next/server";
import OpenAI from "openai";

// ➜ Endpoint GET pour vérifier que l’API existe
export async function GET() {
  return NextResponse.json({ status: "OK TELNYX ROUTE" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📞 Telnyx event reçu :", JSON.stringify(body, null, 2));

    const eventType = body.data?.event_type;
    const callControlId = body.data?.payload?.call_control_id;

    // Sécurité si données manquantes
    if (!eventType || !callControlId) {
      console.log("⚠️ Event Telnyx invalide ou incomplet.");
      return NextResponse.json({ ok: true });
    }

    // ------------------------------------------------------
    // 1️⃣ EVENT : NOUVEL APPEL
    // ------------------------------------------------------
    if (eventType === "call.initiated") {
      console.log("📥 Nouvel appel entrant !");

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
              text: "Bonjour, je suis l’assistante I A Lynk. Comment puis-je vous aider ?",
            },
          },
          {
            type: "record_start",
            call_control_id: callControlId,
          },
        ],
      });
    }

    // ------------------------------------------------------
    // 2️⃣ EVENT : ENREGISTREMENT TERMINÉ
    // ------------------------------------------------------
    if (eventType === "call.recording.saved") {
      const fileUrl = body.data?.payload?.recording_urls?.wav;

      if (!fileUrl) {
        console.log("⚠️ Aucun fichier audio reçu (fileUrl manquant).");
        return NextResponse.json({ ok: true });
      }

      console.log("🎙️ Fichier audio reçu :", fileUrl);

      // --- Télécharger le fichier audio ---
      const audioResponse = await fetch(fileUrl);

      if (!audioResponse.ok) {
        console.log("❌ Impossible de télécharger l'audio :", audioResponse.status);
        return NextResponse.json({ ok: false });
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      const audioFile = new File([audioBuffer], "audio.wav", { type: "audio/wav" });

      // --- Transcription via OpenAI ---
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

      console.log("⏳ Transcription en cours...");

      const transcript = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "chatgpt_5.1-transcribe",
      });

      const text = transcript.text || "";
      console.log("🗣️ Texte transcrit :", text);

      // Si rien n’est dit → réponse basique
      if (text.trim().length === 0) {
        return NextResponse.json({
          instructions: [
            {
              type: "speak",
              call_control_id: callControlId,
              payload: {
                voice: "female",
                language: "fr-FR",
                text: "Je suis désolée, je n’ai rien entendu.",
              },
            },
            {
              type: "hangup",
              call_control_id: callControlId,
            },
          ],
        });
      }

      // --- Génération réponse IA ---
      const chat = await openai.chat.completions.create({
        model: "chatgpt-5.1",
        messages: [
          {
            role: "system",
            content:
              "Tu es IALynk, assistante immobilière française professionnelle, chaleureuse, concise et efficace.",
          },
          { role: "user", content: text },
        ],
      });

      const aiReply = chat.choices[0].message.content || "Je n’ai pas compris.";

      console.log("🤖 Réponse IA générée :", aiReply);

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

    // Si l'événement n'est pas géré
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("❌ ERREUR GLOBALE TELNYX :", error);
    return NextResponse.json({ ok: false, error: "Internal Telnyx error" });
  }
}
