module Types
  class MutationType < Types::BaseObject
    field :appsDestroy, mutation: Mutations::Apps::DestroyApp
    field :appsUpdate, mutation: Mutations::Apps::UpdateApp
    field :appsCreate, mutation: Mutations::Apps::CreateApp
    field :createDelete, mutation: Mutations::Predicates::CreatePredicate
    field :predicatesDelete, mutation: Mutations::Predicates::DeletePredicate
    field :predicatesSave, mutation: Mutations::Predicates::SavePredicate
    field :predicatesSearch, mutation: Mutations::Predicates::SearchPredicate
    field :campaignsNew, mutation: Mutations::Campaigns::NewCampaign
    field :campaignCreate, mutation: Mutations::Campaigns::CreateCampaign
    field :campaignUpdate, mutation: Mutations::Campaigns::UpdateCampaign
    field :insertComment, mutation: Mutations::InsertComment
    # TODO: remove me
    #description: "An example field added by the generator"
    ##field :insert_comment, String, null: false,
    #def test_field
    #  "Hello World"
    #end
  end
end
