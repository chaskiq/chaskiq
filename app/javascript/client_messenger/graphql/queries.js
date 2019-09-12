export const PING = `
  query Messenger{
    
    messenger {
      enabledForUser
      app{
        greetings
        intro
        tagline
        activeMessenger
        inBusinessHours
        replyTime
        inboundSettings
        emailRequirement
        businessBackIn
        leadTasksSettings
        userTasksSettings
        articleSettings{
          subdomain
        }
        domainUrl
        theme
      }
      agents {
        email
        name
      }
      user
    }
  }
`;

export const AUTH = `
  query Messenger{
    messenger {
      user
    }
  }
`;

export const CONVERSATIONS = `
  query Messenger($page: Int!){
    messenger {
      conversations(page: $page){
        collection{
          id
          key
          state
          readAt
          priority
          assignee {
            displayName
            email
          }
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
  query Messenger($id: String!, $page: Int){
    messenger {

      conversation(id: $id){
        id
        key
        state
        readAt
        priority
        assignee {
          id
          email
          name
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


export const INSERT_COMMMENT = `
  mutation InsertComment($appKey: String!, $id: String!, $message: Json!){
    insertComment(appKey: $appKey, id: $id, message: $message){
      message{
        message{
          htmlContent
          textContent
          serializedContent
        }
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