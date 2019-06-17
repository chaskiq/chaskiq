require 'sidekiq/web'
Rails.application.routes.draw do
  
  
  #mount_devise_token_auth_for 'User', at: 'auth'

  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end
  post "/graphql", to: "graphql#execute"
  mount Sidekiq::Web => '/sidekiq'
  #resources :campaigns
  devise_for :users
  devise_for :agents

  resources :attachments, controller: 'campaigns/attachments'


=begin
  concern :messageable do
    member do
      get :preview
      get :premailer_preview
      get :deliver
      get :test
    end
    
    resources :attachments, controller: 'campaigns/attachments'
    
    resources :metrics, controller: 'campaigns/metrics', only: :index do
      collection do
        get :counts
        get :timeline
        get :purge
      end
    end
  end

  resources :apps do
    member do
      post :search
    end
    resources :conversations

    #resources :campaigns, concerns: :messageable

    namespace :messages do
      resources :user_auto_message, controller: 'campaigns/user_auto_messages' , concerns: :messageable
      resources :camaigns, controller: 'campaigns/mailings', concerns: :messageable
      resources :tours, controller: 'campaigns/tours', concerns: :messageable
    end

    resources :app_users
    resources :segments do
      member do
        delete :delete_predicate
      end
    end
  end
=end

  resource :oembed, controller: "oembed", only: :show

  get "/user_session", to: 'application#user_session'

  get "/aaaa", to: 'application#user_session', as: 'user_auto_message'

  get "/apps/:app_id/segments/:id/:jwt", to: 'segments#show', constraints: { jwt: /.+/ }

  root :to => "home#show"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get "tester" => 'client_tester#show'
  get "tester/:id" => 'client_tester#show'
  get "tester/:id/:id2" => 'client_tester#show'
  get "tester/:id/:id2/id3" => 'client_tester#show'
  get "tester/:id/:id2/id3/:id4" => 'client_tester#show'




  scope path: '/api' do
    scope path: '/v1' do
      resources :hooks, only: [:create], controller: "api/v1/hooks"
      resources :apps, controller: "api/v1/apps" do
        
        member do 
          post :ping
          post :auth
        end

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

        resources :conversations, controller: "api/v1/conversations" do
        end
        
      end
    end
  end

  get '*path', to: 'application#catch_all', constraints: lambda { |req|
    req.path.exclude? 'rails/active_storage'
  }

end
