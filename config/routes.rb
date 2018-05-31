Rails.application.routes.draw do
  devise_for :users

  resources :apps do
    resources :app_users
  end

  root :to => "home#show"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get "tester" => 'client_tester#show'
end
