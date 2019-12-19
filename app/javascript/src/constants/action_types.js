const actionTypes = {
  GetApp: 'GET_APP',
  setCurrentUser: 'SET_CURRENT_USER',
  setSignOut: 'SET_SIGNOUT',

  getSegment: 'GET_SEGMENT',
  searchAppUsers: 'SEARCH_APP_USERS',
  initSearchAppUsers: 'SEARCH_START',
  updateSegment: 'UPDATE_SEGMENT',

  setAppUser: 'SET_APP_USER',
  clearAppUser: 'CLEAR_APP_USER',

  GetConversation: 'GET_CONVERSATION',
  UpdateConversation: 'UPDATE_CONVERSATION',

  GetConversations: 'GET_CONVERSATIONS',
  UpdateConversations: 'UPDATE_CONVERSATIONS',
  ClearConversations: 'CLEAR_CONVERSATIONS',
  
  UpdateConversation: 'UPDATE_CONVERSATION',

  SetStatusMessage: 'SET_STATUS_MESSAGE',
  UpdateConversationItem: 'UPDATE_CONVERSATION_ITEM',
  UpdatePresence: 'UPDATE_USER_PRESENCE',
  AppendConversation: 'APPEND_CONVERSATION',

  SetCurrentPage: 'SET_CURRENT_PAGE'
};

export default actionTypes;
