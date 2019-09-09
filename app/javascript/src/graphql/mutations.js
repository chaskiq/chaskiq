export const UPDATE_APP = `
  mutation AppsUpdate($appKey: String!, $appParams: Json!){
    appsUpdate(appKey: $appKey, appParams: $appParams){
      errors
      app{
        encryptionKey
        key
        name
        preferences
        configFields
        theme
        activeMessenger
        translations
        availableLanguages
        teamSchedule
        timezone
        replyTime
        inboundSettings
        emailRequirement
        leadTasksSettings
        userTasksSettings
        segments {
          name
          id
          properties
        }
        state
        tagline
      }
    }
  }
`;

export const DESTROY_APP = `
  mutation AppsUpdate($appKey: String!){
    appsDestroy(appKey: $appKey){
      errors
      app{
        encryptionKey
        key
        name
        preferences
        configFields
        theme
        activeMessenger
        segments {
          name
          id
          properties
        }
        state
        tagline
      }
    }
  }
`;

export const CREATE_APP = `
  mutation AppsCreate($appParams: Json!, $operation: String){
    appsCreate(appParams: $appParams, operation: $operation){
      errors
      app{
        encryptionKey
        key
        name
        preferences
        configFields
        theme
        state
        tagline
        activeMessenger
        teamSchedule
        timezone
        inboundSettings
        emailRequirement
        leadTasksSettings
        userTasksSettings
      }
    }
  }
`;

export const APP_USER_UPDATE_STATE = `

  mutation AppUserUpdateData($appKey: String!, $id: Int!, $state: String!){
    appUserUpdateData(appKey: $appKey, id: $id, state: $state){
 
      appUser {
        id
        email
        lastVisitedAt
        referrer
        state
        ip
        city
        region
        country
        lat
        lng
        postal
        webSessions
        timezone
        browser
        browserVersion
        os
        osVersion
        browserLanguage
        online
        lang
        displayName
        name
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
          email
          name
        }
        mainParticipant{
          id
          email
          properties
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

export const INSERT_NOTE = `
  mutation InsertNote($appKey: String!, $id: Int!, $message: Json!){
    insertNote(appKey: $appKey, id: $id, message: $message){
      message{
        message{
          htmlContent
          textContent
          serializedContent
        }
        readAt
        createdAt
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

export const ASSIGN_USER = `
  mutation AssignUser($appKey: String!, $conversationId: Int!, $appUserId: Int!){
    assignUser(appKey: $appKey, conversationId: $conversationId, appUserId: $appUserId){
      conversation{
        id
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
        }
      }
    }
  }
`;

export const CREATE_ASSIGNMENT_RULE = `
  mutation CreateAssignmentRule($appKey: String!, $agentId: String!, $title: String!, $active: String!, $conditions: Json!){
    createAssignmentRule(appKey: $appKey, agentId: $agentId, title: $title, active: $active, conditions: $conditions){
      errors
      assignmentRule{
        id
        title
        conditions
        state
        agent{
          id
          email
        }
        state
      }
    }
  }
`;

export const UPDATE_RULE_PRIORITIES = `
  mutation UpdateRulePriorities($appKey: String!, $rules: [Json!]!){
    updateRulePriorities(appKey: $appKey, rules: $rules){
      errors
    }
  }
`;

export const EDIT_ASSIGNMENT_RULE = `
  mutation EditAssignmentRule($appKey: String!, $ruleId: Int!, $agentId: String!, $title: String!, $active: String!, $conditions: Json!){
    editAssignmentRule(appKey: $appKey, ruleId: $ruleId, agentId: $agentId, title: $title, active: $active, conditions: $conditions){
      errors
      assignmentRule{
        id
        title
        conditions
        state
        agent{
          id
          email
        }
        state
      }
    }
  }
`;

export const DELETE_ASSIGNMENT_RULE = `
  mutation DeleteAssignmentRule($appKey: String!, $ruleId: Int! ){
    deleteAssignmentRule(appKey: $appKey, ruleId: $ruleId){
      errors
      assignmentRule{
        id
        title
        conditions
        state
        agent{
          id
          email
        }
        state
      }
    }
  }
`;

export const UPDATE_CONVERSATION_STATE = `
  mutation UpdateConversationState($appKey: String!, $conversationId: Int!, $state: String!){
    updateConversationState(appKey: $appKey, conversationId: $conversationId, state: $state){
      conversation{
        id
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
        }
      }
    }
  }
`;

export const TOGGLE_CONVERSATION_PRIORITY = `
  mutation ToggleConversationPriority($appKey: String!, $conversationId: Int!){
    toggleConversationPriority(appKey: $appKey, conversationId: $conversationId){
      conversation{
        id
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
        }
      }
    }
  }
`;

export const UPDATE_CAMPAIGN = `
  mutation UpdateCampaign($appKey: String!, $id: Int!, $campaignParams: Json!){
    campaignUpdate(appKey: $appKey, id: $id, campaignParams: $campaignParams){
      errors
      campaign {
        name
        id
        type
        url
        serializedContent
        segments
        scheduledAt
        scheduledTo
        state
        subject
        timezone
        description
        statsFields
        configFields
        fromName
        fromEmail
        replyEmail
        steps
      }
    }
  }
`;

export const DELETE_CAMPAIGN = `
  mutation DeleteCampaign($appKey: String!, $id: Int!){
    deleteUpdate(appKey: $appKey, id: $id){
      errors
      campaign {
        id
      }
    }
  }
`;

export const DELIVER_CAMPAIGN = `
  mutation DeliverCampaign($appKey: String!, $id: Int!, ){
    campaignDeliver(appKey: $appKey, id: $id){
      errors
      campaign {
        name
        id
        type
        url
        serializedContent
        segments
        scheduledAt
        scheduledTo
        state
        subject
        timezone
        description
        statsFields
        configFields
        fromName
        fromEmail
        replyEmail
        steps
      }
    }
  }
`;

export const PURGE_METRICS = `
  mutation PurgeMetrics($appKey: String!, $id: Int!, ){
    purgeMetrics(appKey: $appKey, id: $id){
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
        timezone
        description
        statsFields
        configFields
        fromName
        fromEmail
        replyEmail
      }
    }
  }
`;

export const CREATE_CAMPAIGN = `
  mutation CreateCampaign($appKey: String!, $campaignParams: Json!, $operation: String, $mode: String!){
    campaignCreate(operation: $operation, appKey: $appKey, mode: $mode, campaignParams: $campaignParams){
      errors
      campaign {
        name
        id
        type
        url
        serializedContent
        segments
        scheduledAt
        scheduledTo
        state
        subject
        timezone
        description
        statsFields
        configFields
        fromName
        fromEmail
        replyEmail
        steps
      }
    }
  }
`;

export const PREDICATES_SEARCH = `
  mutation PredicatesSearch($appKey: String!, $search: Json!, $page: Int, $per: Int){
    predicatesSearch(appKey: $appKey, search: $search, page: $page, per: $per){
      appUsers{
        collection{
          id
          email
          os
          osVersion
          lastVisitedAt
          browser
          state
          displayName
          online

          referrer
          ip
          city
          region
          country
          lat
          lng
          postal
          webSessions
          timezone
          browser
          browserVersion
          browserLanguage
          lang
        }
        meta
      }
    }
  }
`;

export const PREDICATES_DELETE = `
  mutation PredicatesDelete($appKey: String!, $id: Int,){
    predicatesDelete(appKey: $appKey, id: $id){
      segment {
        name
      }
    }
  }
`;

export const PREDICATES_CREATE = `
  mutation PredicatesCreate($appKey: String!, $operation: String, $name: String!, $predicates: Json!){
    predicatesCreate(appKey: $appKey, operation: $operation, name: $name, predicates: $predicates){
      segment {
        id
        name
        predicates{
          comparison
          type
          value
          attribute
        }
      }
    }
  }
`;


export const PREDICATES_UPDATE = `
  mutation PredicatesUpdate($appKey: String!, $predicates: Json!, $id: Int){
    predicatesUpdate(appKey: $appKey, predicates: $predicates, id: $id){
      segment {
        id
        name
        predicates {
          comparison
          type
          value
          attribute
        }
      }
    }
  }
`;

export const INVITE_AGENT = `
  mutation InviteAgent($appKey: String!, $email: String!){
    inviteAgent(appKey: $appKey, email: $email){
      agent {
        email
        name
      }
    }
  }
`;

export const UPDATE_AGENT = `
  mutation UpdateAgent($appKey: String!, $email: String!, $name: String!){
    updateAgent(appKey: $appKey, email: $email, name: $name){
      agent {
        email
        name
      }
    }
  }
`;

export const CREATE_ARTICLE = `
  mutation CreateArticle($appKey: String!, $content: Json!, $title: String!, $lang: String){
    createArticle(appKey: $appKey, content: $content, title: $title, lang: $lang){
      article {
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
      }
    }
  }
`;

export const EDIT_ARTICLE = `
  mutation EditArticle($appKey: String!, $content: Json!, $id: String!, $title: String!, $description: String!, $lang: String){
    editArticle(appKey: $appKey, content: $content, id: $id, title: $title, description: $description, lang: $lang){
      article {
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
      }
    }
  }
`;

export const ARTICLE_BLOB_ATTACH = `
  mutation ArticleBlobAttach($appKey: String!, $id: Int!, $blobId: String!){
    articleBlobAttach(appKey: $appKey, id: $id, blobId: $blobId){
      article {
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
      }
    }
  }
`;

export const TOGGLE_ARTICLE = `
  mutation ToggleArticle($appKey: String!, $id: String!, $state: String!){
    toggleArticle(appKey: $appKey, id: $id, state: $state){
      article {
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
      }
    }
  }
`;

export const ARTICLE_ASSIGN_AUTHOR = `
  mutation AssignAuthor($appKey: String!, $id: String!, $authorId: String!){
    assignAuthor(appKey: $appKey, id: $id, authorId: $authorId){
      article {
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
      }
    }
  }
`;

export const DELETE_ARTICLE = `
  mutation DeleteArticle($appKey: String!, $id: String!){
    deleteArticle(appKey: $appKey, id: $id){
      article {
        id
        title
        slug
        content
        state
      }
    }
  }
`;

export const CREATE_DIRECT_UPLOAD = `
  mutation CreateDirectUpload($filename: String!, $contentType: String!, $checksum: String!, $byteSize: Int!){
    createDirectUpload( input: { 
      filename: $filename, 
      contentType: $contentType, 
      checksum: $checksum, 
      byteSize: $byteSize 
    }){
      directUpload {
        signedBlobId
        url
        headers
        blobId
        serviceUrl
      }
    }
  }
`;

export const CREATE_URL_UPLOAD = `
  mutation CreateUrlUpload($url: String!){
    createUrlUpload( input: { 
      url: $url,
    }){
      directUpload {
        signedBlobId
        url
        headers
        blobId
        serviceUrl
      }
    }
  }
`;

export const REORDER_ARTICLE = `
  mutation ReorderArticle( $appKey: String!, $id: String!, $position: Int!, $section: String, $collection: String){
    reorderArticle( appKey: $appKey, id: $id, position: $position, section: $section, collection: $collection ){
      article{
        id
        position
      }
    }
  }
`;


export const ARTICLE_COLLECTION_CREATE = `
  mutation ArticleCollectionCreate($appKey: String!, $title: String!, $description: String){
    articleCollectionCreate( 
      appKey: $appKey, 
      title: $title, 
      description: $description
    ){
      collection{
        id
        title
        description
      }
      errors
    }
  }
`;

export const ARTICLE_COLLECTION_CHANGE = `
  mutation ChangeCollectionArticle($appKey: String!, $id: String!, $collectionId: Int!){
    changeCollectionArticle( 
      appKey: $appKey, 
      id: $id, 
      collectionId: $collectionId
    ){
      article {
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
      }
    }
  }
`;

export const ARTICLE_COLLECTION_EDIT = `
  mutation ArticleCollectionEdit($appKey: String!, $id: Int!, $title: String!, $description: String, $lang: String){
    articleCollectionEdit( 
      appKey: $appKey, 
      title: $title, 
      id: $id,
      description: $description,
      lang: $lang
    ){
      collection{
        id
        title
        description
      }
      errors
    }
  }
`;

export const ARTICLE_COLLECTION_DELETE = `
  mutation ArticleCollectionDelete($appKey: String!, $id: Int!){
    articleCollectionDelete( 
      appKey: $appKey, 
      id: $id,
    ){
      collection{
        id
      }
    }
  }
`;

export const ARTICLE_SECTION_CREATE = `
  mutation ArticleSectionCreate($appKey: String!, $title: String!, $collectionId: Int!, $lang: String){
    articleSectionCreate( 
      appKey: $appKey, 
      title: $title, 
      collectionId: $collectionId,
      lang: $lang
    ){
      section{
        id
        title
        description
        articles {
          id
          title
        }
      }
    }
  }
`;

export const ARTICLE_SECTION_EDIT = `
  mutation ArticleSectionEdit($appKey: String!, $title: String!, $id: String!, $collectionId: Int!, $lang: String){
    articleSectionEdit( 
      appKey: $appKey, 
      title: $title,
      collectionId: $collectionId
      id: $id,
      lang: $lang
    ){
      section{
        id
        title
        description
      }
    }
  }
`;

export const ARTICLE_SECTION_DELETE = `
  mutation ArticleSectionDelete($appKey: String!, $id: String!){
    articleSectionDelete( 
    appKey: $appKey,
    id: $id
    ){
      section{
        id
      }
    }
  }
`;

export const ADD_ARTICLES_TO_COLLECTION = `
  mutation AddArticlesToCollection($appKey: String!, $collectionId: Int!, $articlesId: [String!]!){
    addArticlesToCollection( 
      appKey: $appKey,
      collectionId: $collectionId,
      articlesId: $articlesId
    ){
      collection{
        id
      }
    }
  }
`;

export const ARTICLE_SETTINGS_UPDATE = `
  mutation ArticleSettingsUpdate($appKey: String!, $settings: Json!){
    articleSettingsUpdate( 
      appKey: $appKey,
      settings: $settings
    ){
      settings{
        id
        subdomain
        siteTitle
        siteDescription
        website
        googleCode
        color
        facebook
        twitter
        linkedin
        credits
        logo
        headerImage
        translations
      }
      errors
    }
  }
`;


export const CREATE_BOT_TASK = `
  mutation CreateBotTask($appKey: String!, $params: Json!){
    createBotTask( 
      appKey: $appKey,
      params: $params
    ){
      botTask{
        id
        title
        paths {
          id
          title
          followActions
        }
      }
      errors
    }
  }
`;

export const UPDATE_BOT_TASK = `
  mutation UpdateBotTask($appKey: String!, $id: String!, $params: Json!){
    updateBotTask( 
      appKey: $appKey,
      params: $params,
      id: $id
    ){
      botTask{
        id
        title
        paths {
          id
          title
          steps
          followActions
        }
      }
      errors
    }
  }
`;

export const DELETE_BOT_TASK = `
  mutation DeleteBotTask($appKey: String!, $id: Int!){
    deleteBotTask( 
      appKey: $appKey,
      id: $id
    ){
      botTask{
        id
      }
      errors
    }
  }
`;
