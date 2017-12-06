class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  def self.totals_by_year_month
  find_by_sql(<<-SQL
    SELECT
      date,
      COUNT(distinct id) as animals_counted
      FROM WEIGHTS GROUP BY 1 ORDER BY 1
    SQL
  ).map do |row|
    [
      row['date'].strftime("%d/%m"),
      row.animals_counted.to_f,
    ]
  end
end
end
