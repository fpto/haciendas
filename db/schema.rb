# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180220233216) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "animals", force: :cascade do |t|
    t.integer "animal_number"
    t.string "species"
    t.date "birthday"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "ranch"
    t.bigint "lot_id"
    t.string "status"
    t.index ["lot_id"], name: "index_animals_on_lot_id"
  end

  create_table "lots", force: :cascade do |t|
    t.string "ranch"
    t.string "species"
    t.string "number"
    t.string "name"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "plot_evaluations", force: :cascade do |t|
    t.bigint "plot_id"
    t.date "date"
    t.integer "water_score"
    t.integer "pasture_score"
    t.integer "fences_score"
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["plot_id"], name: "index_plot_evaluations_on_plot_id"
  end

  create_table "plots", force: :cascade do |t|
    t.string "number"
    t.float "area"
    t.string "ranch"
    t.string "plot_type"
    t.text "comment"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "boundaries"
  end

  create_table "users", force: :cascade do |t|
    t.string "first_name"
    t.string "last_name"
    t.string "email"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role"
  end

  create_table "weights", force: :cascade do |t|
    t.bigint "animal_id"
    t.date "date"
    t.float "weight"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["animal_id"], name: "index_weights_on_animal_id"
  end

  add_foreign_key "animals", "lots"
  add_foreign_key "plot_evaluations", "plots"
end
