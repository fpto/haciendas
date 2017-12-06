class CreatePlots < ActiveRecord::Migration[5.1]
  def change
    create_table :plots do |t|
      t.string :number
      t.float :area
      t.string :ranch
      t.string :plot_type
      t.text :comment

      t.timestamps
    end
  end
end
