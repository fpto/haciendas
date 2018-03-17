class Sale < ApplicationRecord
  has_many :animals
  def date_with_buyer
    " #{date} - #{buyer}"
  end
end
