class AddSalePriceToAnimals < ActiveRecord::Migration[5.1]
  def change
    add_column :animals, :sale_price, :float
  end
end
