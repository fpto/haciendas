class PlotEvaluationsController < ApplicationController
  before_action :require_user, only: [:new, :create, :edit, :destroy]
  before_action :require_editor, only: [:new, :create, :edit]
  before_action :require_admin, only: [:new, :create, :edit, :destroy]
  
  before_action :set_plot_evaluation, only: [:show, :edit, :update, :destroy]

  # GET /plot_evaluations
  # GET /plot_evaluations.json
  def index
    @plot_evaluations = PlotEvaluation.all
  end

  # GET /plot_evaluations/1
  # GET /plot_evaluations/1.json
  def show
  end

  # GET /plot_evaluations/new
  def new
    @plot_evaluation = PlotEvaluation.new
  end

  # GET /plot_evaluations/1/edit
  def edit
  end

  # POST /plot_evaluations
  # POST /plot_evaluations.json
  def create
    @plot_evaluation = PlotEvaluation.new(plot_evaluation_params)

    respond_to do |format|
      if @plot_evaluation.save
        format.html { redirect_to @plot_evaluation, notice: 'Plot evaluation was successfully created.' }
        format.json { render :show, status: :created, location: @plot_evaluation }
      else
        format.html { render :new }
        format.json { render json: @plot_evaluation.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /plot_evaluations/1
  # PATCH/PUT /plot_evaluations/1.json
  def update
    respond_to do |format|
      if @plot_evaluation.update(plot_evaluation_params)
        format.html { redirect_to @plot_evaluation, notice: 'Plot evaluation was successfully updated.' }
        format.json { render :show, status: :ok, location: @plot_evaluation }
      else
        format.html { render :edit }
        format.json { render json: @plot_evaluation.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /plot_evaluations/1
  # DELETE /plot_evaluations/1.json
  def destroy
    @plot_evaluation.destroy
    respond_to do |format|
      format.html { redirect_to plot_evaluations_url, notice: 'Plot evaluation was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_plot_evaluation
      @plot_evaluation = PlotEvaluation.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def plot_evaluation_params
      params.require(:plot_evaluation).permit(:plot_id, :date, :weed_score, :pasture_score, :fences_score, :comment)
    end
end
