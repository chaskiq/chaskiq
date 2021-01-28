# frozen_string_literal: true

require 'sidekiq/web'
require 'active_support/security_utils'
require 'subdomain_routes'
Rails.application.routes.draw do
  
  use_doorkeeper do
    skip_controllers :applications, :authorized_applications
    #controllers applications: 'agents/authorizations',
                #tokens: 'agents/custom_authorizations'
                #authorizations: 'custom_authorizations',
                #    tokens: 'custom_authorizations',
                #    applications: 'custom_authorizations',
                #    token_info: 'custom_authorizations'
  end

  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: '/graphiql', graphql_path: '/graphql'
  end

  post '/graphql', to: 'graphql#execute'
  post '/api/graphql', to: 'api/graphql#execute'
  get :widget, to: 'widgets#show', path: '/embed'

  get :show, to: 'api/v1/credentials#show', path: '/api/v1/me'

  Sidekiq::Web.use(Rack::Auth::Basic) do |user, password|
    # Protect against timing attacks:
    # - See https://codahale.com/a-lesson-in-timing-attacks/
    # - See https://thisdata.com/blog/timing-attacks-against-string-comparison/
    # - Use & (do not use &&) so that it doesn't short circuit.
    # - Use digests to stop length information leaking
    ActiveSupport::SecurityUtils.secure_compare(user, ENV["ADMIN_EMAIL"]) &
    ActiveSupport::SecurityUtils.secure_compare(password, ENV["ADMIN_PASSWORD"])
  end

  devise_for :agents, controllers: {
    registrations: 'agents/registrations',
    invitations: 'agents/invitations',
    sessions: 'agents/sessions',
    omniauth_callbacks: 'agents/omniauth_callbacks'
  } do
    delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_agent_session
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

      #get 'oauth/:app_key/:provider/:id' => 'api/v1/hooks/provider#oauth'
      #get 'hooks/:app_key/:provider/:id' => 'api/v1/hooks/provider#create'
      #post 'hooks/:app_key/:provider/:id' => 'api/v1/hooks/provider#process_event'

      resources :direct_uploads, only: [:create], controller: 'api/v1/direct_uploads'

      resources :subscription_hooks, only: [:create], controller: 'api/v1/subscription_hooks'
    end
  end

  get '*path', to: 'application#catch_all', constraints: lambda { |req|
    req.path.exclude? 'rails/active_storage'
  }
end
