# frozen_string_literal: true

require 'sidekiq/web'
require 'active_support/security_utils'
require 'subdomain_routes'
Rails.application.routes.draw do
  use_doorkeeper do
    skip_controllers :applications, :authorized_applications

    controllers tokens: 'agents/tokens'

    # controllers applications: 'agents/authorizations',
    # tokens: 'agents/custom_authorizations'
    # authorizations: 'custom_authorizations',
    #    tokens: 'custom_authorizations',
    #    applications: 'custom_authorizations',
    #    token_info: 'custom_authorizations'
  end

  resources :messenger do
    member do
      get :tester
      post :confirm_gdpr
      post :events
    end

    resource :auth, controller: "messenger/auth"

    resources :conversations, controller: "messenger/conversations" do
      resources :messages, controller: "messenger/messages"
      member do
        post :events
      end
    end
    
  end

  mount GraphiQL::Rails::Engine, at: '/graphiql', graphql_path: '/graphql' if Rails.env.development?


  patch '/languages', to: 'application#languages'
  get '/languages', to: 'application#languages'

  post '/graphql', to: 'graphql#execute'
  post '/api/graphql', to: 'api/graphql#execute'
  get :widget, to: 'widgets#show', path: '/embed'

  resource :playground, controller: "playground"

  get :show, to: 'api/v1/credentials#show', path: '/api/v1/me'

  Sidekiq::Web.use(Rack::Auth::Basic) do |user, password|
    # Protect against timing attacks:
    # - See https://codahale.com/a-lesson-in-timing-attacks/
    # - See https://thisdata.com/blog/timing-attacks-against-string-comparison/
    # - Use & (do not use &&) so that it doesn't short circuit.
    # - Use digests to stop length information leaking
    ActiveSupport::SecurityUtils.secure_compare(user, Chaskiq::Config.get('ADMIN_EMAIL')) &
      ActiveSupport::SecurityUtils.secure_compare(password.to_s, Chaskiq::Config.get('ADMIN_PASSWORD').to_s)
  end

  mount Sidekiq::Web, at: '/sidekiq'

  devise_for :agents, controllers: {
    registrations: 'agents/registrations',
    invitations: 'agents/invitations',
    sessions: 'agents/sessions',
    omniauth_callbacks: 'agents/omniauth_callbacks',
    passwords: 'agents/passwords'
  } do
    delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_agent_session
  end

  post "/auth0/authenticate", to: "agents/auth0#create"

  resources :apps do
    resources :campaigns , controller: "apps/campaigns" do
      member do
        get :purge_metrics
        get :deliver
        get :clone
        get :pause
      end
    end

    resources :agents , controller: "apps/agents"
    resource :settings , controller: "apps/settings"
    resources :reports , controller: "apps/reports"
    resources :invitations , controller: "apps/invitations"
    resources :conversations , controller: "apps/conversations" do
      collection do
        post :search
      end
      member do
        get :sidebar
      end
      resources :conversation_messages, controller: "apps/conversation_messages"
    end

    resources :editor_quick_replies, controller: "apps/editor_quick_replies"
    resources :editor_bot_tasks, controller: "apps/editor_bot_tasks"

    resources :inbox_packages, controller: 'apps/inbox_packages' do
      collection do
        post :sort
      end
    end

    resources :home_packages, controller: 'apps/home_packages' do
      collection do
        post :sort
      end
    end

    resources :articles , controller: "apps/articles" do
      collection do 
        get :uncategorized
        post :add_uncategorized

        resources :settings, controller: "apps/articles_settings", as: :articles_settings
        resources :sections, controller: "apps/articles_sections", as: :articles_sections do
          collection do
            post :sort
          end
        end
        resources :collections, controller: "apps/articles_collections", as: :articles_collections do
          collection do
            post :sort
          end
        end
      end
    end

    resources :bots , controller: "apps/bots" do
      collection do
        get :outbound
        get :new_conversations
        post :sort
        get :users
        get :leads
      end

      member do
        get :purge_metrics
        get :deliver
        get :clone
        get :pause
      end
    end
    
    resources :segments , controller: "apps/segments" do
      member do
        post :edit_segment
      end
    end
    resources :contacts, controller: "apps/contacts" do
      collection do
        get :bulk
        post :bulk
        get :search
      end
    end
    resources :segment_managers, controller: "apps/segment_manager"
    resources :dashboards, controller: "apps/dashboards"
    resources :assignment_rules, controller: "apps/assignment_rules"
    resources :packages, controller: "apps/packages" do
      member do
        post :configure
        post :content
        post :submit
      end
      collection do
        post :sort
        get :capabilities
        get :open_sidebar
      end
    end

    resources :messenger , controller: "apps/messenger" do

      collection do
        post :sort_user_apps
        post :sort_visitor_apps
      end
    end
    resources :translations, controller: "apps/translations"
    resources :inbound_settings, controller: "apps/inbound_settings" do
      member do
        put :update_segment
      end
    end
    resources :user_data, controller: "apps/user_data"
    resources :quick_replies, controller: "apps/quick_replies"
    resource :contact_avatars, controller: "apps/contact_avatars"
    resources :tags, controller: "apps/tags"
    resources :security, controller: "apps/security"
    resources :email_forwarding, controller: "apps/email_forwarding"
    resources :oauth_applications, controller: "apps/oauth_applications"

    resource :billing, controller: "apps/billing" do
      collection do
        get :success
        get :error
        get :transactions
      end
    end
    resources :webhooks , controller: "apps/webhooks"
    resources :team , controller: "apps/team" do
      collection do 
        get :invitations 
      end
    end
    resources :integrations, controller: 'apps/integrations'
  end

  resource :oembed, controller: 'oembed', only: :show
  get '/package_iframe/:package' => 'application#package_iframe'
  post '/package_iframe_internal/:package' => 'application#package_iframe_internal'
  post '/dummy_webhook' => 'application#dummy_webhook'

  constraints(SubdomainOrDomain) do
    # TODO, regex ?
    get '/' => 'articles#show'
    get '/:lang' => 'articles#show'
    get '/:lang/collections' => 'articles#show'
    get '/:lang/collections/:id' => 'articles#show'
    get '/:lang/articles/:id' => 'articles#show'
    get '/collections' => 'articles#show'
    get '/collections/:id' => 'articles#show'
    get '/articles/:1/' => 'articles#show'
  end

  root to: 'home#show'
  get '/apps/:app/premailer/:id/' => 'application#preview'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get 'tester' => 'client_tester#show'
  get 'tester/:id' => 'client_tester#show'
  get 'tester/:id/:id2' => 'client_tester#show'
  get 'tester/:id/:id2/id3' => 'client_tester#show'
  get 'tester/:id/:id2/id3/:id4' => 'client_tester#show'

  get '/' => 'home#show', as: :agents

  scope path: '/api' do
    scope path: '/v1' do
      resources :hooks, only: [:create], controller: 'api/v1/hooks'

      post 'hooks/global/:provider' => 'api/v1/hooks/provider#global_process_event'
      get 'hooks/global/:provider' => 'api/v1/hooks/provider#global_process_event'

      post 'hooks/receiver/:id' => 'api/v1/hooks/provider#process_event'
      get 'hooks/receiver/:id' => 'api/v1/hooks/provider#process_event'

      post 'oauth/callback/:id' => 'api/v1/hooks/provider#oauth'
      get 'oauth/callback/:id' => 'api/v1/hooks/provider#oauth'

      # get 'oauth/:app_key/:provider/:id' => 'api/v1/hooks/provider#oauth'
      # get 'hooks/:app_key/:provider/:id' => 'api/v1/hooks/provider#create'
      # post 'hooks/:app_key/:provider/:id' => 'api/v1/hooks/provider#process_event'

      resources :direct_uploads, only: [:create], controller: 'api/v1/direct_uploads'

      resources :stripe_hooks, only: [:create], controller: 'api/v1/subscriptions/stripe_hooks'
      resources :subscription_hooks, only: [:create], controller: 'api/v1/subscriptions/paddle_hooks'
    end
  end

  get '*path', to: 'application#catch_all', constraints: lambda { |req|
    req.path.exclude? 'rails/active_storage'
  }
end
