require 'sidekiq/web'
Rails.application.routes.draw do
  mount Sidekiq::Web => '/sidekiq'

  resources :campaigns
  devise_for :users

  resources :apps do
    member do
      post :search
    end
    resources :conversations
    resources :campaigns do
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
        end
      end
    end

    resources :app_users
    resources :segments do
      member do
        delete :delete_predicate
      end
    end
  end

  resource :oembed, controller: "oembed", only: :show

  get "/user_session", to: 'application#user_session'

  get "/apps/:app_id/segments/:id/:jwt", to: 'segments#show', constraints: { jwt: /.+/ }

  root :to => "home#show"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get "tester" => 'client_tester#show'




  scope path: '/api' do
    scope path: '/v1' do
      resources :hooks, only: [:create], controller: "api/v1/hooks"
      resources :apps, controller: "api/v1/apps" do
        member do 
          post :ping
        end

        resources :conversations, controller: "api/v1/conversations" do
        end
        
      end
    end
  end

  get '*path', to: 'application#catch_all'

end
