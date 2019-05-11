export const APPS = `
query Apps{
  apps{
    key
    name
  }  
}
`

export const APP = `
query App($appKey: String!){
  app(key: $appKey) {
      encryptionKey
      key
      name
      preferences
      segments {
        name
        properties
      }
      state
      tagline
    }
}

`
