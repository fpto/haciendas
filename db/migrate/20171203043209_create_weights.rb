class CreateWeights < ActiveRecord::Migration[5.1]
  def change
    create_table :weights do |t|
      t.references :animal
      t.date :date
      t.float :weight
      t.text :note

      t.timestamps
    end
  end
end
