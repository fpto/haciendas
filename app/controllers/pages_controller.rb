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
  end
end
