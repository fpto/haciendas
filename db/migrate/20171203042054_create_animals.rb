class CreateAnimals < ActiveRecord::Migration[5.1]
  def change
    create_table :animals do |t|
      t.integer :animal_number
      t.string :species
      t.date :birthday

      t.timestamps
    end
  end
end
