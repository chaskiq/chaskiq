Rails.application.routes.draw do
  devise_for :users

  resources :apps do
    member do
      post :search
    end
    resources :app_users
    resources :segments do
      member do
        delete :delete_predicate
      end
    end
  end

  get "/apps/:app_id/segments/:id/:jwt", to: 'segments#show', constraints: { jwt: /.+/ }

  root :to => "home#show"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get "tester" => 'client_tester#show'


  scope path: '/api' do
    scope path: '/v1' do
      resources :apps, controller: "api/v1/apps" do
        member do 
          post :ping
        end

        resources :conversations, controller: "api/v1/conversations" do
        end
        
      end
    end
  end

end
