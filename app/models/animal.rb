class Animal < ApplicationRecord
  has_many :weights, dependent: :destroy
  belongs_to :lot
  belongs_to :sale, optional: true
  validates :sale_price, numericality: { message: "%{value} no es un número", allow_blank: true }
  validates :purchase_price, numericality: { message: "%{value} no es un número", allow_blank: true }

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
    lots.number as lot_number,
    dates.latest_date as latest_date,
    weights.weight as last_weight,
    dates.before_date as before_date,
    w2.weight as former_weight,
    dates.latest_date - dates.before_date as days_between_weights,
    date(NOW()) - dates.latest_date as days_since_last_weight,
    weights.weight - w2.weight as weight_change,
    (weights.weight - w2.weight) /  NULLIF((dates.latest_date - dates.before_date),0) as daily_gain,
    animals.status as status,
    animals.purchase_price as purchase_price,
    animals.provider as provider")
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
  				  f.date > weights.date
  		        ) < 2
  	    GROUP BY animal_id) as dates ON weights.animal_id = dates.animal_id AND weights.date = dates.latest_date
      JOIN weights w2 ON  w2.animal_id = dates.animal_id AND w2.date = dates.before_date
      LEFT JOIN lots ON lots.id = animals.lot_id
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
      "COUNT(distinct animals.id) as count,
      stddev(weights.weight) as stddev,
      AVG(weights.weight) as average_weight,
      SUM(weights.weight) as weight_sum,
      AVG(animals.purchase_price) as purchase_price,
      AVG(animals.sale_price) as sale_price,
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
  #TODO Try to remove the coalesce to improve accuracy
  def self.recent_daily_gain_general
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
def self.avg_daily_gain_general
  select(
    "AVG((latest_weight.weight - first_weight.weight) /  NULLIF((dates.latest_date - dates.first_date),0)) as daily_gain,
    AVG(dates.days_in_ranch) as avg_days_in_ranch
    "
  ).joins(
    "JOIN (SELECT animal_id, min(date) as first_date, max(date) as latest_date, (max(date)-min(date)) as days_in_ranch FROM weights GROUP BY weights.animal_id ) as dates ON dates.animal_id = animals.id
    JOIN weights latest_weight ON latest_weight.animal_id = animals.id AND dates.latest_date = latest_weight.date
    JOIN weights first_weight ON first_weight.animal_id = animals.id AND dates.first_date = first_weight.date"
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
  def self.first_last_weights
    select(
    "animals.id as animal_id,
    animals.animal_number as animal_number,
    dates.first_date as first_weighted,
      first_weight.weight as first_weight,
      animals.purchase_price * first_weight.weight as purchase_total,
      dates.latest_date as last_weighted,
      latest_weight.weight as last_weight,
      animals.sale_price * latest_weight.weight as sale_total,
      dates.latest_date - dates.first_date as days_between_weights,
      date(NOW()) - dates.latest_date as days_since_last_weight,
      date(NOW()) - dates.first_date as days_in_ranch,
      latest_weight.weight - first_weight.weight as weight_change,
    (latest_weight.weight - first_weight.weight) /  NULLIF((dates.latest_date - dates.first_date),0) as daily_gain"
    )
    .joins("JOIN (SELECT animal_id, min(date) as first_date, max(date) as latest_date FROM weights GROUP BY weights.animal_id ) as dates ON dates.animal_id = animals.id
    JOIN weights latest_weight ON latest_weight.animal_id = animals.id AND dates.latest_date = latest_weight.date
    JOIN weights first_weight ON first_weight.animal_id = animals.id AND dates.first_date = first_weight.date")

  end


  def self.growing
    where(:status => "engorde")
  end
  def self.animal_number
    select( "ranch, species, COUNT(distinct id) as count")
    .group("ranch, species")
  end
  def self.initial_weight_sum
    select(
	    "animals.ranch as hda,
      animals.lot_id as lot_id,
      animals.species as species,
      SUM(weights.weight) as weight_sum")
    .joins(
      "JOIN (SELECT animal_id, min(date) as ld FROM weights GROUP BY weights.animal_id ) as ld ON ld.animal_id = animals.id
       JOIN weights ON weights.animal_id = animals.id AND ld.ld = weights.date"
    ).group(
      "animals.ranch, animals.lot_id, animals.species"
    )
  end
  def self.to_csv(options = {})
    CSV.generate(options) do |csv|
      csv << column_names
      all.each do |animal|
        csv << animal.attributes.values_at(*column_names)
      end
    end
  end
  def self.import(file)
    CSV.foreach(file.path, headers: true) do |row|
      Animal.create! row.to_hash
    end
  end
end
