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
    @average_daily_gains = @sum_daily_weight_gains /@number_of_animals

    # For the graph
    @data = Weight.totals_by_year_month

    # For the Plot Scores
    # TODO Filter out the score by plot_type
    @recent_scores_bovinos = PlotEvaluation.select('plots.plot_type, plot_evaluations.plot_id,
    plot_evaluations.date,
    ROUND(CAST((plot_evaluations.weed_score + plot_evaluations.pasture_score + plot_evaluations.fences_score) AS decimal )/3,2) as average').joins(:plot)
    @sum_av_scores = 0
    @recent_scores_bovinos.each {|p| @sum_av_scores += p.average}
    @count_av_scores = 0
    @recent_scores_bovinos.each {|p| @count_av_scores += 1}
    @average_recent_plot_score = (@sum_av_scores / @count_av_scores).round(2)




  end
end
