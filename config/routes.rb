Rails.application.routes.draw do
  resources :sales
  resources :lots
  resources :plot_evaluations
  resources :plots
  resources :weights
  resources :animals
  get 'edit_multiple_animals', to: 'animals#edit_multiple', as: :edit_multiple_animals
  put 'update_multiple_animals', to: 'animals#update_multiple', as: :update_multiple_animals
  post 'import_animals', to: 'animals#import', as: :import_animals
  post 'import_weights', to: 'weights#import', as: :import_weights
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root to: 'pages#home'

  get 'signup'  => 'users#new'
  get 'users/error' => 'users#error'
  resources :users

  get 'login' => 'sessions#new'
  post 'login' => 'sessions#create'
  delete 'logout' => 'sessions#destroy'

end
