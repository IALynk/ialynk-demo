import { NextResponse } from "next/server";
import OpenAI from "openai";

// Telnyx envoie les données en JSON
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📞 Appel Telnyx reçu :", body);

    // 1️⃣ Récupérer l’URL de l’audio Telnyx
    const recordingUrl = body.data?.payload?.recording_urls?.wav;

    if (!recordingUrl) {
      console.log("⚠️ Aucun audio reçu !");
    }

    // 2️⃣ Télécharger le fichier audio
    const audioResponse = await fetch(recordingUrl);
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioFile = new File([audioBuffer], "call.wav", {
      type: "audio/wav",
    });

    // 3️⃣ Transcription avec OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "chatgpt_5.1-transcribe", // meilleur modèle transcription
    });

    const text = transcription.text;
    console.log("🗣️ Texte détecté :", text);

    // 4️⃣ Réponse IA (model : ChatGPT 5.1)
    const chat = await openai.chat.completions.create({
      model: "chatgpt-5.1",
      messages: [
        {
          role: "system",
          content:
            "Tu es IALynk, une assistante immobilière française professionnelle, chaleureuse et efficace. "
            + "Tu aides les appelants pour les locations, visites, disponibilités et informations sur les logements.",
        },
        { role: "user", content: text },
      ],
    });

    const aiReply = chat.choices[0].message.content || "Je n’ai pas compris.";

    console.log("🤖 Réponse IA :", aiReply);

    // 5️⃣ Construire une réponse Telnyx (TXML)
    const responseXml = `
      <Response>
        <Say voice="female" language="fr-FR">${aiReply}</Say>
        <Hangup/>
      </Response>
    `;

    return new NextResponse(responseXml, {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("❌ Erreur Telnyx :", error);

    const fallbackXml = `
      <Response>
        <Say voice="female" language="fr-FR">
          Je rencontre un problème technique. Veuillez rappeler plus tard.
        </Say>
      </Response>
    `;

    return new NextResponse(fallbackXml, {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
