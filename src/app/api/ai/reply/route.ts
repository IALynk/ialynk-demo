import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messageContent, contact } = await req.json();

    const prompt = `
Tu es l’assistant IA d'une agence immobilière française (IALynk).

Analyse le message ci-dessous et génère EXACTEMENT ce JSON :

{
  "short": "réponse courte",
  "neutral": "réponse neutre professionnelle",
  "formal": "réponse très formelle et complète"
}

Règles :
- Ne change JAMAIS le format JSON.
- Pas de texte avant ou après.
- Les réponses doivent être adaptées au contexte immobilier.
- Utilise le prénom du contact si disponible.
- Pas de phrases trop longues pour la réponse courte.
- La version formelle doit être impeccable et structurée.

Message reçu :
"${messageContent}"

Informations contact :
${JSON.stringify(contact, null, 2)}
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un assistant immobilier professionnel." },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content;

    // Le modèle renvoie déjà un JSON, mais on sécurise au cas où
    const parsed = JSON.parse(raw || "{}");

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Erreur IA :", error);

    return new Response(
      JSON.stringify({
        error: "Erreur lors de la génération IA",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
