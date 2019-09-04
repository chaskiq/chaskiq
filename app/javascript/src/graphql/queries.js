export const APPS = `
query Apps{
  apps{
    key
    name
    state
    tagline
  }  
}
`;

export const APP = `
  query App($appKey: String!){
    app(key: $appKey) {
      encryptionKey
      key
      name
      preferences
      timezone
      domainUrl
      activeMessenger
      theme
      translations
      availableLanguages
      teamSchedule
      replyTime
      inboundSettings
      segments {
        name
        id
        properties
      }
      state
      tagline
    }
  }
`;

export const AGENTS = `
  query App($appKey: String!){
    app(key: $appKey) {
      agents{
        id
        email
        name
        signInCount
        lastSignInAt
        invitationAcceptedAt
      }
    }
  }
`;

export const PENDING_AGENTS = `
  query App($appKey: String!){
    app(key: $appKey) {
      notConfirmedAgents{
        id
        email
        name
        signInCount
        lastSignInAt
        invitationAcceptedAt
        invitationSentAt
      }
    }
  }
`;

export const AGENT = `
  query App($appKey: String!, $id: Int!, $page: Int, $per: Int){
    app(key: $appKey) {
      agent(id: $id){
        id
        email
        name
        conversations(page: $page , per: $per ){
          collection{
            id
            key
            state
            readAt
            priority
            lastMessage{
              source
              createdAt
              message{
                htmlContent
                textContent
                serializedContent
              }
              privateNote
              messageSource{
                id
                type
              }
              appUser {
                id
                email
                kind
                displayName
              }
            }
            mainParticipant{
              id
              email
              displayName
              properties
            }
          }
          meta
        }
      }
    }
  }
`;

export const SEGMENT = `
  query App($appKey: String!, $id: Int!){
    app(key: $appKey) {
      segment(id: $id ) {
        name
        id
        predicates {
          type
          attribute
          comparison
          value
        }
      }
    }
  }
`;


export const CONVERSATIONS = `
  query App($appKey: String!, $page: Int!, $sort: String, $filter: String){
    app(key: $appKey) {
      encryptionKey
      key
      name
      conversations(page: $page, sort: $sort, filter: $filter){
        collection{
          id
          key
          state
          readAt
          priority
          lastMessage{
            source
            createdAt
            message{
              htmlContent
              textContent
              serializedContent
            }
            privateNote
            messageSource{
              id
              type
            }
            appUser {
              id
              email
              kind
              displayName
            }
          }
          mainParticipant{
            id
            email
            displayName
            properties
          }
        }
        meta

      }
    }
  }
`;

export const CONVERSATION=`
  query App($appKey: String!, $id: String!, $page: Int){
    app(key: $appKey) {
      encryptionKey
      key
      name
      conversation(id: $id){
        id
        key
        state
        readAt
        priority
        assignee {
          id
          email
        }
        mainParticipant{
          id
          email
          properties
          displayName
        }
        
        messages(page: $page){
          collection{
            id
            message{
              htmlContent
              textContent
              serializedContent
            }
            source
            readAt
            createdAt
            privateNote
            appUser{
              id
              email
              kind
              displayName
            }
            source
            messageSource {
              name
              state
              fromName
              fromEmail
              serializedContent
            }
            emailMessageId
          }
          meta
        }
    }
  }
}
`;

export const CONVERSATION_WITH_LAST_MESSAGE=`
  query App($appKey: String!, $id: Int!){
    app(key: $appKey) {
      encryptionKey
      key
      name
      conversation(id: $id){
        id
        key
        state
        readAt
        priority
        createdAt
        lastMessage{
          createdAt
          source
          message{
            htmlContent
            textContent
            serializedContent
          }
          privateNote
          messageSource{
            id
            type
          }
          appUser {
            id
            email
            kind
            displayName
          }
        }
        mainParticipant{
          id
          email
          displayName
          properties
        }
      }
    }
  }
`;



export const CURRENT_USER = `
  query CurrentUser {
    userSession {
      email
    }
  }
`;

export const APP_USER = `
query AppUser($appKey: String!, $id: Int! ) {
  app(key: $appKey) {
    appUser(id: $id ) {
      id
      email
      lastVisitedAt
      referrer
      state
      ip
      city
      region
      country
      lat
      lng
      postal
      webSessions
      timezone
      browser
      browserVersion
      os
      osVersion
      browserLanguage
      online
      lang
      displayName
      name
    }
  }
}
`;

export const APP_USER_CONVERSATIONS=`
query Campaigns($appKey: String!, $id: Int!, $page: Int, $per: Int){
  app(key: $appKey ){
    name
    key
    appUser(id: $id){
      displayName
      conversations(page: $page, per: $per){

        collection{
          id
          key
          mainParticipant{
            id
            email
          }
          lastMessage{
            createdAt
            appUser{
              email
              id
              kind
              displayName
            }
            message{
              serializedContent
              htmlContent
              textContent
            }
          }
        }
      }
    } 
  }
}
`;

export const APP_USER_VISITS=`
query AppUserVisits($appKey: String!, $id: Int!, $page: Int, $per: Int){
  app(key: $appKey ){
    name
    key
    appUser(id: $id){
      displayName
      visits(page: $page, per: $per){
        collection{
          url
          title
          osVersion
          os
          browserName
          browserVersion
        }
        meta
      }
    } 
  }
}
`;

export const CAMPAIGNS = `
query Campaigns($appKey: String!, $mode: String!){
  app(key: $appKey){
    campaigns(mode: $mode){
      collection {
        name
        id
        type
        url
        serializedContent
        segments
        scheduledAt
        scheduledTo
        state
        subject
        timezone
        description
        fromName
        fromEmail
        replyEmail        
      }
      meta
    }
  }
}
`;

export const CAMPAIGN = `
query Campaign($appKey: String!, $mode: String!, $id: Int!){
  app(key: $appKey){
    campaign(mode: $mode, id: $id){
      name
      id
      type
      url
      serializedContent
      segments
      scheduledAt
      scheduledTo
      state
      subject
      description
      timezone
      statsFields
      configFields
      fromName
      fromEmail
      replyEmail
      steps
    }
  }
}
`;

export const CAMPAIGN_METRICS = `
query Campaign($appKey: String!, $mode: String!, $id: Int!, $page: Int, $per: Int){
  app(key: $appKey){
    campaign(mode: $mode, id: $id){
      name
      counts
      metrics(page: $page, per: $per){
        collection {
          action
          host
          data
          messageId
          email
          appUserId
          updatedAt
          createdAt
        }
        meta
      }
    }
  }
}
`;

export const ASSIGNMENT_RULES = `
  query AssingmentRules($appKey: String!){
    app(key: $appKey){
      assignmentRules {
        id
        agent{
          id
          email
        }
        state
        title
        conditions
      }
    }
  }
`;

export const ARTICLE_SETTINGS = `
  query App($appKey: String!){
    app(key: $appKey) {
      articleSettings{
        id
        color
        credits
        facebook
        googleCode
        headerImage
        linkedin
        logo
        siteDescription
        siteTitle
        subdomain
        twitter
        website
        langs
        translations
        availableLanguages
      }
    }
  }
`;

export const ARTICLES = `
  query App($appKey: String!, $page: Int!, $per: Int, $lang: String){
    app(key: $appKey) {
      articles(page: $page, per: $per, lang: $lang){
        collection {
          id
          title
          slug
          content 
          state
          description
          author{
            email
            id
            name
          } 
          collection{
            slug
            title
            id
          }        
        }
        meta
      }
    }
  }
`;

export const ARTICLES_UNCATEGORIZED = `
  query App($appKey: String!, $page: Int!, $per: Int){
    app(key: $appKey) {
      articlesUncategorized(page: $page, per: $per){
        collection {
          id
          title
          slug
          content 
          state
          description
          author{
            email
            id
            name
          } 
          collection{
            title
            id
          }        
        }
        meta
      }
    }
  }
`;

export const ARTICLE = `
  query App($appKey: String!, $id: String!, $lang: String){
    app(key: $appKey) {
      article(id: $id, lang: $lang){
        id
        title
        slug
        content
        state
        description
        collection{
          slug
          title
          id
        }
        section{
          slug
          title
          id
        }
        author{
          email
          id
          name
        }
      }
    }
  }
`;


export const ARTICLE_COLLECTIONS = `
  query ArticleCollections($appKey: String!, $lang: String){
    app(key: $appKey){
      collections(lang: $lang) {
        slug
        id
        title
        description
      }
    }
  }
`;

export const ARTICLE_COLLECTION = `
  query ArticleCollections($appKey: String!, $id: String!, $lang: String){
    app(key: $appKey){
      collection(id: $id, lang: $lang) {
        id
        title
        slug
        description
      }
    }
  }
`;

export const ARTICLE_COLLECTION_WITH_SECTIONS = `
  query ArticleCollections($appKey: String!, $id: String!, $lang: String){
    app(key: $appKey){
      collection(id: $id, lang: $lang) {
        id
        slug
        title
        description
        baseArticles{
          id
          title
          slug
          author{
            id
            email
            name
          }
        }
        sections{
          slug
          id
          title
          description
          articles{
            id
            title
            slug
            author{
              id
              email
              name
            }
          }
          
        }
      }
    }
  }
`;


export const BOT_TASKS = `
  query BotTasks($appKey: String!, $lang: String){
    app(key: $appKey){
      botTasks(lang: $lang){
        title
        id
        state
      }
    }
  }
`;

export const BOT_TASK = `
  query BotTask($appKey: String!, $id: String!, $lang: String){
    app(key: $appKey){
      botTask(id: $id, lang: $lang){
        id
        state
        title
        segments
        paths{
          id
          steps
          title
        }
      }
    }
  }
`;



