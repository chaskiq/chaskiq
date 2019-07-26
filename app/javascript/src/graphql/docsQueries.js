export const ARTICLE_SETTINGS = `
  query HelpCenter($domain: String!){
    helpCenter(domain: $domain) {
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
    }
  }
`;

export const ARTICLES = `
  query HelpCenter($domain: String!, $page: Int!, $per: Int){
    helpCenter(domain: $domain) {
      articles(page: $page, per: $per){
        collection {
          id
          title
          slug
          content 
          state
          author{
            email
            id
            name
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
  query HelpCenter($domain: String!, $page: Int!, $per: Int){
    helpCenter(domain: $domain) {
      articlesUncategorized(page: $page, per: $per){
        collection {
          id
          title
          slug
          content 
          state
          author{
            email
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
  query HelpCenter($domain: String!, $id: String!){
    helpCenter(domain: $domain) {
      article(id: $id){
        id
        title
        slug
        content
        state
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
          email
          id
          name
        }
      }
    }
  }
`;


export const ARTICLE_COLLECTIONS = `
  query ArticleCollections($domain: String!){
    helpCenter(domain: $domain){
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
  query ArticleCollections($domain: String!, $id: String!){
    helpCenter(domain: $domain){
      collection(id: $id) {
        id
        title
        description
      }
    }
  }
`;

export const ARTICLE_COLLECTION_WITH_SECTIONS = `
  query ArticleCollections($domain: String!, $id: String!){
    helpCenter(domain: $domain){
      collection(id: $id) {
        id
        title
        description
        meta

        baseArticles{
          id
          title
          slug
          author{
            id
            email
            displayName
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
            author{
              id
              email
              displayName
            }
          }
          
        }
      }
    }
  }
`;