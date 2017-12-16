class AddBoundariesToPlot < ActiveRecord::Migration[5.1]
  def change
    add_column :plots, :boundaries, :text
  end
end
