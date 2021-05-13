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
          runon: 'We run on Chaskiq',
          conversations: 'Conversations',
          'conversation_block.choosen': 'You replied <strong>{{field}}</strong>',
          continue_conversation: 'Continue the conversation',
          start_conversation: 'Start a conversation',
          view_all_conversations: 'view all conversations',
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
          'conversations.message_blocks.app_package_wait_reply': 'is waiting for your reply',
          'conversations.message_blocks.app_package_non_wait': 'sent you a content',

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
          invalid: '{{name}} entered is invalid',
          gdpr_title: 'Data protection',
          gdpr_ok: 'Yes, Accept',
          gdpr_nok: 'No, not now',
          gdpr: `
            <p>
              Hi there! we at {{name}} love to talk with you.
              Under the EU General Data Protection Regulation, we need your approval for our use of personal information
              (e.g your name and email address) you may provide as we communicate:
            </p>
            <p>(1) We'll store your personal information so that we can pick up the conversation if  we talk later.</p>
            <p>(2) We may send you email to follow up on our discussion here.</p>
            <p>(3) We may send you emails about {{name}} upcoming service and promotions.</p>

            <p>is this okay with you?</p>
          `
        }
      },
      es: {
        translations: {
          runon: 'Usamos Chaskiq',
          conversations: 'Conversaciones',
          'conversations.events.assigned': '{{name}} fue asignado a esta conversación',
          'conversation_block.choosen': 'respondiste <strong>{{field}}</strong>',
          'conversations.message_blocks.ask_option': 'está esperando tu respuesta',
          'conversations.message_blocks.data_retrieval': 'está esperando tu respuesta',
          'conversations.message_blocks.app_package_wait_reply': 'está esperando tu respuesta',
          'conversations.message_blocks.app_package_non_wait': 'envió un contenido',
          continue_conversation: 'Continúa la conversación',
          start_conversation: 'Inicia una conversación',
          view_all_conversations: 'ver todas las conversaciones',
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
          invalid: '{{name}} ingresado es inválido',
          gdpr_ok: 'Si, Confirmar',
          gdpr_nok: 'No por ahora',
          gdpr_title: 'Protección de datos',
          gdpr: `
            <p>
            ¡Hola! en <strong>{{name}}</strong> nos encantará hablar contigo.
            Según el Reglamento general de protección de datos de la UE, necesitamos su aprobación para nuestro uso de información personal
            (por ejemplo, su nombre y dirección de correo electrónico) que puede proporcionar cuando nos comunicamos:
            </p>
            <p> (1) Almacenaremos su información personal para que podamos retomar la conversación si hablamos más tarde. </p>
            <p> (2) Es posible que le enviemos un correo electrónico para dar seguimiento a nuestra discusión aquí. </p>
            <p> (3) Es posible que le enviemos correos electrónicos sobre los próximos servicios y anuncios de <strong>{{name}}</strong>. </p>
            <p> ¿Te parece bien? </p>
          `
        }
      },
      fr: {
        translations: {
          runon: 'Nous utilisons Chaskiq',
          conversations: 'Discussions',
          'conversation_block.choosen': 'Vous avez répondu <strong>{{field}}</strong>',
          continue_conversation: 'Continuer la discussion',
          start_conversation: 'Commencer une discussion',
          view_all_conversations: 'voir toutes les discussions',
          see_previous: 'Voir les précedentes',
          search_article_title: "Trouver les réponses dans notre répertoire d'article",
          search_articles: 'Rechercher un article',
          latest_articles: 'Nos derniers articles',
          reply_above: 'Répondre en dessous',
          create_new_conversation: 'créer une nouvelle discussion',
          you: 'Vous',
          not_seen: 'non lu',
          by: 'Par',
          dismiss: 'Rejeter',
          submit: 'Soumettre',
          article_meta: 'Par: <strong>{{name}}</strong> le <0>{{date}}</0>',
          enter_your: 'Entrez votre {{field}}',

          'editor.placeholder': 'Envoyer un message...',
          'conversations.events.assigned': '{{name}} a été assigné à cette discussion',
          'conversations.message_blocks.ask_option': 'attend votre réponse',
          'conversations.message_blocks.data_retrieval': 'attend votre réponse',
          'conversations.message_blocks.app_package_wait_reply': 'attend votre réponse',
          'conversations.message_blocks.app_package_non_wait': 'vous a envoyé un contenu',

          'reply_time.auto': 'L\'équipe va vous répondre dès que possible',
          'reply_time.minutes': 'L\'équipe répond habituellement en quelques minutes',
          'reply_time.hours': 'L\'équipe répond habituellement en quelques heures',
          'reply_time.1 day': 'L\'équipe répond habituellement en quelques jours',

          is_typing: '{{name}} est en train d\'écrire',
          'availability.aprox': 'nous serons de retour dans quelques {{time}} heures',
          'availability.tomorrow': "nous serons de retour dans demain",
          'availability.days': "nous serons de retour dans quelque {{val}} jours",
          'availability.next_week': "nous serons de retour la semaine prochaine",
          'availability.back_from': "nous serons en ligne à partir de {{hours}} heure",
          'availability.tomorrow_from': "nous serons en ligne demain à partir de {{hours}} heure",
          'tours.done': 'Fait !',
          invalid: '{{name}} entré est incorrect',
          gdpr_title: 'Protection des données',
          gdpr_ok: 'Oui, accepter',
          gdpr_nok: 'Non, pas maintenant',
          gdpr: `
            <p>
              Bonjour ! Chez {{name}} nous aimons vous parler.
              Sous la GRPD (General Data Protection Regulation), nous avons besoins de votre approbation pour utiliser les informations personnelles
              (ex: votre nom et adresse email) que vous nous fournissez quand nous communiquons:
            </p>
            <p>(1) Nous allons stocker vos informations personnelles pour que nous puissions sélectionner une discuter plus tard.</p>
            <p>(2) Nous avons besoin d'un email pour suivre nos discussions.</p>
            <p>(3) Nous pourrions envoyer des email a propos des futurs services ou offres de {{name}}.</p>

            <p>êtes vous d'accord ?</p>
          `
        }
      },
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
