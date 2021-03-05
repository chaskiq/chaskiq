# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field :appsDestroy, mutation: Mutations::Apps::DestroyApp
    field :appsUpdate, mutation: Mutations::Apps::UpdateApp
    field :appsCreate, mutation: Mutations::Apps::CreateApp
    field :importContacts, mutation: Mutations::Apps::ImportContacts

    field :inviteAgent, mutation: Mutations::Agents::Invite
    field :updateAgent, mutation: Mutations::Agents::UpdateAgent
    field :updateAgentRole, mutation: Mutations::Agents::UpdateAgentRole

    field :cloneMessage, mutation: Mutations::CloneMessage

    field :createDelete, mutation: Mutations::Predicates::CreatePredicate
    field :predicatesDelete, mutation: Mutations::Predicates::DeletePredicate
    field :predicatesUpdate, mutation: Mutations::Predicates::SavePredicate
    field :predicatesSearch, mutation: Mutations::Predicates::SearchPredicate
    field :predicatesCreate, mutation: Mutations::Predicates::CreatePredicate

    field :campaignsNew, mutation: Mutations::Campaigns::NewCampaign
    field :campaignCreate, mutation: Mutations::Campaigns::CreateCampaign
    field :campaignUpdate, mutation: Mutations::Campaigns::UpdateCampaign
    field :campaignDeliver, mutation: Mutations::Campaigns::DeliverCampaign
    field :campaignDelete, mutation: Mutations::Campaigns::DeleteCampaign

    field :purgeMetrics, mutation: Mutations::Campaigns::PurgeMetrics

    field :startConversation, mutation: Mutations::Conversations::StartConversation
    field :insertComment, mutation: Mutations::Conversations::InsertComment
    field :insertAppBlockComment, mutation: Mutations::Conversations::InsertAppBlockComment
    field :insertNote, mutation: Mutations::Conversations::InsertNote
    field :assignUser, mutation: Mutations::Conversations::AssignUser
    field :updateConversationState, mutation: Mutations::Conversations::UpdateState
    field :toggleConversationPriority, mutation: Mutations::Conversations::TogglePriority
    field :typingNotifier, mutation: Mutations::Conversations::TypingNotifier
    field :updateConversationTags, mutation: Mutations::Conversations::UpdateTags
    field :sendTrigger, mutation: Mutations::Conversations::SendTrigger

    field :createWebhook, mutation: Mutations::OutgoingWebhooks::CreateWebhook
    field :updateWebhook, mutation: Mutations::OutgoingWebhooks::UpdateWebhook
    field :deleteWebhook, mutation: Mutations::OutgoingWebhooks::DeleteWebhook

    field :createQuickReply, mutation: Mutations::QuickReplies::CreateQuickReply
    field :updateQuickReply, mutation: Mutations::QuickReplies::UpdateQuickReply
    field :deleteQuickReply, mutation: Mutations::QuickReplies::DeleteQuickReply

    field :createAssignmentRule, mutation: Mutations::AssignRule::CreateAssignRule
    field :editAssignmentRule, mutation: Mutations::AssignRule::EditAssignRule
    field :deleteAssignmentRule, mutation: Mutations::AssignRule::DeleteAssignRule
    field :updateRulePriorities, mutation: Mutations::AssignRule::UpdateRulePriorities

    field :appUserUpdateData, mutation: Mutations::AppUsers::UpdateAppUserState
    field :convertUser, mutation: Mutations::AppUsers::ConvertUser
    field :privacyConsent, mutation: Mutations::AppUsers::PrivacyConsent
    field :updateAppUser, mutation: Mutations::AppUsers::UpdateAppUser
    field :syncExternalProfile, mutation: Mutations::AppUsers::SyncExternalProfile

    field :createArticle, mutation: Mutations::Articles::CreateArticle
    field :editArticle, mutation: Mutations::Articles::EditArticle
    field :deleteArticle, mutation: Mutations::Articles::DeleteArticle
    field :articleBlobAttach, mutation: Mutations::Articles::ArticleBlobAttach
    field :toggleArticle, mutation: Mutations::Articles::ToggleArticle
    field :assignAuthor, mutation: Mutations::Articles::AssignAuthor
    field :reorderArticle, mutation: Mutations::Articles::ReorderArticle
    field :changeCollectionArticle, mutation: Mutations::Articles::ChangeCollectionArticle
    field :addArticlesToCollection, mutation: Mutations::Articles::AddArticlesToCollection

    field :articleSettingsDeleteLang, mutation: Mutations::Articles::ArticleSettingsDeleteLang
    field :articleSettingsUpdate, mutation: Mutations::Articles::ArticleSettingsUpdate

    field :articleSectionCreate, mutation: Mutations::Articles::Sections::CreateSection
    field :articleSectionEdit, mutation: Mutations::Articles::Sections::EditSection
    field :articleSectionDelete, mutation: Mutations::Articles::Sections::DeleteSection

    field :articleCollectionCreate, mutation: Mutations::Articles::Collections::CreateCollection
    field :articleCollectionEdit, mutation: Mutations::Articles::Collections::EditCollection
    field :articleCollectionDelete, mutation: Mutations::Articles::Collections::DeleteCollection

    field :createUrlUpload, mutation: Mutations::CreateUrlUpload
    field :createDirectUpload, mutation: Mutations::CreateDirectUpload

    field :createBotTask, mutation: Mutations::Bots::CreateBotTask
    field :updateBotTask, mutation: Mutations::Bots::UpdateBotTask
    field :deleteBotTask, mutation: Mutations::Bots::DeleteBotTask
    field :reorderBotTask, mutation: Mutations::Articles::ReorderBotTask

    field :integrationsCreate, mutation: Mutations::AppPackageIntegrations::CreateIntegration
    field :integrationsDelete, mutation: Mutations::AppPackageIntegrations::DeleteIntegration
    field :integrationsUpdate, mutation: Mutations::AppPackageIntegrations::UpdateIntegration

    field :appPackagesCreate, mutation: Mutations::AppPackages::CreatePackage
    field :appPackagesDelete, mutation: Mutations::AppPackages::DeletePackage
    field :appPackagesUpdate, mutation: Mutations::AppPackages::UpdatePackage

    field :createOauthApplication, mutation: Mutations::OauthApps::OauthCreate
    field :updateOauthApplication, mutation: Mutations::OauthApps::OauthUpdate
    field :deleteOauthApplication, mutation: Mutations::OauthApps::OauthDelete
  end
end
