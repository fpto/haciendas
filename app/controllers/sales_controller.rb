class SalesController < ApplicationController
  before_action :require_user, only: [:index, :show, :new,  :create, :edit, :destroy, :update]
  before_action :require_editor, only: [:index, :show,:new, :show, :create,  :update]
  before_action :require_admin, only: [:edit, :destroy]

  before_action :set_sale, only: [:show, :edit, :update, :destroy]

  helper_method :sort_column, :sort_direction
  # GET /sales
  # GET /sales.json
  def index
    @sales = Sale.sale_stats
  end

  # GET /sales/1
  # GET /sales/1.json
  def show
    @sale = Sale.find(params[:id])
    @latest_weights = Animal.first_last_weights
       .where(sale_id:  @sale.id)
       .order(sort_column + " " + sort_direction)

     @avg_gdp = Animal.avg_daily_gain_general.where(sale_id:  @sale.id)
     @sale_gdp = @sale_weight_sum = @sale_avg_weight= @sale_count = @sale_w_stddev= 0
     @avg_purchase_price = @initial_weight_sum =  @initial_weight_sum = @avg_days_in_ranch = 0
     @initial_weight_info = Animal.initial_weight_sum.where(sale_id:  @sale.id)
     @initial_weight_info.each{|sale|
       sale.weight_sum ||= 0
       @initial_weight_sum += sale.weight_sum
       }

     @avg_gdp.each{ |animal|
       animal.daily_gain ||= 0
       avg_days_in_ranch ||= 0
       @sale_gdp += animal.daily_gain
       @avg_days_in_ranch += animal.avg_days_in_ranch
     }

     @avg_weight = Animal.average_weight_general.where(sale_id:  @sale.id)
     @avg_weight.each{ |animal|
       animal.average_weight ||= 0
       animal.count ||= 0
       animal.stddev ||= 0
       animal.weight_sum ||= 0
       animal.purchase_price ||= 0
       animal.sale_price ||= 0
       @sale_avg_weight += animal.average_weight
       @sale_count += animal.count
       @sale_w_stddev += animal.stddev
       @sale_weight_sum += animal.weight_sum
     }
     @sale_total = @sale_cost = 0
  @latest_weights.each{|animal|
    animal.purchase_total ||= 0
    animal.sale_total ||= 0
    @sale_cost +=  animal.purchase_total
    @sale_total += animal.sale_total
  }

     @sale_w_cv = (@sale_w_stddev  / @sale_avg_weight ) * 100

  end

  # GET /sales/new
  def new
    @sale = Sale.new
  end

  # GET /sales/1/edit
  def edit
  end

  # POST /sales
  # POST /sales.json
  def create
    @sale = Sale.new(sale_params)

    respond_to do |format|
      if @sale.save
        format.html { redirect_to @sale, notice: 'Sale was successfully created.' }
        format.json { render :show, status: :created, location: @sale }
      else
        format.html { render :new }
        format.json { render json: @sale.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /sales/1
  # PATCH/PUT /sales/1.json
  def update
    respond_to do |format|
      if @sale.update(sale_params)
        format.html { redirect_to @sale, notice: 'Sale was successfully updated.' }
        format.json { render :show, status: :ok, location: @sale }
      else
        format.html { render :edit }
        format.json { render json: @sale.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /sales/1
  # DELETE /sales/1.json
  def destroy
    @sale.destroy
    respond_to do |format|
      format.html { redirect_to sales_url, notice: 'Sale was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_sale
      @sale = Sale.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def sale_params
      params.require(:sale).permit(:date, :buyer, :comment)
    end
    # Use to set default sorting
    def sort_column
      %w[animal_number  ranch species last_weight days_since_last_weight daily_gain].include?(params[:sort]) ? (params[:sort]) : "animal_number"
    end

    def sort_direction
      %w[asc desc].include?(params[:direction]) ? (params[:direction]) : "asc"
    end
end
