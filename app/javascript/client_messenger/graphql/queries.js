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
      app{
        greetings
        intro
        tagline
        activeMessenger
        enableArticlesOnWidget
        inlineNewConversations
        inBusinessHours
        replyTime
        logo
        inboundSettings
        emailRequirement
        businessBackIn
        tasksSettings
        customizationColors
        encryptionKey
        articleSettings{
          subdomain
        }
        domainUrl
        theme
      }
      agents {
        email
        name
        avatarUrl
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

export const CONVERSATIONS = `
  query Messenger($page: Int!, $per: Int){
    messenger {
      conversations(page: $page, per: $per){
        collection{
          id
          key
          state
          readAt
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
        lastMessage{
          source
          createdAt
          message{
            htmlContent
            textContent
            serializedContent
            data
            action
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