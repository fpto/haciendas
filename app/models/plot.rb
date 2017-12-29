class Plot < ApplicationRecord
  has_many :plot_evaluations, dependent: :destroy
  def number_with_type
  "#{id} - número: #{number}, tipo: #{plot_type}"
  end
end
