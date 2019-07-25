module Types
  class MutationType < Types::BaseObject

    field :appsDestroy, mutation: Mutations::Apps::DestroyApp
    field :appsUpdate, mutation: Mutations::Apps::UpdateApp
    field :appsCreate, mutation: Mutations::Apps::CreateApp
    field :inviteAgent, mutation: Mutations::Agents::Invite

    field :createDelete, mutation: Mutations::Predicates::CreatePredicate
    field :predicatesDelete, mutation: Mutations::Predicates::DeletePredicate
    field :predicatesUpdate, mutation: Mutations::Predicates::SavePredicate
    field :predicatesSearch, mutation: Mutations::Predicates::SearchPredicate
    field :predicatesCreate, mutation: Mutations::Predicates::CreatePredicate

    field :campaignsNew, mutation: Mutations::Campaigns::NewCampaign
    field :campaignCreate, mutation: Mutations::Campaigns::CreateCampaign
    field :campaignUpdate, mutation: Mutations::Campaigns::UpdateCampaign
    
    field :startConversation, mutation: Mutations::Conversations::StartConversation
    field :insertComment, mutation: Mutations::Conversations::InsertComment
    field :insertNote, mutation: Mutations::Conversations::InsertNote
    field :assignUser, mutation: Mutations::Conversations::AssignUser
    field :updateConversationState, mutation: Mutations::Conversations::UpdateState
    field :toggleConversationPriority, mutation: Mutations::Conversations::TogglePriority
    
    field :createAssignmentRule, mutation: Mutations::AssignRule::CreateAssignRule
    field :editAssignmentRule, mutation: Mutations::AssignRule::EditAssignRule
    field :deleteAssignmentRule, mutation: Mutations::AssignRule::DeleteAssignRule
    field :updateRulePriorities, mutation: Mutations::AssignRule::UpdateRulePriorities
    

    field :appUserUpdateData, mutation: Mutations::AppUsers::UpdateAppUserState


    field :createArticle, mutation: Mutations::Articles::CreateArticle
    field :editArticle, mutation: Mutations::Articles::EditArticle
    field :deleteArticle, mutation: Mutations::Articles::DeleteArticle
    field :articleBlobAttach, mutation: Mutations::Articles::ArticleBlobAttach
    field :toggleArticle, mutation: Mutations::Articles::ToggleArticle
    field :assignAuthor, mutation: Mutations::Articles::AssignAuthor
    field :reorderArticle, mutation: Mutations::Articles::ReorderArticle
    field :changeCollectionArticle, mutation: Mutations::Articles::ChangeCollectionArticle
    field :addArticlesToCollection, mutation: Mutations::Articles::AddArticlesToCollection
    
    field :articleSettingsUpdate, mutation: Mutations::Articles::ArticleSettingsUpdate
    
    field :articleSectionCreate, mutation: Mutations::Articles::Sections::CreateSection
    field :articleSectionEdit, mutation: Mutations::Articles::Sections::EditSection
    field :articleSectionDelete, mutation: Mutations::Articles::Sections::DeleteSection

    field :articleCollectionCreate, mutation: Mutations::Articles::Collections::CreateCollection
    field :articleCollectionEdit, mutation: Mutations::Articles::Collections::EditCollection
    field :articleCollectionDelete, mutation: Mutations::Articles::Collections::DeleteCollection


    field :createDirectUpload, mutation: Mutations::CreateDirectUpload
  end
end
