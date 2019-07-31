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

export const SEARCH_ARTICLES = `
  query HelpCenter($domain: String!, $page: Int!, $per: Int, $lang: String, $term: String!){
    helpCenter(domain: $domain, lang: $lang) {
      search(page: $page, per: $per, term: $term){
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
  query HelpCenter($domain: String!, $id: String!, $lang: String){
    helpCenter(domain: $domain, lang: $lang) {
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