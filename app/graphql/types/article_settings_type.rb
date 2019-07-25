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
    field :header_logo, String, null: true
    field :facebook, String, null: true
    field :twitter, String, null: true
    field :linkedin, String, null: true
    field :credits, String, null: true

    def logo
      "aa"
    end

    def header_logo
      "aa"
    end

  end
end