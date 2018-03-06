class AddColumnsToAnimal < ActiveRecord::Migration[5.1]
  def change
    add_column :animals, :breed, :string
    add_column :animals, :provider, :string
    add_column :animals, :mark, :string
    add_column :animals, :color, :string
    add_column :animals, :purchase_price, :float
  end
end
