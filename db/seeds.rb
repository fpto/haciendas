# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

animal1 = Animal.create(animal_number:1, species: "Bovino", birthday: "2017-1-1")
animal1 = Animal.create(animal_number:2, species: "Bovino", birthday: "2017-1-2")
Weight.create(animal_id: 1, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 1, weight: 320, date: '2017-01-20')
Weight.create(animal_id: 2, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 2, weight: 320, date: '2017-01-20')

plot1 = Plot.create(number:1, area: 20, ranch:"sauces", plot_type: "ovino")
plot2 = Plot.create(number:2, area: 20, ranch:"sauces", plot_type: "ovino")
plot3 = Plot.create(number:1, area: 20, ranch:"sauces", plot_type: "bovino")
plot4 = Plot.create(number:2, area: 20, ranch:"sauces", plot_type: "bovino")
