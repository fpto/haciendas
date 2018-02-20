class AddStatusToAnimals < ActiveRecord::Migration[5.1]
  def change
    add_column :animals, :status, :string
  end
end
