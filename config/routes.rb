require 'sidekiq/web'
require "subdomain_routes"
Rails.application.routes.draw do
  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end
  post "/graphql", to: "graphql#execute"
  post "/api/graphql", to: "api/graphql#execute"
  get :widget, to: "widgets#show", path: "/embed"
  mount Sidekiq::Web => '/sidekiq'

  devise_for :agents, controllers: { 
    invitations: 'agents/invitations' ,
    sessions: 'agents/sessions'
  }

  resources :attachments, controller: 'campaigns/attachments'

  resource :oembed, controller: "oembed", only: :show
  get '/package_iframe/:package'  => "application#package_iframe"

  constraints(SubdomainOrDomain) do
    # TODO, regex ?
    get '/'  => "articles#show"
    get '/:lang'  => "articles#show"
    get '/:lang/collections'  => "articles#show"
    get '/:lang/collections/:id'  => "articles#show"
    get '/:lang/articles/:id'  => "articles#show"
    get '/collections' => "articles#show"
    get '/collections/:id' => "articles#show"
    get '/articles/:1/' => "articles#show"
    #get '*path', to: 'application#catch_all', constraints: lambda { |req|
    #  req.path.exclude? 'rails/active_storage'
    #}
  end

  #get "/user_session", to: 'application#user_session'
  #get "/aaaa", to: 'application#user_session', as: 'user_auto_message'
  #get "/apps/:app_id/segments/:id/:jwt", to: 'segments#show', constraints: { jwt: /.+/ }

  root :to => "home#show"
  get "/apps/:app/premailer/:id/" => "application#preview"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get "tester" => 'client_tester#show'
  get "tester/:id" => 'client_tester#show'
  get "tester/:id/:id2" => 'client_tester#show'
  get "tester/:id/:id2/id3" => 'client_tester#show'
  get "tester/:id/:id2/id3/:id4" => 'client_tester#show'

  scope path: '/api' do
    scope path: '/v1' do
      resources :hooks, only: [:create], controller: "api/v1/hooks"
      resources :direct_uploads, only: [:create], controller: "api/v1/direct_uploads"
      resources :apps, controller: "api/v1/apps" do
        member do 
        #  post :ping
          post :auth
        end
        
        #resources :triggers, controller: "api/v1/triggers"
        #resources :tours, controller: "api/v1/tours"

        resources :messages, controller: "api/v1/messages" do
          resources :tracks, controller: "api/v1/tracks" do
            member do
              get :open
              get :bounce
              get :spam
              get :click
              get :close
            end
          end

        end

        #resources :conversations, controller: "api/v1/conversations" do
        #end
        
      end
    end
  end


  get '*path', to: 'application#catch_all', constraints: lambda { |req|
    req.path.exclude? 'rails/active_storage'
  }

end
