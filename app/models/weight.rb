class Weight < ApplicationRecord
  belongs_to :animal
  def self.import(file)
    CSV.foreach(file.path, headers: true) do |row|
      Weight.create! row.to_hash
    end
  end
end
