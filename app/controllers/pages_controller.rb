class PagesController < ApplicationController
  def home
    # This is to calculate the latest two weights of each animal
    @average_weight = Animal.average_weight.where(:status => "engorde")
    @bovine_average_weight = @ovine_average_weight = 0
    @bovine_count = @ovine_count = 0
    @average_weight.each{ |animal|
      case animal.species
        when 'bovino'
        @bovine_average_weight += animal.average_weight
        @bovine_count += animal.count
      end
    }

    @bovine_daily_gain = @ovine_daily_gain = 0

    @daily_gain = Animal.daily_gain.where(:status => "engorde")
    @daily_gain.each{ |animal|
      case animal.species
        when 'bovino'
        @bovine_daily_gain += animal.daily_gain
      end
    }



    #Every animal should have a weight for data to be accurate

    @days_in_ranch = Animal.days_in_ranch.where(:status => "engorde")
    # Calculates average date dif - Días desde ingreso
   @avg_days_in_ranch_b = @avg_days_in_ranch_o = 0

    @days_in_ranch.each do |animal|
      if animal.species == 'bovino' then
        @avg_days_in_ranch_b += animal.days_in_ranch
      end
    end


    # I use in the home page now the latest daily gain, since it's more dynamic


    # For the graph
    @data = Weight.totals_by_year_month

    # For the Plot Scores
    @recent_scores = Plot.latest_plot_scores
    # Plot  Calculations for Los Sauces
    #Bovinos & Ovinos
    @sum_sauces_area_b = @sum_sauces_area_o = 0.0
    @sum_laureles_area_b = @sum_sauces_area_b = 0.0
    @average_recent_plot_score_b_s  =  @average_pasture_plot_score_b_s = 0
    @average_fences_plot_score_b_s  = @average_water_plot_score_b_s  = 0
    @average_recent_plot_score_o_s  = @average_pasture_plot_score_o_s = 0
    @average_fences_plot_score_o_s  = @average_water_plot_score_o_s   = 0
    @sum_sauces_area_o              = 0
    @average_recent_plot_score_b_l =@average_pasture_plot_score_b_l = 0
@average_fences_plot_score_b_l =@average_water_plot_score_b_l  = 0
@sum_laureles_area_b            = 0

    @avg_plot_scores = Plot.avg_plot_scores
    @avg_plot_scores.each {|p|
      p.area_sum ||= 0
      if p.ranch == 'sauces' then
        if p.plot_type == 'bovino' then
          @average_recent_plot_score_b_s  += p.average
          @average_pasture_plot_score_b_s += p.pasture_score
          @average_fences_plot_score_b_s  += p.fences_score
          @average_water_plot_score_b_s   += p.water_score
          @sum_sauces_area_b              += p.area_sum
        end
        if p.plot_type == 'ovino'  then
          @average_recent_plot_score_o_s   += p.average
          @average_pasture_plot_score_o_s  += p.pasture_score
          @average_fences_plot_score_o_s   += p.fences_score
          @average_water_plot_score_o_s    += p.water_score
          @sum_sauces_area_o               += p.area_sum
        end

      end
      if p.ranch == 'laureles' then
        if p.plot_type == 'bovino' then
          @average_recent_plot_score_b_l   += p.average
          @average_pasture_plot_score_b_l  += p.pasture_score
          @average_fences_plot_score_b_l   += p.fences_score
          @average_water_plot_score_b_l    += p.water_score
          @sum_laureles_area_b             += p.area_sum
        end
      end
    }

    @animal_number = @animals_b_s = @animals_o_s = @animals_b_l = 0
    @animal_number = Animal.animal_number.growing
    @animal_number.each{ |animal|
      if animal.ranch == 'sauces' then
        if  animal.species == 'bovino' then
          @animals_b_s += animal.count
        end
        if animal.species == 'ovino' then
          @animals_o_s += animal.count
        end
      end
      if animal.ranch == 'laureles' and animal.species == 'bovino' then
        @animals_b_l += animal.count
      end

      }
    @average_plot_load_b_s = if @animals_b_s > 0 then (@animals_b_s  / @sum_sauces_area_b).round(2) else 0 end
    @average_plot_load_o_s = if @animals_o_s > 0 then (@animals_o_s /  @sum_sauces_area_o).round(2) else 0 end
    @average_plot_load_b_l = if @animals_b_l > 0 then (@animals_b_l  / @sum_laureles_area_b).round(2) else 0 end
    end
end
