class PlotsController < ApplicationController
  before_action :require_user, only: [:new, :create, :edit, :destroy, :update]
  before_action :require_editor, only: [:new, :create, :edit, :update]
  before_action :require_admin, only: [:destroy]

  before_action :set_plot, only: [:show, :edit, :update, :destroy]

  # GET /plots
  # GET /plots.json
  def index
    # @plots = Plot.all.order('CAST(number AS int)')
    @plots = Plot.select(
      "plot_evaluations.id as plot_evaluation,
      plot_evaluations.plot_id as plot_id,
      plots.number as number,
      plots.ranch,
      plots.area,
      plots.plot_type as plot_type,
      plot_evaluations.weed_score as weed_score,
      plot_evaluations.pasture_score as pasture_score,
      plot_evaluations.fences_score as fences_score,
      ROUND(CAST((plot_evaluations.weed_score + plot_evaluations.pasture_score + plot_evaluations.fences_score) AS decimal )/3,2) as average ")
      .joins("LEFT JOIN plot_evaluations ON plot_evaluations.plot_id = plots.id")
      .where("(plot_evaluations.plot_id, plot_evaluations.id) IN (SELECT plot_id as pi, max(id) as re FROM plot_evaluations GROUP by plot_id)")
      .order("plots.id")
      @animals = Animal.select(
        "	animals.animal_number as animal_number,
      animals.id as id,
      animals.species as species,
      animals.ranch as ranch,
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
  @sauces_load = 0
  @sauces_area = 0
  @laureles_area = 0
  @plots.each{ |plot| if plot.ranch == 'sauces' then @sauces_area += plot.area end }
  @plots.each{ |plot| if plot.ranch == 'laureles' then @laureles_area += plot.area end }
  end

  # GET /plots/1
  # GET /plots/1.json
  def show
    @plot = Plot.find(params[:id])
    @plot_evaluations = @plot.plot_evaluations
  end

  # GET /plots/new
  def new
    @plot = Plot.new
  end

  # GET /plots/1/edit
  def edit
  end

  # POST /plots
  # POST /plots.json
  def create
    @plot = Plot.new(plot_params)

    respond_to do |format|
      if @plot.save
        format.html { redirect_to @plot, notice: 'Plot was successfully created.' }
        format.json { render :show, status: :created, location: @plot }
      else
        format.html { render :new }
        format.json { render json: @plot.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /plots/1
  # PATCH/PUT /plots/1.json
  def update
    respond_to do |format|
      if @plot.update(plot_params)
        format.html { redirect_to @plot, notice: 'Plot was successfully updated.' }
        format.json { render :show, status: :ok, location: @plot }
      else
        format.html { render :edit }
        format.json { render json: @plot.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /plots/1
  # DELETE /plots/1.json
  def destroy
    @plot.destroy
    respond_to do |format|
      format.html { redirect_to plots_url, notice: 'Plot was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_plot
      @plot = Plot.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def plot_params
      params.require(:plot).permit(:number, :area, :ranch, :plot_type, :comment, :boundaries)
    end
end
