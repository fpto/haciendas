class PagesController < ApplicationController
  def home
    @weights = Weight.all
    #Every animal should have a weight for data to be accurate
    @animals = Animal.all
    @number_of_animals = Animal.count()

    # Calculate the average Max weight:
    @max_weights =  Weight.group('animal_id').maximum(:weight)
    @sum_max_weights = 0
    @max_weights.each { |key, value| @sum_max_weights += value }
    @average_max_weight = @sum_max_weights/@number_of_animals

    # Calculates average date dif - Días desde ingreso
    @min_dates = Weight.group('animal_id').minimum(:date)
    @sum_date_dif = 0
    @min_dates.each {|key,value| @sum_date_dif += (Date.today - value.to_date).to_f }
    @average_date_dif = @sum_date_dif/@number_of_animals

    @min_weights = Weight.group('animal_id').minimum(:weight)
    @weight_gains = @max_weights.merge(@min_weights) { |k, v1, v2| v1 - v2 }
    # It's working until here, next an hash with date-difs
    @max_dates = Weight.group('animal_id').maximum(:date)
    @date_difs = {}
    @date_difs = @max_dates.merge(@min_dates) { |k, v1, v2| (v1 - v2).to_i }
    #Now we need to divide each element of  weight_gains with date_difs
    @daily_weight_gains = @weight_gains.merge(@date_difs) { |k, v1, v2| if v2 != 0 then v1 / v2 else 0 end }
    #Finally we sum them up and then divide them by the number of animals
    @sum_daily_weight_gains = 0
    @daily_weight_gains.each {|key,value| @sum_daily_weight_gains += value}
    @average_daily_gain = @sum_daily_weight_gains /@number_of_animals
    # This calculates the average daily gain during stay
    # I use in the home page now the latest daily gain, since it's more dynamic

    # This is to calculate the latest two weights of each animal
    @latest_weights = Weight.select(
      "dates.animal_id as animal_id,
      animals.ranch as ranch,
    weights.weight as last_weight,
    dates.latest_date - dates.before_date as days_between_weights,
    date(NOW()) - dates.latest_date as days_since_last_weight,
    weights.weight - w2.weight as wg,
    (weights.weight - w2.weight) /  NULLIF((dates.latest_date - dates.before_date),0) as daily_gain")
    .joins("JOIN (
     SELECT
      animal_id,
      MAX(weights.date) as latest_date,
      MIN(weights.DATE) as before_date
      FROM   weights
      WHERE
        (
          SELECT 	COUNT(*)
          FROM 	weights  f
          WHERE f.animal_id = weights.animal_id AND
              f.weight >= weights.weight
        ) <= 2
      GROUP BY animal_id) as dates ON weights.animal_id = dates.animal_id AND weights.date = dates.latest_date
      JOIN weights w2 ON  w2.animal_id = dates.animal_id AND w2.date = dates.before_date
      JOIN animals ON animals.id = dates.animal_id").order("animal_id")
    @sum_latest_daily_gains = 0
    @animals_with_gain = 0
    @latest_weights.each do |animal|
      animal.daily_gain ||= 0
      @sum_latest_daily_gains += animal.daily_gain
      if animal.days_between_weights > 0
        @animals_with_gain += 1
      end
    end
    @latest_average_daily_gain = @sum_latest_daily_gains / @animals_with_gain

    # For the graph
    @data = Weight.totals_by_year_month

    # For the Plot Scores
    # TODO Filter out the score by plot_type
    @recent_scores = PlotEvaluation.select(
      "plot_evaluations.id,
      plot_evaluations.plot_id,
      plots.number,
      plots.plot_type as pt,
      ROUND(CAST((plot_evaluations.water_score + plot_evaluations.pasture_score + plot_evaluations.fences_score) AS decimal )/3,2) as average ")
      .joins("JOIN plots ON plot_evaluations.plot_id = plots.id")
      .where("(plot_evaluations.plot_id, plot_evaluations.id) IN (SELECT plot_id as pi, max(id) as re FROM plot_evaluations GROUP by plot_id)")
    #Bovinos
    @sum_av_scores_b = 0
    @recent_scores.each {|p| if p.pt == 'bovino' then @sum_av_scores_b += p.average end}
    @count_av_scores_b = 0
    @recent_scores.each {|p|if p.pt == 'bovino'  then @count_av_scores_b += 1 end}
    @average_recent_plot_score_b = if @count_av_scores_b > 0 then (@sum_av_scores_b / @count_av_scores_b).round(2) else "N/A" end
    #Ovinos
    @sum_av_scores_o = 0
    @recent_scores.each {|p| if p.pt == 'ovino' then @sum_av_scores_o += p.average end}
    @count_av_scores_o = 0
    @recent_scores.each {|p| if p.pt == 'ovino' then @count_av_scores_o += 1 end}
    @average_recent_plot_score_o = if @count_av_scores_o > 0 then (@sum_av_scores_o / @count_av_scores_o).round(2) else "N/A" end



  end
end
