# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

animal1 = Animal.create(animal_number:1, species: "bovino", birthday: "2017-1-1")
animal2 = Animal.create(animal_number:2, species: "bovino", birthday: "2017-1-2")
Weight.create(animal_id: 1, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 1, weight: 320, date: '2017-01-20')
Weight.create(animal_id: 2, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 2, weight: 320, date: '2017-01-20')

animal3 = Animal.create(animal_number:1, species: "ovino", birthday: "2017-1-1")
animal4 = Animal.create(animal_number:2, species: "ovino", birthday: "2017-1-2")
Weight.create(animal_id: 3, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 3, weight: 320, date: '2017-01-20')
Weight.create(animal_id: 4, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 4, weight: 320, date: '2017-01-20')

plot1 = Plot.create(number:1, area: 20, ranch:"sauces", plot_type: "ovino")
plot2 = Plot.create(number:2, area: 20, ranch:"sauces", plot_type: "ovino")
plot3 = Plot.create(number:1, area: 20, ranch:"sauces", plot_type: "bovino")
plot4 = Plot.create(number:2, area: 20, ranch:"sauces", plot_type: "bovino")

PlotEvaluation.create(plot_id: 1, date: '2017-11-1', weed_score: 3, pasture_score: 2, fences_score: 3)
PlotEvaluation.create(plot_id: 1, date: '2017-12-1', weed_score: 2, pasture_score: 4, fences_score: 5)
PlotEvaluation.create(plot_id: 2, date: '2017-11-1', weed_score: 2, pasture_score: 4, fences_score: 5)
PlotEvaluation.create(plot_id: 2, date: '2017-12-1', weed_score: 4, pasture_score: 4, fences_score: 5)

PlotEvaluation.create(plot_id: 3, date: '2017-11-1', weed_score: 3, pasture_score: 2, fences_score: 3)
PlotEvaluation.create(plot_id: 3, date: '2017-12-1', weed_score: 2, pasture_score: 4, fences_score: 5)
PlotEvaluation.create(plot_id: 4, date: '2017-11-1', weed_score: 2, pasture_score: 4, fences_score: 5)
PlotEvaluation.create(plot_id: 4, date: '2017-12-1', weed_score: 4, pasture_score: 4, fences_score: 5)
