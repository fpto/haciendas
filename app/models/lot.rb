class Lot < ApplicationRecord
  has_many :animals
  def number_with_ranch
    " #{ranch} - #{species} - #{number}"
  end
  def self.lot_stats
    select("
      lots.ranch as ranch,
      lots.species as species,
      animals.lot_id as lot_id,
      lots.number as number,
      lots.name as name,
      COUNT(distinct weights.animal_id) as count,
      AVG(weights.weight) as average_weight,
      AVG(date(NOW()) - dates.latest_date) as days_since_last_weight,
      AVG(weights.weight - w2.weight) as weight_change,
      AVG((weights.weight - w2.weight) /  NULLIF((dates.latest_date - dates.before_date),0)) as daily_gain")
      .joins("
        LEFT JOIN animals ON lots.id = animals.lot_id
        LEFT JOIN weights ON weights.animal_id = animals.id
        LEFT JOIN (
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
        JOIN weights w2 ON  w2.animal_id = dates.animal_id AND w2.date = dates.before_date ")
      .group("lots.ranch, lots.species, animals.lot_id, lots.number, lots.name")
  end
end
