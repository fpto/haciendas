class Plot < ApplicationRecord
  has_many :plot_evaluations, dependent: :destroy
  def number_with_type
    "#{ranch} - #{plot_type} - #{number}"
  end
  def self.search(search)
    if search
      where(number: search)
      .or(Plot.where(ranch: search))
      .or(Plot.where(plot_type: search))
    else
      where("plot_id > 0")
    end
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
      ROUND(CAST((plot_evaluations.water_score + plot_evaluations.pasture_score + plot_evaluations.fences_score) AS decimal )/3,2) as average,
      date(NOW()) - plot_evaluations.date as days_since_last_evaluation ")
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
