import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const PRESTATIONS = [
  "Site web",
  "Refonte de site web",
  "SEO / Référencement",
  "Campagne Google Ads",
  "Campagne Meta Ads",
  "Identité visuelle / Branding",
  "Community Management",
  "Email marketing",
  "Application mobile",
  "Pack maintenance",
  "Audit & conseil",
];

const SYSTEM_PROMPT = `Tu es un assistant qui analyse des contrats clients pour l'Agence de l'Ombre, une agence de communication digitale française.
Tu extrais les informations structurées et retournes UNIQUEMENT un objet JSON valide, sans markdown, sans explication, sans balises de code.`;

const USER_PROMPT = `Analyse ce contrat et extrais les informations suivantes. Retourne UNIQUEMENT du JSON valide.

Structure exacte attendue :
{
  "company_name": "Nom de l'entreprise cliente",
  "contact_name": "Nom complet du contact/signataire",
  "email": "adresse email ou null",
  "phone": "numéro de téléphone ou null",
  "website": "URL du site web ou null",
  "prestations": [],
  "presta_start_date": "YYYY-MM-DD ou null",
  "presta_end_date": "YYYY-MM-DD ou null",
  "budget": null,
  "client_status": "actif",
  "notes": "informations importantes (clauses particulières, demandes spéciales) ou null"
}

Pour le champ "prestations", utilise UNIQUEMENT les valeurs de cette liste :
${PRESTATIONS.map((p) => `- "${p}"`).join("\n")}

Pour "client_status", utilise : "prospect", "actif", "pause" ou "terminé".
Pour "budget", retourne le montant numérique HT en euros, ou null si non trouvé.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY non configurée." }, { status: 500 });
  }

  const { base64, mediaType } = await request.json() as { base64: string; mediaType: string };

  const client = new Anthropic({ apiKey });

  const isText = mediaType === "text/plain";

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          isText
            ? { type: "text", text: `Contenu du contrat :\n\n${atob(base64)}` }
            : {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64 },
              } as Anthropic.DocumentBlockParam,
          { type: "text", text: USER_PROMPT },
        ],
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    return NextResponse.json({ data: parsed });
  } catch {
    return NextResponse.json({ error: "Impossible de parser la réponse de Claude.", raw }, { status: 422 });
  }
}
