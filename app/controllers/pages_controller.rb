class PagesController < ApplicationController
  def home
    # This is to calculate the latest two weights of each animal
    @latest_weights = Weight.select(
      "dates.animal_id as animal_id,
      animals.ranch as ranch,
      animals.species as species,
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
    # General Average Daily Gain
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
    # Bovine and Ovine Average Daily Gain and Average Weight
    @sum_latest_daily_gains_b =  @animals_with_gain_b =  @animals_b = 0
    @latest_average_daily_gain_b = @sum_latest_weights_b = @average_latest_weight_b = 0
    @sum_latest_daily_gains_o =  @animals_with_gain_o =  @animals_o = 0
    @latest_average_daily_gain_o = @sum_latest_weights_o = @average_latest_weight_o = 0
    @latest_weights.each do |animal|
      animal.daily_gain ||= 0
      if animal.species == 'bovino' then
        @sum_latest_daily_gains_b += animal.daily_gain
        @sum_latest_weights_b += animal.last_weight
        @animals_b += 1
        if animal.days_between_weights > 0
          @animals_with_gain_b += 1
        end
      end
      if animal.species == 'ovino' then
        @sum_latest_daily_gains_o += animal.daily_gain
        @sum_latest_weights_o += animal.last_weight
        @animals_o += 1
        if animal.days_between_weights > 0
          @animals_with_gain_o += 1
        end
      end
    end
    # Bovine KPIs
    if @animals_with_gain_b > 0 then
      @latest_average_daily_gain_b = @sum_latest_daily_gains_b / @animals_with_gain_b
    end

    if @animals_b > 0 then
      @average_latest_weight_b = @sum_latest_weights_b/@animals_b
    end
    # Ovine KPIs
    if @animals_with_gain_o > 0 then
      @latest_average_daily_gain_o = @sum_latest_daily_gains_o / @animals_with_gain_o
    end

    if @animals_o > 0 then
      @average_latest_weight_o = @sum_latest_weights_o/@animals_o
    end

    #Every animal should have a weight for data to be accurate

    # Calculate the average Max weight:
    @average_max_weight = 777

    @days_in_ranch = Weight.select("weights.animal_id as animal_id, animals.species as species,
      animals.ranch as ranch,  date(NOW()) - MIN(weights.date) as days_in_ranch  ")
    .joins("JOIN animals ON animals.id = weights.animal_id").group("weights.animal_id, animals.species, animals.ranch")
    # Calculates average date dif - Días desde ingreso
    @sum_days_in_ranch_b = @count_a_in_ranch_b = @avg_days_in_ranch_b = 0
    @sum_days_in_ranch_o = @count_a_in_ranch_o = @avg_days_in_ranch_o = 0

    @days_in_ranch.each do |animal|
      if animal.species == 'bovino' then
        @sum_days_in_ranch_b += animal.days_in_ranch
        @count_a_in_ranch_b += 1
      end
      if animal.species == 'ovino' then
        @sum_days_in_ranch_o += animal.days_in_ranch
        @count_a_in_ranch_o += 1
      end
    end
    if @count_a_in_ranch_b > 0 then
      @avg_days_in_ranch_b = @sum_days_in_ranch_b / @count_a_in_ranch_b
    end
    if @count_a_in_ranch_o > 0 then
      @avg_days_in_ranch_o = @sum_days_in_ranch_o / @count_a_in_ranch_o
    end

    # I use in the home page now the latest daily gain, since it's more dynamic


    # For the graph
    @data = Weight.totals_by_year_month

    # For the Plot Scores
    @recent_scores = PlotEvaluation.select(
      "plot_evaluations.id,
      plot_evaluations.plot_id,
      plots.number,
      plots.plot_type as pt,
      ROUND(CAST((plot_evaluations.water_score + plot_evaluations.pasture_score + plot_evaluations.fences_score) AS decimal )/3,2) as average ")
      .joins("JOIN plots ON plot_evaluations.plot_id = plots.id")
      .where("(plot_evaluations.plot_id, plot_evaluations.id) IN (SELECT plot_id as pi, max(id) as re FROM plot_evaluations GROUP by plot_id)")
    # Plot  Calculations for Los Sauces
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
