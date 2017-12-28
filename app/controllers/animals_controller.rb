class AnimalsController < ApplicationController
  #Requires user
  before_action :require_user, only: [:new, :create, :edit, :destroy, :update]
  before_action :require_editor, only: [:new, :create, :edit, :update]
  before_action :require_admin, only: [:destroy]

  before_action :set_animal, only: [:show, :edit, :update, :destroy]

  # GET /animals
  # GET /animals.json
  def index
    # This query is used for the table and it uses first and initial weight
    @animals = Animal.select(
      "	animals.animal_number as animal_number,
    animals.id as id,
    animals.ranch as ranch,
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
    # This query is used to calculate GDP with latest weights
    @latest_weights = Weight.select(
      "weights.weight as id,
      dates.animal_id as animal_id,
      animals.animal_number as animal_number,
    animals.ranch as ranch,
    weights.weight as last_weight,
    dates.latest_date - dates.before_date as days_between_weights,
    date(NOW()) - dates.latest_date as days_since_last_weight,
    weights.weight - w2.weight as weight_change,
    (weights.weight - w2.weight) /  NULLIF((dates.latest_date - dates.before_date),0) as daily_gain")
    .joins("JOIN (
     SELECT
    	animal_id,
    	MAX(weights.date) as latest_date,
    	MIN(weights.DATE) as before_date
    	FROM   weights
    	WHERE
    		(
    			SELECT 	COUNT(*)
    			FROM 	weights  f
    			WHERE f.animal_id = weights.animal_id AND
    				  f.weight >= weights.weight
    		) <= 2
    	GROUP BY animal_id) as dates ON weights.animal_id = dates.animal_id AND weights.date = dates.latest_date
      JOIN weights w2 ON  w2.animal_id = dates.animal_id AND w2.date = dates.before_date
      JOIN animals ON animals.id = dates.animal_id").order("animal_id")
    @animals_sauces =  @sauces_last_weights =  @sauces_daily_gain = @sauces_with_gain = @sauces_average_weight =@sauces_avg_daily_gain = 0
    @animals_laureles = @laureles_last_weights = @laureles_daily_gain = @laureles_with_gain =@laureles_average_weight = @laureles_avg_daily_gain  =0
    @latest_weights.each{ |animal|
      animal.daily_gain ||= 0
      animal.days_between_weights ||= 0
      case animal.ranch
      when 'sauces'
        @animals_sauces += 1
        @sauces_last_weights += animal.last_weight
        @sauces_daily_gain += animal.daily_gain
        if animal.days_between_weights > 0 then
          @sauces_with_gain += 1
        end
      when 'laureles'
        @animals_laureles += 1
        @laureles_last_weights += animal.last_weight
        animal.daily_gain ||= 0
        @laureles_daily_gain += animal.daily_gain
        if animal.days_between_weights > 0 then
          @laureles_with_gain += 1
        end
      end
      }
    if @animals_sauces > 0 then
      @sauces_average_weight = @sauces_last_weights / @animals_sauces
    end
    if @animals_laureles > 0 then
      @laureles_average_weight = @laureles_last_weights / @animals_laureles
    end
    if @sauces_with_gain > 0 then
      @sauces_avg_daily_gain = @sauces_daily_gain / @sauces_with_gain
    end
    if @laureles_with_gain > 0 then
      @laureles_avg_daily_gain = @laureles_daily_gain / @laureles_with_gain
    end
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
      params.require(:animal).permit(:animal_number, :species, :birthday, :ranch)
    end
end
