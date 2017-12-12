class Plot < ApplicationRecord
  has_many :plot_evaluations
  def number_with_type
  "#{id} - número: #{number}, tipo: #{plot_type}"
  end
end
