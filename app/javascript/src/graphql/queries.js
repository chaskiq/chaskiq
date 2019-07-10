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
      configFields
      domainUrl
      activeMessenger
      theme
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

export const ARTICLES = `
  query App($appKey: String!){
    app(key: $appKey) {
      articles{
        title
        slug
        content
      }
    }
  }
`;

export const ARTICLE = `
  query App($appKey: String!){
    app(key: $appKey) {
      article(id: Integer!){
        title
        slug
        content
      }
    }
  }
`;

export const AGENTS = `
  query App($appKey: String!){
    app(key: $appKey) {
      agents{
        id
        email
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
        conversations(page: $page , per: $per ){
          collection{
            id
            state
            readAt
            priority
            lastMessage{
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
          state
          readAt
          priority
          lastMessage{
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
        meta

      }
    }
  }
`;

export const CONVERSATION=`
  query App($appKey: String!, $id: Int!, $page: Int){
    app(key: $appKey) {
      encryptionKey
      key
      name
      conversation(id: $id){
        id
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
        state
        readAt
        priority
        lastMessage{
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
          mainParticipant{
            id
            email
          }
          lastMessage{
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
        collection
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