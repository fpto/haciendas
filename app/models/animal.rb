class Animal < ApplicationRecord
  has_many :weights, dependent: :destroy

  def self.search(search)
    if search
      where(animal_number: search)
    else
      where("animal_number > 0")
    end
  end
end
