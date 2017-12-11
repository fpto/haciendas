class AnimalsController < ApplicationController
  before_action :set_animal, only: [:show, :edit, :update, :destroy]

  # GET /animals
  # GET /animals.json
  def index
    #@animals = Animal.all
    @animals = Animal.select(
      "	animals.animal_number as animal_number,
    animals.id as id,
    animals.species as species,
  COUNT(weights.weight) as weighted,
    MIN(weights.weight) as initial_weight,
    MAX(weights.weight) as last_weight,
    MAX(weights.weight) - MIN(weights.weight) AS weight_gain,
    MIN(weights.date) as first_weight,
    MAX(weights.date) as last_weighted,
    date(NOW()) - MIN(weights.date) as days_in_ranch,
    MAX(weights.date) - MIN(weights.date) as days_between_weights,
    date(NOW()) - MAX(weights.date) as days_since_last_weight,
    ROUND(CAST((MAX(weights.weight) - MIN(weights.weight))/ (NULLIF((MAX(weights.date) - MIN(weights.date)),0)) as decimal),2) AS daily_gained"
  ).joins("LEFT JOIN weights ON animals.id = weights.animal_id")
  .group("1,2")
  .order("1 ASC")
  end

  # GET /animals/1
  # GET /animals/1.json
  def show
    @animal = Animal.find(params[:id])
    @weights = @animal.weights
      @max_weight =  @weights.maximum(:weight)
      @min_weight =  @weights.minimum(:weight)
      # Dealing when no weights
      @max_weight ||= 0
      @min_weight ||= 0

      @weight_gain = @max_weight - @min_weight
      @first_weight = @weights.minimum(:date)
      @last_weight = @weights.maximum(:date)
      # Dealing when no weights
      @first_weight ||= 0
      @last_weight ||= 0
      @date_dif = (@last_weight - @first_weight).to_i
      # Dealing when no weights
      if @date_dif != 0 then
        @daily_weight_gain = (@weight_gain / @date_dif).round(2)
        @since_weight = (Date.today - @last_weight).to_i
      else
        @daily_weight_gain = "N/A"
        @since_weight = "N/A"
      end
  end

  # GET /animals/new
  def new
    @animal = Animal.new
  end

  # GET /animals/1/edit
  def edit
  end

  # POST /animals
  # POST /animals.json
  def create
    @animal = Animal.new(animal_params)

    respond_to do |format|
      if @animal.save
        format.html { redirect_to @animal, notice: 'Animal was successfully created.' }
        format.json { render :show, status: :created, location: @animal }
      else
        format.html { render :new }
        format.json { render json: @animal.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /animals/1
  # PATCH/PUT /animals/1.json
  def update
    respond_to do |format|
      if @animal.update(animal_params)
        format.html { redirect_to @animal, notice: 'Animal was successfully updated.' }
        format.json { render :show, status: :ok, location: @animal }
      else
        format.html { render :edit }
        format.json { render json: @animal.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /animals/1
  # DELETE /animals/1.json
  def destroy
    @animal.destroy
    respond_to do |format|
      format.html { redirect_to animals_url, notice: 'Animal was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_animal
      @animal = Animal.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def animal_params
      params.require(:animal).permit(:animal_number, :species, :birthday)
    end
end
