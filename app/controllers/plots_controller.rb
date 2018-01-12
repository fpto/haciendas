class PlotsController < ApplicationController
  before_action :require_user, only: [:new, :create, :edit, :destroy, :update]
  before_action :require_editor, only: [:new, :create,  :update]
  before_action :require_admin, only: [:edit, :destroy]

  before_action :set_plot, only: [:show, :edit, :update, :destroy]

  helper_method :sort_column, :sort_direction
  # GET /plots
  # GET /plots.json
  def index
    # @plots = Plot.all.order('CAST(number AS int)')
    @plots = Plot.latest_plot_scores
                 .search(params[:search])
                 .order(sort_column + " " + sort_direction)
                 .paginate(:page => params[:page], :per_page => 25)
  end

  # GET /plots/1
  # GET /plots/1.json
  def show
    @plot = Plot.find(params[:id])
    @plot_evaluations = @plot.plot_evaluations
    if @plot.boundaries == "" then
      if  @plot.ranch == "sauces"
        @plot.boundaries = "{lat: 15.479136, lng: -86.411074}"
      else
        @plot.boundaries = "{lat: 15.404493, lng: -86.428419}"
       end
     end
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
        format.html { redirect_to @plot, notice: 'Potrero creado!' }
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
    # Use to set default sorting
    def sort_column
      %w[number water_score pasture_score fences_score average ranch plot_type].include?(params[:sort]) ? (params[:sort]) : "ranch desc, plot_type asc, number"
    end

    def sort_direction
      %w[asc desc].include?(params[:direction]) ? (params[:direction]) : "asc"
    end
end
