# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

animal1 = Animal.create(animal_number:1, species: "bovino", birthday: "2017-1-1", ranch: 'sauces' )
animal2 = Animal.create(animal_number:2, species: "bovino", birthday: "2017-1-2", ranch: 'sauces')
Weight.create(animal_id: 1, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 1, weight: 320, date: '2017-01-20')
Weight.create(animal_id: 2, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 2, weight: 320, date: '2017-01-20')

animal3 = Animal.create(animal_number:1, species: "ovino", birthday: "2017-1-1", ranch: 'sauces')
animal4 = Animal.create(animal_number:2, species: "ovino", birthday: "2017-1-2", ranch: 'sauces')
Weight.create(animal_id: 3, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 3, weight: 320, date: '2017-01-20')
Weight.create(animal_id: 4, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 4, weight: 320, date: '2017-01-20')

animal1 = Animal.create(animal_number:5, species: "bovino", birthday: "2017-1-1", ranch: 'laureles' )
animal2 = Animal.create(animal_number:6, species: "bovino", birthday: "2017-1-2", ranch: 'laureles')
Weight.create(animal_id: 5, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 5, weight: 320, date: '2017-01-20')
Weight.create(animal_id: 6, weight: 300, date: '2017-01-01')
Weight.create(animal_id: 6, weight: 320, date: '2017-01-20')

plot1 = Plot.create(number:1, area: 20, ranch:"sauces", plot_type: "ovino", boundaries: "{lat: 15.484526, lng: -86.409336}, {lat:15.483420, lng: -86.408842}, {lat:15.483152, lng: -86.407779}, {lat:15.483669, lng: -86.405410}, {lat:15.487005, lng:-86.405706}")
plot2 = Plot.create(number:2, area: 20, ranch:"sauces", plot_type: "ovino", boundaries: "{lat: 15.484526, lng: -86.409336}, {lat:15.483420, lng: -86.408842}, {lat:15.483152, lng: -86.407779}, {lat:15.483669, lng: -86.405410}, {lat:15.487005, lng:-86.405706}")
plot3 = Plot.create(number:1, area: 20, ranch:"sauces", plot_type: "bovino", boundaries: "{lat: 15.484526, lng: -86.409336}, {lat:15.483420, lng: -86.408842}, {lat:15.483152, lng: -86.407779}, {lat:15.483669, lng: -86.405410}, {lat:15.487005, lng:-86.405706}")
plot4 = Plot.create(number:2, area: 20, ranch:"sauces", plot_type: "bovino", boundaries: "{lat: 15.484526, lng: -86.409336}, {lat:15.483420, lng: -86.408842}, {lat:15.483152, lng: -86.407779}, {lat:15.483669, lng: -86.405410}, {lat:15.487005, lng:-86.405706}")

PlotEvaluation.create(plot_id: 1, date: '2017-11-1', water_score: 3, pasture_score: 2, fences_score: 3)
PlotEvaluation.create(plot_id: 1, date: '2017-12-1', water_score: 2, pasture_score: 4, fences_score: 5)
PlotEvaluation.create(plot_id: 2, date: '2017-11-1', water_score: 2, pasture_score: 4, fences_score: 5)
PlotEvaluation.create(plot_id: 2, date: '2017-12-1', water_score: 4, pasture_score: 4, fences_score: 5)

PlotEvaluation.create(plot_id: 3, date: '2017-11-1', water_score: 3, pasture_score: 2, fences_score: 3)
PlotEvaluation.create(plot_id: 3, date: '2017-12-1', water_score: 2, pasture_score: 4, fences_score: 5)
PlotEvaluation.create(plot_id: 4, date: '2017-11-1', water_score: 2, pasture_score: 4, fences_score: 5)
PlotEvaluation.create(plot_id: 4, date: '2017-12-1', water_score: 4, pasture_score: 4, fences_score: 5)

fabricio = User.create(first_name: 'Fabricio', last_name: 'Puerto', email: 'fabricio.puerto@outlook.com', password: 'fabri', password_confirmation: 'fabri', role: 'admin')
charly = User.create(first_name: 'Charly', last_name: 'Armijo', email: 'charlyarmijo22@gmail.com', password: 'charly', password_confirmation: 'charly', role: 'editor')
