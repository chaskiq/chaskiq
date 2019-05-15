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
