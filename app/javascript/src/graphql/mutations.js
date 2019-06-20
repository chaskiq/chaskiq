export const UPDATE_APP = `
  mutation AppsUpdate($appKey: String!, $appParams: Json!){
    appsUpdate(appKey: $appKey, appParams: $appParams){
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
`;

export const DESTROY_APP = `
  mutation AppsUpdate($appKey: String!){
    appsDestroy(appKey: $appKey){
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
`;

export const CREATE_APP = `
  mutation AppsCreate($appParams: Json!, $operation: String){
    appsCreate(appParams: $appParams, operation: $operation){
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
`;

export const INSERT_COMMMENT = `
  mutation InsertComment($appKey: String!, $id: Int!, $message: String!){
    insertComment(appKey: $appKey, id: $id, message: $message){
      message{
        message
        readAt
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
      }
    }
  }
`;

export const UPDATE_CONVERSATION_STATE = `
  mutation UpdateConversationState($appKey: String!, $conversationId: Int!, $state: String!){
    updateConversationState(appKey: $appKey, conversationId: $conversationId, state: $state){
      conversation{
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
      }
    }
  }
`;

export const TOGGLE_CONVERSATION_PRIORITY = `
  mutation ToggleConversationPriority($appKey: String!, $conversationId: Int!){
    toggleConversationPriority(appKey: $appKey, conversationId: $conversationId){
      conversation{
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
      }
    }
  }
`;

export const UPDATE_CAMPAIGN = `
  mutation UpdateCampaign($appKey: String!, $id: Int!, $campaignParams: Json!){
    campaignUpdate(appKey: $appKey, id: $id, campaignParams: $campaignParams){
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
        timezone
        description
        statsFields
        configFields
        fromName
        fromEmail
        replyEmail
      }
    }
  }
`;

export const CREATE_CAMPAIGN = `
  mutation CreateCampaign($appKey: String!, $campaignParams: Json!, $operation: String, $mode: String!){
    campaignCreate(operation: $operation, appKey: $appKey, mode: $mode, campaignParams: $campaignParams){
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
        timezone
        description
        statsFields
        configFields
        fromName
        fromEmail
        replyEmail
      }
    }
  }
`;

export const PREDICATES_SEARCH = `
  mutation PredicatesSearch($appKey: String!, $search: Json!, $page: Int, $per: Int){
    predicatesSearch(appKey: $appKey, search: $search, page: $page, per: $per){
      appUsers{
        collection{
          id
          email
          os
          osVersion
          lastVisitedAt
          browser
          state
          lat 
          lng
          displayName
        }
        meta
      }
    }
  }
`;

export const PREDICATES_DELETE = `
  mutation PredicatesDelete($appKey: String!, $id: Int,){
    predicatesDelete(appKey: $appKey, id: $id){
      segment {
        name
      }
    }
  }
`;


export const PREDICATES_CREATE = `
  mutation PredicatesCreate($appKey: String!, $operation: String, $name: String!, $predicates: Json!){
    predicatesCreate(appKey: $appKey, operation: $operation, name: $name, predicates: $predicates){
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
`;


export const PREDICATES_UPDATE = `
  mutation PredicatesUpdate($appKey: String!, $predicates: Json!, $id: Int){
    predicatesUpdate(appKey: $appKey, predicates: $predicates, id: $id){
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
  }
`;