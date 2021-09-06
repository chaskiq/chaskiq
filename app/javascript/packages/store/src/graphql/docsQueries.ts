/* eslint-disable semi */
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
            icon
          }        
        }
        authors{
          id
          displayName
          avatarUrl
        }
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
            icon
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
          description
          author{
            id
            name
            avatarUrl
          } 
          collection{
            title
            id
            icon
          }        
        }
        meta
        authors{
          id
          displayName
          avatarUrl
        }
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
        description
        collection{
          slug
          title
          id
          icon
        }
        section{
          slug
          title
          id
        }
        author{
          id
          name
          avatarUrl
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
        icon
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
        icon
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
        authors{
          id
          displayName
          avatarUrl
        }

        baseArticles{
          id
          title
          slug
          updatedAt
          description
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
            description
            updatedAt
            author{
              id
              displayName
              name
              avatarUrl
            }
          }
          
        }
      }
    }
  }
`;

export default {
  ARTICLE_SETTINGS,
  ARTICLES,
  SEARCH_ARTICLES,
  ARTICLES_UNCATEGORIZED,
  ARTICLE,
  ARTICLE_COLLECTIONS,
  ARTICLE_COLLECTION,
  ARTICLE_COLLECTION_WITH_SECTIONS,
};
