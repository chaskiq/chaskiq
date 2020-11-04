# frozen_string_literal: true

module Mutations
    class Apps::ImportContacts < Mutations::BaseMutation

      include Rails.application.routes.url_helpers
      # TODO: define return fields
      # field :post, Types::PostType, null: false
      field :app, Types::AppType, null: false
      field :errors, Types::JsonType, null: true
  
      argument :app_key, String, required: true
      argument :app_params, Types::JsonType, required: true
  
      def resolve(app_key:, app_params:)
        app = current_user.apps.find_by(key: app_key)
        agent = app.agents.find_by(email: app_params[:email])
        authorize! app, to: :manage?, with: AppPolicy

        blob = ActiveStorage::Blob.find_signed(app_params[:file])

        #ListImporter.import( 
        #    rails_blob_url(blob),  
        #    params: { 
        #        app_id: app.id,
        #        agent_id: agent.id,
        #        type: app_params[:contact_type]
        #    } 
        #) 

        ListImporterJob.perform_later(
            blob_url: rails_blob_url(blob),
            app_id: app.id,
            agent_id: agent.id,
            type: app_params[:contact_type] 
        )

        # @app.update(app_params.permit!)
        { app: app, errors: app.errors }
      end
    end
  end