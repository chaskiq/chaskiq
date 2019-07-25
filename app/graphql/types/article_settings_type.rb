module Types
  class ArticleSettingsType < Types::BaseObject
    field :id, Int, null: true
    field :subdomain, String, null: true
    field :site_title, String, null: true
    field :site_description, String, null: true
    field :website, String, null: true
    field :google_code, String, null: true

    field :color, String, null: true
    field :logo, String, null: true
    field :header_image, String, null: true
    field :facebook, String, null: true
    field :twitter, String, null: true
    field :linkedin, String, null: true
    field :credits, String, null: true

    def logo
      return "" unless object.logo_blob.present?

      Rails.application.routes.url_helpers.rails_representation_url(
        object.logo.variant(resize_to_limit: [100, 100]).processed, 
      only_path: true)
    end

    def header_image
      return "" unless object.header_image_blob.present?
      Rails.application.routes.url_helpers.rails_representation_url(
        object.header_image.variant(resize_to_limit: [100, 100]).processed, 
      only_path: true)

    end

  end
end