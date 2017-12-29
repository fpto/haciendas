class ChangeWeedScoreName < ActiveRecord::Migration[5.1]
  def change
    rename_column :plot_evaluations, :weed_score, :water_score
  end
end
