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
    @lots = Lot.lot_stats.growing
  end

  # GET /lots/1
  # GET /lots/1.json
  def show
    #TODO Replace the number of queries by using big queries
    @lot = Lot.find(params[:id])
    @animals = @lot.animals
    @latest_weights = Animal.latest_weights
       .where(lot_id:  @lot.id).growing
       .order(sort_column + " " + sort_direction)

    #Here we get the recent GDP then the all time GDP
    @avg_gdp = Animal.recent_daily_gain_general.where(lot_id:  @lot.id).growing
    @avg_gdp_alltime = Animal.avg_daily_gain_general.where(lot_id:  @lot.id).growing
    @lot_gdp = @lot_gdp_alltime = @lot_weight_sum = @lot_avg_weight= @lot_count = @lot_gdp_stddev = @lot_w_stddev= 0
    @avg_purchase_price = @initial_weight_sum = @lot_cost =   @initial_weight_sum = 0
    @initial_weight_info = Animal.initial_weight_sum.where(lot_id:  @lot.id).growing
    @initial_weight_info.each{|lot|
      lot.weight_sum ||= 0
      @initial_weight_sum += lot.weight_sum
      }

    @avg_gdp.each{ |animal|
      animal.daily_gain ||= 0
      animal.stddev ||= 0
      @lot_gdp += animal.daily_gain
      @lot_gdp_stddev += animal.stddev
    }
    @avg_gdp_alltime.each{ |animal|
      animal.daily_gain ||= 0
      @lot_gdp_alltime += animal.daily_gain
    }

    @avg_weight = Animal.average_weight_general.where(lot_id:  @lot.id).growing
    @avg_weight.each{ |animal|
      animal.average_weight ||= 0
      animal.count ||= 0
      animal.stddev ||= 0
      animal.weight_sum ||= 0
      animal.purchase_price ||= 0
      @lot_avg_weight += animal.average_weight
      @lot_count += animal.count
      @lot_w_stddev += animal.stddev
      @lot_weight_sum += animal.weight_sum
      @avg_purchase_price += animal.purchase_price
    }
    @lot_cost = @initial_weight_sum * @avg_purchase_price
    
    # This is to filter the low GDP animals
    @lot_low_gdp_bar = @lot_gdp - @lot_gdp_stddev
    @lot_w_cv = (@lot_w_stddev  / @lot_avg_weight ) * 100
    @low_gdp = Animal.latest_weights
       .where(lot_id:  @lot.id )
       .where( '(weights.weight - w2.weight) /
       NULLIF((dates.latest_date - dates.before_date),0) <= ?', @lot_low_gdp_bar)
       .growing
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
