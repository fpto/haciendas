class CreatePlotEvaluations < ActiveRecord::Migration[5.1]
  def change
    create_table :plot_evaluations do |t|
      t.references :plot, foreign_key: true
      t.date :date
      t.integer :weed_score
      t.integer :pasture_score
      t.integer :fences_score
      t.text :comment

      t.timestamps
    end
  end
end
