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
    

    field :appUserUpdateData, mutation: Mutations::AppUsers::UpdateAppUserState

    # TODO: remove me
    #description: "An example field added by the generator"
    ##field :insert_comment, String, null: false,
    #def test_field
    #  "Hello World"
    #end
  end
end
