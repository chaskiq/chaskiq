import i18n from 'i18next'

import { initReactI18next } from 'react-i18next'

i18n
  // .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // we init with resources
    resources: {
      en: {
        translations: {
          runon: "We run on Chaskiq",
          conversations: 'Conversations',
          'conversation_block.choosen': 'You replied <strong>{{field}}</strong>',

          start_conversation: 'Start a conversation',
          see_previous: 'See previous',
          search_article_title: "Find answers in our article's repository",
          search_articles: 'Search articles',
          latest_articles: 'Our latest articles',
          reply_above: 'Reply above',
          create_new_conversation: 'create new conversation',
          you: 'You',
          not_seen: 'not seen',
          by: 'By',
          dismiss: 'Dismiss',
          submit: 'Submit',
          article_meta: 'By: <strong>{{name}}</strong> on <0>{{date}}</0>',
          enter_your: 'Enter your {{field}}',

          'editor.placeholder': 'Send message...',
          'conversations.events.assigned': '{{name}} was assigned to this conversation',
          'conversations.message_blocks.ask_option': 'is waiting for your reply',
          'conversations.message_blocks.data_retrieval': 'is waiting for your reply',

          'reply_time.auto': 'The team will respond as soon as possible',
          'reply_time.minutes': 'The team usually responds in minutes',
          'reply_time.hours': 'The team usually responds in a matter of hours',
          'reply_time.1 day': 'The team usually responds in one day',

          is_typing: '{{name}} is typing',
          'availability.aprox': 'we\'ll back in approximately {{time}} hrs',
          'availability.tomorrow': "we'll back back tomorrow",
          'availability.days': "we'll back in {{val}} days",
          'availability.next_week': "we'll back next week",
          'availability.back_from': "we'll back online from {{hours}} hrs",
          'availability.tomorrow_from': "we'll back online tomorrow from {{hours}} hrs",
          'tours.done': 'Done!',
          invalid: '{{name}} entered is invalid'
        }
      },
      es: {
        translations: {
          runon: "Usamos Chaskiq",
          conversations: 'Conversaciones',
          'conversations.events.assigned': '{{name}} fue asignado a esta conversación',
          'conversation_block.choosen': 'respondiste <strong>{{field}}</strong>',
          'conversations.message_blocks.ask_option': 'está esperando tu respuesta',
          'conversations.message_blocks.data_retrieval': 'está esperando tu respuesta',
          start_conversation: 'Inicia una conversación',
          see_previous: 'Ver anteriores',
          search_article_title: 'Encuentra respuestas en nuestro centro de ayuda',
          search_articles: 'Busca artículos',
          latest_articles: 'Artículos recientes',
          reply_above: 'Responde arriba',
          create_new_conversation: 'Crea una nueva conversación',
          you: 'Tú',
          not_seen: 'No visto',
          by: 'Por',
          dismiss: 'Descartar',
          submit: 'Enviar',
          enter_your: 'Escribe tu {{field}}',
          'editor.placeholder': 'Envía tu mensaje...',
          article_meta: 'Por: <strong>{{name}}</strong> en <0>{{date}}</0>',
          'reply_time.auto': 'El equipo responderá lo antes posible',
          'reply_time.minutes': 'El equipo suele responder en cuestión de minutos.',
          'reply_time.hours': 'El equipo suele responder en cuestión de horas.',
          'reply_time.1 day': 'El equipo suele responder en un día.',

          is_typing: '{{name}} está escribiendo',

          'availability.aprox': 'estaremos de vuelta aproximadamente a las {{time}}hrs',
          'availability.tomorrow': 'volvemos mañana',
          'availability.days': 'volvemos en {{val}} dias',
          'availability.next_week': 'volvemos la proxima semana',
          'availability.back_from': 'volveremos a estar en linea desde las {{hours}}hrs',
          'availability.tomorrow_from': 'volveremos a estar en linea mañana desde las {{hours}}hrs',

          'tours.done': 'Listo!',
          invalid: '{{name}} ingresado es inválido'
        }
      }
    },
    fallbackLng: 'en',
    debug: false,

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    keySeparator: false, // we use content as keys

    interpolation: {
      escapeValue: false
    }
  })

export default i18n
