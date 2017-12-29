class Animal < ApplicationRecord
  has_many :weights, dependent: :destroy
end
