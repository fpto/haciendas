class Animal < ApplicationRecord
  has_many :weights, dependent: :destroy

  def self.search(search)
    if search
      where(animal_number: search)
    else
      where("animal_number > 0")
    end
  end

  def self.latest_weights
    select(
      "weights.id as id,
    weights.animal_id as animal_id,
    animals.animal_number as animal_number,
    animals.ranch as ranch,
    animals.species as species,
    dates.latest_date as latest_date,
    weights.weight as last_weight,
    dates.before_date as before_date,
    w2.weight as former_weight,
    dates.latest_date - dates.before_date as days_between_weights,
    date(NOW()) - dates.latest_date as days_since_last_weight,
    weights.weight - w2.weight as weight_change,
    COALESCE((weights.weight - w2.weight) /  NULLIF((dates.latest_date - dates.before_date),0),0) as daily_gain")
    .joins("
      JOIN weights ON weights.animal_id = animals.id
      JOIN (
        SELECT
      	animal_id,
      	MAX(weights.date) as latest_date,
      	MIN(weights.DATE) as before_date
  	    FROM   weights
  	    WHERE (SELECT 	COUNT(*)
  			FROM 	weights  f
  			WHERE f.animal_id = weights.animal_id AND
  				  f.weight >= weights.weight
  		        ) <= 2
  	           GROUP BY animal_id) as dates ON weights.animal_id = dates.animal_id AND weights.date = dates.latest_date
      JOIN weights w2 ON  w2.animal_id = dates.animal_id AND w2.date = dates.before_date
    ")
  end

  def self.days_in_ranch
    select(
      "weights.animal_id as animal_id,
      animals.animal_number as animal_number,
      animals.species as species,
      animals.ranch as ranch,
      date(NOW()) - MIN(weights.date) as days_in_ranch"
    ).joins(
      "JOIN weights ON animals.id = weights.animal_id"
    ).group(
      "weights.animal_id, animals.animal_number, animals.species, animals.ranch"
    )
  end

end
