import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📞 Webhook Telnyx Voice :", JSON.stringify(body, null, 2));

    const eventType = body.data?.event_type;
    const callControlId = body.data?.payload?.call_control_id;

    if (!eventType || !callControlId) {
      console.log("⚠️ Event incomplet reçu");
      return NextResponse.json({ ok: true });
    }

    // 🟢 1. NOUVEL APPEL ENTRANT
    if (eventType === "call.initiated") {
      console.log("📥 Appel entrant !");

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
              text: "Bonjour, vous êtes bien chez IALynk. Comment puis-je vous aider ?",
            },
          },
        ],
      });
    }

    // 🔴 2. APPPEL TERMINÉ
    if (eventType === "call.hangup") {
      console.log("🔚 L'appel est terminé.");
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("❌ Erreur dans le webhook Telnyx Voice :", error);
    return NextResponse.json({ ok: false });
  }
}
