Rails.application.routes.draw do
  resources :plot_evaluations
  resources :plots
  resources :weights
  resources :animals
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  
  root to: 'pages#home'
end
