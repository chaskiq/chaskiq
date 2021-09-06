export const AUTH = `
  query Messenger{
    messenger {
      user
    }
  }
`;

export const PING = `
  query Messenger{
    
    messenger {
      enabledForUser
      updateData
      needsPrivacyConsent
      app{
        greetings
        intro
        tagline
        name
        activeMessenger
        privacyConsentRequired
        inlineNewConversations
        inBusinessHours
        leadTasksSettings
        userTasksSettings
        replyTime
        logo
        inboundSettings
        emailRequirement
        businessBackIn
        tasksSettings
        customizationColors
        searcheableFields
        homeApps
        articleSettings{
          subdomain
        }
        domainUrl
        theme
      }
      agents {
        name
        avatarUrl
      }
    }
  }
`;

export const GET_NEW_CONVERSATION_BOTS = `
  query Messenger{
    messenger {
      app{
        newConversationBots
      }
    }
  }
`;

export const CONVERT = `
  mutation ConvertUser($appKey: String!, $email: String!){
    convertUser(appKey: $appKey, email: $email){
      status
    }
  }
`;

export const PRIVACY_CONSENT = `
  mutation PrivacyConsent($appKey: String!, $consent: Boolean!){
    privacyConsent(appKey: $appKey, consent: $consent){
      status
    }
  }
`;

export const CONVERSATIONS = `
  query Messenger($page: Int!, $per: Int){
    messenger {
      conversations(page: $page, per: $per){
        collection{
          id
          key
          state
          readAt
          closedAt
          priority
          assignee {
            id
            displayName
            avatarUrl
          }
          lastMessage{
            source
            createdAt
            stepId
            triggerId
            fromBot
            readAt
            key
            message{
              htmlContent
              textContent
              serializedContent
              blocks
              action
              data
            }
            privateNote
            messageSource{
              id
              type
            }
            appUser {
              id
              kind
              displayName
              avatarUrl
            }
          }
          mainParticipant{
            id
            displayName
            properties
            avatarUrl
          }
        }
        meta
      }
    }
  }
`;

export const CONVERSATION = `
  query Messenger($id: String!, $page: Int){
    messenger {

      conversation(id: $id){
        id
        key
        state
        readAt
        closedAt
        priority
        assignee {
          id
          name
          avatarUrl
        }
        mainParticipant{
          id
          properties
          displayName
          avatarUrl
        }
        
        messages(page: $page){
          collection{
            id
            key
            message{
              htmlContent
              textContent
              serializedContent
              blocks
              data
              action
              state
            }
            source
            readAt
            createdAt
            privateNote
            stepId
            triggerId
            fromBot
            appUser{
              id
              kind
              displayName
              avatarUrl
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
          avatarUrl
          kind
          displayName
        }
        source
        key
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

export const START_CONVERSATION = `
  mutation StartConversation($appKey: String!, $id: Int, $message: Json!){
    startConversation(appKey: $appKey, id: $id, message: $message){
      conversation{
        id
        key
        state 
        readAt
        priority
        assignee {
          id
          name
          avatarUrl
        }
        mainParticipant{
          id
          properties
          avatarUrl
        }

        messages(page: 1){
          collection{
            id
            key
            message{
              htmlContent
              textContent
              serializedContent
              blocks
              data
              action
              state
            }
            source
            readAt
            createdAt
            privateNote
            stepId
            triggerId
            fromBot
            appUser{
              id
              kind
              displayName
              avatarUrl
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



        lastMessage{
          source
          createdAt
          id
          key
          stepId
          triggerId
          message{
            htmlContent
            textContent
            serializedContent
            data
            action
            blocks
          }
          privateNote
          messageSource{
            id
            type
          }
          appUser {
            id
            kind
            displayName
            avatarUrl
          }
        }
      }
    }
  }
`;

export const ARTICLE_SETTINGS = `
  query HelpCenter($domain: String!, $lang: String){
    helpCenter(domain: $domain, lang: $lang) {
      id
      color
      credits
      facebook
      googleCode
      headerImageLarge
      linkedin
      logo
      siteDescription
      siteTitle
      subdomain
      twitter
      website
      availableLanguages
    }
  }
`;

export const ARTICLES = `
  query HelpCenter($domain: String!, $page: Int!, $per: Int, $lang: String){
    helpCenter(domain: $domain, lang: $lang) {
      articles(page: $page, per: $per){
        collection {
          id
          title
          slug
          content 
          description
          state
          updatedAt
          author{
            id
            name
            avatarUrl
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

export const SEARCH_ARTICLES = `
  query HelpCenter($domain: String!, $page: Int!, $per: Int, $lang: String, $term: String!){
    helpCenter(domain: $domain, lang: $lang) {
      search(page: $page, per: $per, term: $term){
        collection {
          id
          title
          slug
          content 
          state
          updatedAt
          author{
            id
            name
            avatarUrl
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
  query HelpCenter($domain: String!, $page: Int!, $per: Int, $lang: String){
    helpCenter(domain: $domain, lang: $lang) {
      articlesUncategorized(page: $page, per: $per){
        collection {
          id
          title
          slug
          content 
          state
          updatedAt
          author{
            avatarUrl
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
  query HelpCenter($domain: String!, $id: String!, $lang: String){
    helpCenter(domain: $domain, lang: $lang) {
      article(id: $id){
        id
        title
        slug
        content
        state
        updatedAt
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
          avatarUrl
          id
          name
        }
      }
    }
  }
`;

export const ARTICLE_COLLECTIONS = `
  query ArticleCollections($domain: String!, $lang: String){
    helpCenter(domain: $domain, lang: $lang){
      collections {
        slug
        id
        title
        description
      }
    }
  }
`;

export const ARTICLE_COLLECTION = `
  query ArticleCollections($domain: String!, $id: String!, $lang: String){
    helpCenter(domain: $domain, lang: $lang){
      collection(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const ARTICLE_COLLECTION_WITH_SECTIONS = `
  query ArticleCollections($domain: String!, $id: String!, $lang: String){
    helpCenter(domain: $domain, lang: $lang){
      collection(id: $id) {
        id
        title
        description
        meta

        baseArticles{
          id
          title
          slug
          updatedAt
          author{
            id
            avatarUrl
            displayName
            name
          }
        }
        sections{
          id
          title
          description
          articles{
            id
            title
            slug
            updatedAt
            author{
              id
              avatarUrl
              displayName
              name
            }
          }
          
        }
      }
    }
  }
`;

export const APP_PACKAGE_HOOK = `

query Messenger($id: String!, $hooKind: String!, $ctx: Json!){
    
  messenger {
    enabledForUser
    updateData
    app{
      appPackage(id: $id){
        name
        state
        definitions
        icon
        description
        callHook(kind: $hooKind, ctx: $ctx)
      }
    }
  }
}
`;
