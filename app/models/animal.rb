class Animal < ApplicationRecord
  has_many :weights, dependent: :destroy
  belongs_to :lot
  def number_with_ranch
    " #{ranch} - #{species} - #{animal_number}"
  end

  def self.search(search)
    if search
      where(animal_number: search)
      .or(Animal.where(species: search))
      .or(Animal.where(ranch: search))
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
    animals.lot_id as lot_id,
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

  def self.average_weight
    select(
      "animals.species as species,
       COUNT(distinct animals.id) as count,
      AVG(weights.weight) as average_weight,
      AVG(date(NOW()) - dates.latest_date) as days_since_last_weight")
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
    .group(
      "animals.species"
    )
  end
  def self.average_weight_general
    select(
      "animals.species as species,
       COUNT(distinct animals.id) as count,
      AVG(weights.weight) as average_weight,
      AVG(date(NOW()) - dates.latest_date) as days_since_last_weight")
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
    .group(
      "animals.species"
    )
  end
  def self.daily_gain
    select(
      "animals.species as species,
      AVG(COALESCE((weights.weight - w2.weight) /  NULLIF((dates.latest_date - dates.before_date),0),0)) as daily_gain")
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
    .where("(dates.latest_date - dates.before_date)>0"
    )
    .group(
      "animals.species"
    )

  end
  def self.daily_gain_general
    select(
      "stddev(COALESCE((weights.weight - w2.weight) /  NULLIF((dates.latest_date - dates.before_date),0),0)) as stddev,
      AVG(COALESCE((weights.weight - w2.weight) /  NULLIF((dates.latest_date - dates.before_date),0),0)) as daily_gain")
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
    .where("(dates.latest_date - dates.before_date)>0"
    )

  end

  def self.days_in_ranch
    select(
      "animals.species as species, AVG( w.days_in_ranch) as days_in_ranch"
    ).joins(
      "JOIN(
	     SELECT animal_id, date(NOW()) - MIN(weights.date) as days_in_ranch FROM weights GROUP BY animal_id) as w
       ON w.animal_id = animals.id"
    ).group(
      "animals.species"
    )
  end
  def self.days_in_ranch_by_ranch
    select(
      "animals.ranch as ranch, animals.species as species, AVG( w.days_in_ranch) as days_in_ranch"
    ).joins(
      "JOIN(
       SELECT animal_id, date(NOW()) - MIN(weights.date) as days_in_ranch FROM weights GROUP BY animal_id) as w
       ON w.animal_id = animals.id"
    ).group(
      "animals.ranch, animals.species"
    )
  end

end
