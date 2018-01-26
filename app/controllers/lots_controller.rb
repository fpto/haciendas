class LotsController < ApplicationController
  before_action :require_user, only: [:new, :create, :edit, :destroy, :update]
  before_action :require_editor, only: [:new, :create,  :update]
  before_action :require_admin, only: [:edit, :destroy]
  
  before_action :set_lot, only: [:show, :edit, :update, :destroy]

  helper_method :sort_column, :sort_direction
  # GET /lots
  # GET /lots.json
  def index
    #@lots = Lot.all
    @lots = Lot.lot_stats
  end

  # GET /lots/1
  # GET /lots/1.json
  def show
    @lot = Lot.find(params[:id])
    @animals = @lot.animals
    @latest_weights = Animal.latest_weights
       .where(lot_id:  @lot.id)
       .order(sort_column + " " + sort_direction)

    @avg_gdp = Animal.daily_gain_general.where(lot_id:  @lot.id)
    @lot_gdp = @lot_avg_weight= @lot_count = @lot_gdp_stddev = @lot_w_stddev= 0
    @avg_gdp.each{ |animal|
      animal.daily_gain ||= 0
      animal.stddev ||= 0
      @lot_gdp += animal.daily_gain
      @lot_gdp_stddev += animal.stddev
    }
    @avg_weight = Animal.average_weight_general.where(lot_id:  @lot.id)
    @avg_weight.each{ |animal|
      animal.average_weight ||= 0
      animal.count ||= 0
      animal.stddev ||= 0
      @lot_avg_weight += animal.average_weight
      @lot_count += animal.count
      @lot_w_stddev += animal.stddev
    }
    @lot_low_gdp_bar = @lot_gdp - @lot_gdp_stddev
    @lot_w_cv = (@lot_w_stddev  / @lot_avg_weight ) * 100
    @low_gdp = Animal.latest_weights
       .where(lot_id:  @lot.id )
       .where( 'COALESCE((weights.weight - w2.weight) /
       NULLIF((dates.latest_date - dates.before_date),0),0) <= ?', @lot_low_gdp_bar)
       .order(sort_column + " " + sort_direction)
  end

  # GET /lots/new
  def new
    @lot = Lot.new
  end

  # GET /lots/1/edit
  def edit
  end

  # POST /lots
  # POST /lots.json
  def create
    @lot = Lot.new(lot_params)

    respond_to do |format|
      if @lot.save
        format.html { redirect_to @lot, notice: 'Lot was successfully created.' }
        format.json { render :show, status: :created, location: @lot }
      else
        format.html { render :new }
        format.json { render json: @lot.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /lots/1
  # PATCH/PUT /lots/1.json
  def update
    respond_to do |format|
      if @lot.update(lot_params)
        format.html { redirect_to @lot, notice: 'Lot was successfully updated.' }
        format.json { render :show, status: :ok, location: @lot }
      else
        format.html { render :edit }
        format.json { render json: @lot.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /lots/1
  # DELETE /lots/1.json
  def destroy
    @lot.destroy
    respond_to do |format|
      format.html { redirect_to lots_url, notice: 'Lot was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_lot
      @lot = Lot.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def lot_params
      params.require(:lot).permit(:ranch, :species, :number, :name, :description)
    end

    # Use to set default sorting
    def sort_column
      %w[animal_number  ranch species last_weight days_since_last_weight daily_gain].include?(params[:sort]) ? (params[:sort]) : "animal_number"
    end

    def sort_direction
      %w[asc desc].include?(params[:direction]) ? (params[:direction]) : "asc"
    end
end
