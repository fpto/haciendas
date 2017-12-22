class AddRanchToAnimals < ActiveRecord::Migration[5.1]
  def change
    add_column :animals, :ranch, :string
  end
end
