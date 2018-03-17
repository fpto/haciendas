class AddSaleToAnimals < ActiveRecord::Migration[5.1]
  def change
    add_reference :animals, :sale, foreign_key: true
  end
end
