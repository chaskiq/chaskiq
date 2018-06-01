Rails.application.routes.draw do
  devise_for :users

  resources :apps do
    resources :app_users
  end

  root :to => "home#show"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get "tester" => 'client_tester#show'


  scope path: '/api' do
    scope path: '/v1' do
      resources :apps, controller: "api/v1/apps" do
        member do 
          post :ping
        end
      end
    end
  end

end
