export const UPDATE_APP = `
  mutation AppsUpdate($appKey: String!, $appParams: Json!){
    appsUpdate(input: {appKey: $appKey, appParams: $appParams}){
      errors
      app{
        encryptionKey
        key
        name
        preferences
        configFields
        theme
        activeMessenger
        segments {
          name
          id
          properties
        }
        state
        tagline
      }
    }
  }
`

export const CREATE_APP = `
  mutation AppsCreate($appParams: Json!, $operation: String){
    appsCreate(input: {appParams: $appParams, operation: $operation}){
      errors
      app{
        encryptionKey
        key
        name
        preferences
        configFields
        theme
        state
        tagline
        activeMessenger
      }
    }
  }
`

export const INSERT_COMMMENT = `
  mutation InsertComment($appKey: String!, $id: Int!, $message: String!){
    insertComment(appKey: $appKey, id: $id, message: $message){
      message{
        message
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
    }
  }
`;

export const INSERT_NOTE = `
  mutation InsertNote($appKey: String!, $id: Int!, $message: String!){
    insertNote(appKey: $appKey, id: $id, message: $message){
      message{
        message
        readAt
        createdAt
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
    }
  }
`;

export const ASSIGN_USER = `
  mutation AssignUser($appKey: String!, $conversationId: Int!, $appUserId: Int!){
    assignUser(appKey: $appKey, conversationId: $conversationId, appUserId: $appUserId){
      conversation{
        id
        state 
        readAt
        assignee {
          id
          email
        }
        mainParticipant{
          id
          email
          properties
        }
      }
    }
  }
`;

export const UPDATE_CAMPAIGN = `
  mutation UpdateCampaign($appKey: String!, $id: Int!, $campaignParams: Json!){
    campaignUpdate(input: {appKey: $appKey, id: $id, campaignParams: $campaignParams}){
      errors
      campaign {
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
  }
`

export const CREATE_CAMPAIGN = `
  mutation CreateCampaign($appKey: String!, $campaignParams: Json!, $operation: String, $mode: String!){
    campaignCreate(input: {operation: $operation, appKey: $appKey, mode: $mode, campaignParams: $campaignParams }){
      errors
      campaign {
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
  }
`

export const PREDICATES_SEARCH = `
  mutation PredicatesSearch($appKey: String!, $search: Json!, $page: Int, $per: Int){
    predicatesSearch(input: {appKey: $appKey, search: $search, page: $page, per: $per}){
      appUsers{
        collection{
          id
          email
          os
          osVersion
          lastVisitedAt
          browser
          state
        }
        meta
      }
    }
  }
`

export const PREDICATES_DELETE = `
  mutation PredicatesDelete($appKey: String!, $id: Int,){
    predicatesDelete(input: {appKey: $appKey, id: $id}){
      segment {
        name
      }
    }
  }
`


export const PREDICATES_CREATE = `
  mutation PredicatesCreate($appKey: String!, $operation: String, $name: String!, $predicates: Json!){
    predicatesCreate(input: {appKey: $appKey, operation: $operation, name: $name, predicates: $predicates }){
      segment {
        id
        name
        predicates{
          comparison
          type
          value
          attribute
        }
      }
    }
  }
`


export const PREDICATES_UPDATE = `
  mutation PredicatesUpdate($appKey: String!, $predicates: Json!, $id: Int){
    predicatesUpdate(input: {appKey: $appKey, predicates: $predicates, id: $id }){
      segment {
        id
        name
        predicates {
          comparison
          type
          value
          attribute
        }
      }
    }
  }`