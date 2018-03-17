Rails.application.routes.draw do
  resources :sales
  resources :lots
  resources :plot_evaluations
  resources :plots
  resources :weights
  resources :animals
  put 'sell_animal', to: 'animals#sell', as: :sell_animals
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root to: 'pages#home'

  get 'signup'  => 'users#new'
  get 'users/error' => 'users#error'
  resources :users

  get 'login' => 'sessions#new'
  post 'login' => 'sessions#create'
  delete 'logout' => 'sessions#destroy'

end
