class Plot < ApplicationRecord
  has_many :plot_evaluations, dependent: :destroy
  def number_with_type
    "#{id} - número: #{number}, tipo: #{plot_type}"
  end
  def self.latest_plot_scores
    select(
      "plot_evaluations.id as plot_evaluation,
      plot_evaluations.plot_id as plot_id,
      CAST(plots.number AS int) as number,
      plots.plot_type as plot_type,
      plots.ranch as ranch,
      plots.area as area,
      plot_evaluations.water_score as water_score,
      plot_evaluations.pasture_score as pasture_score,
      plot_evaluations.fences_score as fences_score,
      ROUND(CAST((plot_evaluations.water_score + plot_evaluations.pasture_score + plot_evaluations.fences_score) AS decimal )/3,2) as average ")
      .joins("JOIN plot_evaluations ON plot_evaluations.plot_id = plots.id")
      .where("(plot_evaluations.plot_id, plot_evaluations.id) IN (SELECT plot_id as pi, max(id) as re FROM plot_evaluations GROUP by plot_id)")
  end
  def self.avg_plot_scores
    select(
      "plots.ranch as ranch,
	     plots.plot_type as plot_type,
       AVG(plots.area) as avg_area,
       SUM(plots.area) as area_sum,
    AVG(plot_evaluations.water_score) as water_score,
    AVG(plot_evaluations.pasture_score) as pasture_score,
    AVG(plot_evaluations.fences_score ) as fences_score,
    AVG(ROUND(CAST((plot_evaluations.water_score + plot_evaluations.pasture_score + plot_evaluations.fences_score) AS decimal )/3,2)) as average"
    )
    .joins("JOIN plot_evaluations ON plot_evaluations.plot_id = plots.id")
    .where("(plot_evaluations.plot_id, plot_evaluations.id) IN (SELECT plot_id as pi, max(id) as re FROM plot_evaluations GROUP by plot_id)")
    .group("plots.ranch, plots.plot_type")

  end

end
