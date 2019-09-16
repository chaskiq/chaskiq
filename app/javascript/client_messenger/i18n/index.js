import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  //.use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: {
      en: {
        translations: {
          conversations: "Conversations",
          start_conversation: "Start a conversation",
          see_previous: "See previous",
          search_articles: "Search articles",
          latest_articles: "Our latest articles",
          reply_above: "Reply above",
          create_new_conversation: "create new conversation",
          you: "You",
          not_seen: "not seen",
          by: "By",
          dismiss: "Dismiss",
          article_meta: "By: <strong>{{name}}</strong> on <0>{{date}}</0>"
        }
      },
      es: {
        translations: {
          conversations: "Conversaciones",
          start_conversation: "Inicia una conversación",
          see_previous: "Ver anteriores",
          search_articles: "Busca artículos",
          latest_articles: "Nuestro artículos recientes",
          reply_above: "Responde arribe",
          create_new_conversation: "Crea una nueva conversación",
          you: "Tú",
          not_seen: "No visto",
          by: "Por",
          dismiss: "Descartar",
          article_meta: "Por: <strong>{{name}}</strong> en <0>{{date}}</0>"
        }
      },
    },
    fallbackLng: "en",
    debug: true,

    // have a common namespace used around the full app
    ns: ["translations"],
    defaultNS: "translations",

    keySeparator: false, // we use content as keys

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
