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