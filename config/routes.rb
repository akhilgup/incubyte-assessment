Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      resources :employees
      resource :salary_insights, only: [] do
        collection do
          get :by_country
          get :by_country_and_title
          get :summary
        end
      end
    end
  end
end
