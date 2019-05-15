export const APPS = `
query Apps{
  apps{
    key
    name
  }  
}
`

export const APP = `
  query App($appKey: String!){
    app(key: $appKey) {
        encryptionKey
        key
        name
        preferences
        segments {
          name
          id
          properties
        }
        state
        tagline
      }
  }
`

export const SEGMENT = `
  query App($appKey: String!, $id: Int!){
    app(key: $appKey) {
      segment(id: $id ) {
        name
        id
        predicates
      }
    }
  }
`


export const CONVERSATIONS = `
  query App($appKey: String!, $page: Int!){
    app(key: $appKey) {
      encryptionKey
      key
      name
      conversations(page: $page){
        collection{
          id
          state
          readAt
          lastMessage{
            source
            message
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
`

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
        mainParticipant{
          id
          email
          properties
        }
        
        messages(page: $page){
          collection{
            message
            source
            readAt
            appUser{
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

`

export const CURRENT_USER = `
  query CurrentUser {
    userSession {
      email
    }
  }
`

export const APP_USER = `
query AppUser($appKey: String!, $id: Int! ) {
  app(key: $appKey) {
    appUser(id: $id ) {
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
`


export const CAMPAIGNS = `
query Campaigns($appKey: String!, $mode: String!){
  app(key: $appKey){
    campaigns(mode: $mode){
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
      fromName
      fromEmail
      replyEmail
    }
  }
}`

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
      statsFields
      configFields
      fromName
      fromEmail
      replyEmail
    }
  }
}`