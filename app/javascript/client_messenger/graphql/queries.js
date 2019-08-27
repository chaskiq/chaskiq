export const PING = `
  query Messenger($appKey: String!){
    messenger(key: $appKey) {
      active_messenger
      domain_url
      tagline
      theme
      triggers
    }
  }
`;