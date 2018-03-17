class Sale < ApplicationRecord
  has_many :animals
  def date_with_buyer
    " #{date} - #{buyer}"
  end
  def self.sale_stats
    select(
      "sales.id as sale_id,
      sales.date as date,
      sales.buyer as buyer,
      COUNT(distinct animals.id) as animal_count,
      SUM(latest_weight.weight) as sum_weight,
      AVG(latest_weight.weight) as avg_weight,
      SUM(animals.sale_price * latest_weight.weight) as sale_total,
      SUM(latest_weight.weight - first_weight.weight) as weight_change,
      AVG((latest_weight.weight - first_weight.weight) /  NULLIF((dates.latest_date - dates.first_date),0)) as daily_gain"
  ).joins(
    "JOIN animals ON animals.sale_id = sales.id
    JOIN (SELECT animal_id, min(date) as first_date, max(date) as latest_date FROM weights GROUP BY weights.animal_id ) as dates ON dates.animal_id = animals.id
    JOIN weights latest_weight ON latest_weight.animal_id = animals.id AND dates.latest_date = latest_weight.date
    JOIN weights first_weight ON first_weight.animal_id = animals.id AND dates.first_date = first_weight.date"
  ).group("sales.id")


  end
end
