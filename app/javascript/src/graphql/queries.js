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

export const AGENTS = `
  query App($appKey: String!){
    app(key: $appKey) {
      agents{
        id
        email
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
            message
            privateNote
            messageSource{
              id
              type
            }
            appUser {
              id
              email
              properties
            }
          }
          mainParticipant{
            id
            email
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
        }
        
        messages(page: $page){
          collection{
            id
            message
            source
            readAt
            createdAt
            privateNote
            appUser{
              id
              email
              properties
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
      lang
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