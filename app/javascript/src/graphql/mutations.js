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
  mutation CreateCampaign($appKey: String!, $campaignParams: Json!){
    campaignCreate(input: {appKey: $appKey, campaignParams: $campaignParams}){
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