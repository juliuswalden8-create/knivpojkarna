import { en, type Dictionary } from "./en";

/**
 * Swedish dictionary – prepared for a future launch.
 *
 * Swedish is intentionally NOT in `enabledLocales` yet (see src/i18n/config.ts).
 * Strings fall back to English until they are translated. Replace the spread
 * sections below with full Swedish copy, then add "sv" to `enabledLocales`.
 */
export const sv: Dictionary = {
  ...en,
  meta: {
    ...en.meta,
    home: {
      title: "Knivslipning Marbella | KNIVPOJKARNA – We Bring Back the Edge",
      description:
        "Professionell knivslipning i Marbella och på Costa del Sol. Tydliga paketpriser från 7 €, inlämning eller upphämtning på förfrågan. Boka online på några minuter.",
    },
  },
  nav: {
    ...en.nav,
    home: "Hem",
    howItWorks: "Så funkar det",
    prices: "Priser",
    business: "Företag",
    areas: "Serviceområden",
    about: "Om oss",
    book: "Boka slipning",
    menu: "Öppna meny",
    close: "Stäng meny",
    language: "Språk",
    skip: "Hoppa till innehåll",
  },
  hero: {
    ...en.hero,
    kicker: "Professionell knivslipning · Marbella",
    headline: "Vassa knivar. Bättre matlagning.",
    sub: "Professionell knivslipning i Marbella. En personlig tjänst som ger tillbaka precisionen i köket.",
    primary: "Boka en slipning",
    secondary: "Utforska tjänsten",
    trust: "Precision, tydliga priser, lokal service.",
  },
  cta: {
    ...en.cta,
    title: "Redo för ett vassare kök?",
    sub: "Skicka en bokningsförfrågan på ett par minuter. Vi bekräftar tiden personligen.",
    button: "Boka din slipning",
    secondary: "Chatta på WhatsApp",
  },
};
