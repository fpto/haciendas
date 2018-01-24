class CreateLots < ActiveRecord::Migration[5.1]
  def change
    create_table :lots do |t|
      t.string :ranch
      t.string :species
      t.string :number
      t.string :name
      t.text :description

      t.timestamps
    end
  end
end
