class PagesController < ApplicationController
  def home
    # This is to calculate the latest two weights of each animal
    @latest_weights = Animal.latest_weights.order("animal_id")
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

    @wl250 = @w250 = @w500 = @w750 = @w1000 = @winv = 0
    @owl25 = @ow25 = @ow50 = @ow75 = @ow100 = @owinv = 0
    @latest_weights.each do |animal|
      animal.daily_gain ||= 0
      if animal.species == 'bovino' then
        @sum_latest_daily_gains_b += animal.daily_gain
        @sum_latest_weights_b += animal.last_weight
        @animals_b += 1
          if animal.last_weight <= 250 then @wl250 +=1
          elsif  animal.last_weight  > 250.01 and animal.last_weight < 500 then @w250 += 1
          elsif  animal.last_weight > 500.01 and animal.last_weight < 750 then @w500 += 1
          elsif animal.last_weight >  750.01 and animal.last_weight < 1000 then  @w750 += 1
          elsif  animal.last_weight >= 1000.01 then @w1000 += 1
          else @winv  += 1
          end
        if animal.days_between_weights > 0
          @animals_with_gain_b += 1
        end
      end
      if animal.species == 'ovino' then
        @sum_latest_daily_gains_o += animal.daily_gain
        @sum_latest_weights_o += animal.last_weight
        @animals_o += 1
        if animal.last_weight <= 25 then @wl250 +=1
        elsif  animal.last_weight  > 25.01 and animal.last_weight < 50 then @ow25 += 1
        elsif  animal.last_weight > 50.01 and animal.last_weight < 75 then @ow50 += 1
        elsif animal.last_weight >  75.01 and animal.last_weight < 100 then  @ow75 += 1
        elsif  animal.last_weight >= 100.01 then @ow100 += 1
        else @owinv  += 1
        end
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

    @days_in_ranch = Animal.days_in_ranch
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
    @recent_scores = Plot.latest_plot_scores
    # Plot  Calculations for Los Sauces
    #Bovinos & Ovinos
    @sum_pasture_scores_b_s = @sum_pasture_scores_o_s = @sum_pasture_scores_b_l = 0.0
    @sum_water_scores_b_s = @sum_water_scores_o_s = @sum_water_scores_b_l = 0.0
    @sum_fences_scores_b_s = @sum_fences_scores_o_s = @sum_fences_scores_b_l = 0.0

    @sum_av_scores_b_s =  @count_scores_b_s = 0.0
    @sum_av_scores_o_s =  @count_scores_o_s = 0.0
    @sum_av_scores_b_l =  @count_scores_b_l = 0.0
    @sum_sauces_area_b = @sum_sauces_area_o = 0.0
    @sum_laureles_area_b = 0.0

    @recent_scores.each {|p|
      p.area ||= 0
      if p.ranch == 'sauces' then
        if p.plot_type == 'bovino' then
          @sum_av_scores_b_s += p.average
          @count_scores_b_s += 1
          @sum_pasture_scores_b_s += p.pasture_score
          @sum_water_scores_b_s += p.water_score
          @sum_fences_scores_b_s += p.fences_score
          @sum_sauces_area_b += p.area
        end
        if p.plot_type == 'ovino'  then
          @sum_av_scores_o_s += p.average
          @count_scores_o_s += 1
          @sum_pasture_scores_o_s += p.pasture_score
          @sum_water_scores_o_s += p.water_score
          @sum_fences_scores_o_s += p.fences_score
          @sum_sauces_area_o += p.area
        end

      end
      if p.ranch == 'laureles' then
        if p.plot_type == 'bovino' then
          @sum_av_scores_b_l += p.average
          @count_scores_b_l += 1
          @sum_pasture_scores_b_l += p.pasture_score
          @sum_water_scores_b_l += p.water_score
          @sum_fences_scores_b_l += p.fences_score
          @sum_laureles_area_b += p.area
        end
      end
    }

    @average_recent_plot_score_b_s = if @count_scores_b_s > 0 then (@sum_av_scores_b_s / @count_scores_b_s).round(2) else "N/A" end
    @average_pasture_plot_score_b_s = if @count_scores_b_s > 0 then (@sum_pasture_scores_b_s / @count_scores_b_s).round(2) else "N/A" end
    @average_fences_plot_score_b_s = if @count_scores_b_s > 0 then (@sum_fences_scores_b_s / @count_scores_b_s).round(2) else "N/A" end
    @average_water_plot_score_b_s = if @count_scores_b_s > 0 then (@sum_water_scores_b_s / @count_scores_b_s).round(2) else "N/A" end



    @average_recent_plot_score_o_s = if @count_scores_o_s > 0 then (@sum_av_scores_o_s / @count_scores_o_s).round(2) else "N/A" end
    @average_pasture_plot_score_o_s = if @count_scores_o_s > 0 then (@sum_pasture_scores_o_s / @count_scores_o_s).round(2) else "N/A" end
    @average_fences_plot_score_o_s = if @count_scores_o_s > 0 then (@sum_fences_scores_o_s / @count_scores_o_s).round(2) else "N/A" end
    @average_water_plot_score_o_s = if @count_scores_o_s > 0 then (@sum_water_scores_o_s / @count_scores_o_s).round(2) else "N/A" end

    @average_recent_plot_score_b_l = if @count_scores_b_l > 0 then (@sum_av_scores_b_l / @count_scores_b_l).round(2) else "N/A" end
    @average_pasture_plot_score_b_l = if @count_scores_b_l > 0 then (@sum_pasture_scores_b_l / @count_scores_b_l).round(2) else "N/A" end
    @average_fences_plot_score_b_l = if @count_scores_b_l > 0 then (@sum_fences_scores_b_l / @count_scores_b_l).round(2) else "N/A" end
    @average_water_plot_score_b_l = if @count_scores_b_l > 0 then (@sum_water_scores_b_l / @count_scores_b_l).round(2) else "N/A" end

    @animals_b_s = @animals_o_s = @animals_b_l = 0
    @latest_weights.each{ |animal|
      if animal.ranch == 'sauces' then
        if  animal.species == 'bovino' then
          @animals_b_s += 1
        end
        if animal.species == 'ovino' then
          @animals_o_s += 1
        end
      end
      if animal.ranch == 'laureles' and animal.species == 'bovino' then
        @animals_b_l += 1
      end

      }
    @average_plot_load_b_s = if @animals_b_s > 0 then (@animals_b_s  / @sum_sauces_area_b).round(2) else "N/A" end
    @average_plot_load_o_s = if @animals_o_s > 0 then (@animals_o_s /  @sum_sauces_area_o).round(2) else "N/A" end
    @average_plot_load_b_l = if @animals_b_l > 0 then (@animals_b_s  / @sum_laureles_area_b).round(2) else "N/A" end
  end
end
