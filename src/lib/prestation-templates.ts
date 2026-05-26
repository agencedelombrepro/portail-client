export interface MilestoneTemplate {
  title: string;
  due_offset_days: number; // jours depuis presta_start_date
}

export interface ProjectTemplate {
  name: string;
  description: string;
  start_offset_days: number; // début du projet relatif à la signature
  end_offset_days: number;   // fin du projet
  milestones: MilestoneTemplate[];
}

// Chronologie Agence de l'Ombre — contrat 90 jours
//
// J+0  → J+7  : Identité visuelle, Fiche Google, Audit SEO (simultané)
// J+7  → J+30 : Site web (démarre après ID visuelle)
// J+14 → J+28 : Stratégie réseaux sociaux (CM)
// J+30 → J+90 : SEO ongoing, CM publication, Ads continu

export const PRESTATION_TEMPLATES: Record<string, ProjectTemplate[]> = {

  // ─── SITE WEB (J+7 → J+30, démarre après identité visuelle) ───
  "Site web": [
    {
      name: "Maquette du site",
      description: "Phase de conception et de design du site web",
      start_offset_days: 7,
      end_offset_days: 16,
      milestones: [
        { title: "Récupération des accès et supports clients",      due_offset_days: 8  },
        { title: "Réception des photos et contenus client",         due_offset_days: 9  },
        { title: "Avatar client & brief de marque",                 due_offset_days: 10 },
        { title: "Démarrage de la maquette",                       due_offset_days: 11 },
        { title: "Présentation de la maquette au client",          due_offset_days: 14 },
        { title: "Intégration des retours sur la maquette",        due_offset_days: 15 },
        { title: "Livraison de la maquette validée",               due_offset_days: 16 },
      ],
    },
    {
      name: "Site final",
      description: "Phase de développement et mise en ligne",
      start_offset_days: 16,
      end_offset_days: 30,
      milestones: [
        { title: "Intégration de la maquette",                     due_offset_days: 19 },
        { title: "Intégration des contenus",                       due_offset_days: 21 },
        { title: "Optimisation mobile & responsive",               due_offset_days: 23 },
        { title: "Nom de domaine & hébergement",                   due_offset_days: 24 },
        { title: "Déploiement en production",                      due_offset_days: 27 },
        { title: "Indexation Google (Search Console)",             due_offset_days: 28 },
        { title: "Corrections des retours clients",                due_offset_days: 29 },
        { title: "Recette finale & livraison",                     due_offset_days: 30 },
      ],
    },
  ],

  get "Refonte de site web"() { return this["Site web"]; },

  // ─── SEO (Audit J+0→J+7, puis sprints J+30→J+90) ───
  "SEO / Référencement": [
    {
      name: "Audit SEO",
      description: "Diagnostic complet de la situation SEO actuelle",
      start_offset_days: 0,
      end_offset_days: 7,
      milestones: [
        { title: "Audit technique (vitesse, mobile, HTTPS)",        due_offset_days: 2 },
        { title: "Analyse des mots-clés actuels",                   due_offset_days: 3 },
        { title: "Étude de la concurrence SEO",                     due_offset_days: 5 },
        { title: "Analyse du profil de liens (backlinks)",          due_offset_days: 6 },
        { title: "Livraison du rapport d'audit SEO",                due_offset_days: 7 },
      ],
    },
    {
      name: "Optimisation On-Page",
      description: "Optimisations techniques et éditoriales — sprint J+30→J+60",
      start_offset_days: 30,
      end_offset_days: 60,
      milestones: [
        { title: "Sélection des mots-clés cibles",                  due_offset_days: 33 },
        { title: "Optimisation des balises title & meta",           due_offset_days: 38 },
        { title: "Optimisation des titres H1/H2/H3",               due_offset_days: 42 },
        { title: "Création de contenus optimisés",                  due_offset_days: 50 },
        { title: "Netlinking & backlinks — sprint 1",               due_offset_days: 45 },
        { title: "Netlinking & backlinks — sprint 2",               due_offset_days: 58 },
        { title: "Rapport intermédiaire SEO",                       due_offset_days: 60 },
      ],
    },
    {
      name: "Suivi & Reporting SEO",
      description: "Suivi des positions et reporting de fin de mission",
      start_offset_days: 60,
      end_offset_days: 90,
      milestones: [
        { title: "Analyse des résultats et positions",              due_offset_days: 70 },
        { title: "Corrections & optimisations finales",             due_offset_days: 80 },
        { title: "Rapport de fin de mission SEO",                   due_offset_days: 90 },
      ],
    },
  ],

  // ─── CAMPAGNE GOOGLE ADS (Kathleen — planning indépendant) ───
  "Campagne Google Ads": [
    {
      name: "Setup & Création de campagne Google Ads",
      description: "Configuration et lancement des campagnes Google Ads",
      start_offset_days: 0,
      end_offset_days: 14,
      milestones: [
        { title: "Accès au compte Google Ads",                      due_offset_days: 2  },
        { title: "Recherche et sélection des mots-clés",            due_offset_days: 5  },
        { title: "Création des annonces",                           due_offset_days: 8  },
        { title: "Paramétrage des conversions",                     due_offset_days: 10 },
        { title: "Lancement des campagnes",                         due_offset_days: 14 },
      ],
    },
    {
      name: "Optimisation & Reporting Google Ads",
      description: "Optimisation continue et reporting mensuel",
      start_offset_days: 14,
      end_offset_days: 90,
      milestones: [
        { title: "Analyse des premières performances",              due_offset_days: 21 },
        { title: "Optimisation des enchères et audiences",          due_offset_days: 35 },
        { title: "Rapport de performance mensuel #1",               due_offset_days: 45 },
        { title: "Test A/B des annonces",                           due_offset_days: 55 },
        { title: "Rapport de performance mensuel #2",               due_offset_days: 75 },
        { title: "Rapport final & recommandations",                 due_offset_days: 90 },
      ],
    },
  ],

  // ─── CAMPAGNE META ADS (Kathleen — planning indépendant) ───
  "Campagne Meta Ads": [
    {
      name: "Setup Meta Ads",
      description: "Configuration du Business Manager et du pixel",
      start_offset_days: 0,
      end_offset_days: 14,
      milestones: [
        { title: "Accès au Business Manager",                       due_offset_days: 2  },
        { title: "Installation du Pixel Meta",                      due_offset_days: 4  },
        { title: "Création des audiences",                          due_offset_days: 7  },
        { title: "Réception des visuels et vidéos",                 due_offset_days: 10 },
        { title: "Lancement des campagnes",                         due_offset_days: 14 },
      ],
    },
    {
      name: "Optimisation & Reporting Meta Ads",
      description: "Optimisation continue et reporting mensuel",
      start_offset_days: 14,
      end_offset_days: 90,
      milestones: [
        { title: "Analyse J+7 et ajustements",                      due_offset_days: 21 },
        { title: "Optimisation des créatifs",                       due_offset_days: 35 },
        { title: "Rapport de performance mensuel #1",               due_offset_days: 45 },
        { title: "Test A/B des visuels",                            due_offset_days: 55 },
        { title: "Rapport de performance mensuel #2",               due_offset_days: 75 },
        { title: "Rapport final & recommandations",                 due_offset_days: 90 },
      ],
    },
  ],

  // ─── IDENTITÉ VISUELLE (J+0 → J+7, commence dès la signature) ───
  "Identité visuelle / Branding": [
    {
      name: "Identité Visuelle",
      description: "Création de l'identité graphique complète",
      start_offset_days: 0,
      end_offset_days: 7,
      milestones: [
        { title: "Réception du brief client & questionnaire",       due_offset_days: 1 },
        { title: "Recherches & moodboard",                          due_offset_days: 3 },
        { title: "Présentation du moodboard au client",             due_offset_days: 4 },
        { title: "Création du logo (3 propositions)",               due_offset_days: 5 },
        { title: "Validation du logo",                              due_offset_days: 6 },
        { title: "Charte graphique & déclinaisons",                 due_offset_days: 7 },
        { title: "Livraison des fichiers sources (AI, SVG, PNG)",   due_offset_days: 7 },
      ],
    },
  ],

  // ─── COMMUNITY MANAGEMENT (stratégie J+14→J+28, publication J+30→J+90) ───
  "Community Management": [
    {
      name: "Identité Visuelle des réseaux",
      description: "Mise en place de l'identité graphique sur les réseaux",
      start_offset_days: 14,
      end_offset_days: 21,
      milestones: [
        { title: "Récupération des accès réseaux sociaux",          due_offset_days: 14 },
        { title: "Audit des comptes existants",                     due_offset_days: 15 },
        { title: "Création des templates de publications",          due_offset_days: 18 },
        { title: "Création des templates stories",                  due_offset_days: 20 },
        { title: "Livraison de l'identité réseaux validée",         due_offset_days: 21 },
      ],
    },
    {
      name: "Stratégie & Calendrier éditorial",
      description: "Définition de la stratégie de contenu — semaines 3 & 4",
      start_offset_days: 14,
      end_offset_days: 28,
      milestones: [
        { title: "Analyse SEO des réseaux (bio, hashtags)",         due_offset_days: 16 },
        { title: "Optimisation des profils",                        due_offset_days: 18 },
        { title: "Définition de la stratégie de contenu",          due_offset_days: 21 },
        { title: "Création du calendrier éditorial",               due_offset_days: 24 },
        { title: "Création du contenu du 1er mois",               due_offset_days: 26 },
        { title: "Validation client du contenu",                    due_offset_days: 27 },
        { title: "Planification et publication — lancement",        due_offset_days: 28 },
      ],
    },
    {
      name: "Gestion des réseaux sociaux",
      description: "Animation mensuelle et reporting",
      start_offset_days: 30,
      end_offset_days: 90,
      milestones: [
        { title: "Rapport mensuel #1 — résultats & ajustements",    due_offset_days: 60 },
        { title: "Rapport mensuel #2 — bilan final",                due_offset_days: 90 },
      ],
    },
    {
      name: "Fiche Google Établissement",
      description: "Optimisation et animation de la fiche Google",
      start_offset_days: 0,
      end_offset_days: 7,
      milestones: [
        { title: "Récupération des accès Google Business",          due_offset_days: 1 },
        { title: "Audit de la fiche existante",                     due_offset_days: 2 },
        { title: "Optimisation complète de la fiche",               due_offset_days: 5 },
        { title: "Ajout de photos et stratégie de posts GMB",       due_offset_days: 6 },
        { title: "Mise en place collecte d'avis clients",           due_offset_days: 7 },
      ],
    },
  ],

  // ─── EMAIL MARKETING (J+0 → J+30) ───
  "Email marketing": [
    {
      name: "Setup Email Marketing",
      description: "Configuration de la plateforme et template",
      start_offset_days: 0,
      end_offset_days: 14,
      milestones: [
        { title: "Configuration plateforme (Brevo, Mailchimp…)",    due_offset_days: 3  },
        { title: "Configuration domaine d'envoi (DKIM, SPF)",       due_offset_days: 5  },
        { title: "Import et nettoyage liste contacts",              due_offset_days: 8  },
        { title: "Mise en conformité RGPD",                         due_offset_days: 10 },
        { title: "Création du template email brandé",               due_offset_days: 14 },
      ],
    },
    {
      name: "Stratégie & Campagnes Email",
      description: "Création et envoi des campagnes",
      start_offset_days: 14,
      end_offset_days: 90,
      milestones: [
        { title: "Calendrier éditorial email",                      due_offset_days: 18 },
        { title: "Campagne email #1 — envoi",                       due_offset_days: 30 },
        { title: "Rapport campagne #1 (taux d'ouverture, clics)",   due_offset_days: 35 },
        { title: "Campagne email #2 — envoi",                       due_offset_days: 60 },
        { title: "Rapport campagne #2",                             due_offset_days: 65 },
        { title: "Rapport final & recommandations",                 due_offset_days: 90 },
      ],
    },
  ],

  // ─── APPLICATION MOBILE (planning flexible 90 jours) ───
  "Application mobile": [
    {
      name: "Conception UX/UI",
      description: "Design de l'application mobile",
      start_offset_days: 0,
      end_offset_days: 30,
      milestones: [
        { title: "Brief & cahier des charges",                      due_offset_days: 5  },
        { title: "Wireframes basse fidélité",                       due_offset_days: 12 },
        { title: "Maquette UI haute fidélité",                      due_offset_days: 21 },
        { title: "Prototype cliquable",                             due_offset_days: 26 },
        { title: "Validation client",                               due_offset_days: 30 },
      ],
    },
    {
      name: "Développement",
      description: "Développement et tests de l'application",
      start_offset_days: 30,
      end_offset_days: 75,
      milestones: [
        { title: "Architecture technique",                          due_offset_days: 35 },
        { title: "Fonctionnalités core — sprint 1",                 due_offset_days: 50 },
        { title: "Fonctionnalités core — sprint 2",                 due_offset_days: 65 },
        { title: "Tests et corrections",                            due_offset_days: 73 },
        { title: "Beta testeurs",                                   due_offset_days: 75 },
      ],
    },
    {
      name: "Déploiement & Lancement",
      description: "Publication sur les stores",
      start_offset_days: 75,
      end_offset_days: 90,
      milestones: [
        { title: "Soumission App Store & Google Play",              due_offset_days: 80 },
        { title: "Formation client",                                due_offset_days: 85 },
        { title: "Livraison documentation",                         due_offset_days: 88 },
        { title: "Support post-lancement",                          due_offset_days: 90 },
      ],
    },
  ],

  // ─── PACK MAINTENANCE (J+30 → J+90, après livraison du site) ───
  "Pack maintenance": [
    {
      name: "Maintenance & Suivi",
      description: "Maintenance régulière et monitoring du site",
      start_offset_days: 30,
      end_offset_days: 90,
      milestones: [
        { title: "Mise en place monitoring & accès",                due_offset_days: 33 },
        { title: "Mises à jour CMS, plugins et thèmes — #1",       due_offset_days: 45 },
        { title: "Rapport mensuel de maintenance #1",               due_offset_days: 60 },
        { title: "Mises à jour CMS, plugins et thèmes — #2",       due_offset_days: 75 },
        { title: "Rapport mensuel de maintenance #2",               due_offset_days: 90 },
      ],
    },
  ],

  // ─── AUDIT & CONSEIL (J+0 → J+14) ───
  "Audit & conseil": [
    {
      name: "Audit Complet",
      description: "Diagnostic 360° de la présence digitale",
      start_offset_days: 0,
      end_offset_days: 14,
      milestones: [
        { title: "Réunion de lancement & collecte d'informations",  due_offset_days: 2  },
        { title: "Audit du site web (technique, UX, SEO)",         due_offset_days: 5  },
        { title: "Audit des réseaux sociaux",                       due_offset_days: 7  },
        { title: "Audit de la publicité en ligne",                  due_offset_days: 9  },
        { title: "Analyse de la concurrence digitale",             due_offset_days: 11 },
        { title: "Synthèse et rédaction du rapport",               due_offset_days: 13 },
        { title: "Présentation des recommandations",               due_offset_days: 14 },
      ],
    },
  ],
};

// ─── PLANNING PAIEMENTS ───────────────────────────────────────────
// Offsets (en jours) selon le nombre de versements
// Le travail dure 90 jours mais les paiements peuvent s'étaler au-delà
export function getPaymentOffsets(count: number): number[] {
  switch (count) {
    case 1:  return [0];
    case 2:  return [0, 45];
    case 3:  return [0, 30, 60];
    case 4:  return [0, 30, 60, 90];
    case 6:  return [0, 30, 60, 90, 120, 150];
    default: return [0];
  }
}
