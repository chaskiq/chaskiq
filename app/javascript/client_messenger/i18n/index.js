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
          submit: "Submit",
          article_meta: "By: <strong>{{name}}</strong> on <0>{{date}}</0>",
          enter_your: "Enter your {{field}}",

          "conversations.events.assigned": "{{name}} was assigned to this conversation",

          "reply_time.auto": "The team will respond as soon as possible", 
          "reply_time.minutes": "The team usually responds in minutes",
          "reply_time.hours": "The team usually responds in a matter of hours",
          "reply_time.1 day": "The team usually responds in one day",

          "availability.aprox": `we will be back at approximately {{time}} hrs`,
          "availability.tomorrow": "we come back tomorrow",
          "availability.days": "we return in {{val}} days",
          "availability.next_week": "we come back next week",
          "availability.back_from": "we will be back online from {{hours}} hrs",
          "availability.tomorrow_from": "we will be back online tomorrow from {{hours}} hrs"
        }
      },
      es: {
        translations: {
          conversations: "Conversaciones",
          start_conversation: "Inicia una conversación",
          see_previous: "Ver anteriores",
          search_articles: "Busca artículos",
          latest_articles: "Nuestro artículos recientes",
          reply_above: "Responde arriba",
          create_new_conversation: "Crea una nueva conversación",
          you: "Tú",
          not_seen: "No visto",
          by: "Por",
          dismiss: "Descartar",
          submit: "Enviar",
          enter_your: "Escribe tu {{field}}",
          article_meta: "Por: <strong>{{name}}</strong> en <0>{{date}}</0>",
          "reply_time.auto": "El equipo responderá lo antes posible", 
          "reply_time.minutes": "El equipo suele responder en cuestión de minutos.",
          "reply_time.hours": "El equipo suele responder en cuestión de horas.",
          "reply_time.1 day": "El equipo suele responder en un día.",

          "availability.aprox": `estaremos de vuelta aproximadamente a las {{time}}hrs`,
          "availability.tomorrow": "volvemos mañana",
          "availability.days": "volvemos en {{val}} dias",
          "availability.next_week": "volvemos la proxima semana",
          "availability.back_from": "volveremos a estar en linea desde las {{hours}}hrs",
          "availability.tomorrow_from": "volveremos a estar en linea mañana desde las {{hours}}hrs"

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
