class AnimalsController < ApplicationController
  #Requires user
  before_action :require_user, only: [:new, :create, :edit, :destroy, :update]
  before_action :require_editor, only: [:new, :create,  :update]
  before_action :require_admin, only: [:edit, :destroy]

  before_action :set_animal, only: [:show, :edit, :update, :destroy]

  helper_method :sort_column, :sort_direction
  # GET /animals
  # GET /animals.json
  def index
    # This query is used to calculate GDP with latest weights
    @latest_weights = Animal.latest_weights
       .search(params[:search])
       .order(sort_column + " " + sort_direction)
       .paginate(:page => params[:page], :per_page => 50)
       .growing
    @all_animals =  Animal.latest_weights
     respond_to do |format|
       format.html
       format.csv { send_data @all_animals.to_csv }
       format.xls # { send_data @products.to_csv(col_sep: "\t") }
     end
  end

  # GET /animals/1
  # GET /animals/1.json
  def show
    @animal = Animal.find(params[:id])
    @weights = @animal.weights
    @lot = @animal.lot
    # TODO this GDP formula is wrong
      @first_weight = @weights.minimum(:date)
      @last_weight = @weights.maximum(:date)
      # Dealing when no weights
      @first_weight ||= 0
      @last_weight ||= 0
      @date_dif = (@last_weight - @first_weight).to_i
      # Dealing when no weights
      if @date_dif != 0 then
        @since_weight = (Date.today - @last_weight).to_i
      else
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
        format.html { redirect_to @animal, notice: 'Animal fue creado satisfactoriamente.' }
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
        format.html { redirect_to @animal, notice: 'Animal fue actualizado satisfactoriamente.' }
        format.json { render :show, status: :ok, location: @animal }
      else
        format.html { render :edit }
        format.json { render json: @animal.errors, status: :unprocessable_entity }
      end
    end
  end
  def edit_multiple
    if params[:animal_ids].nil?
      redirect_to animals_url, notice: 'No ha seleccionado ningun animal!'
    else
      @animals = Animal.find(params[:animal_ids])
    end
  end
  def update_multiple
    @animals = Animal.find(params[:animal_ids])
    @animals.reject! do |animal|
      animal.update_attributes(params[:animal].permit(:id, :species, :ranch, :lot_id, :status, :sale_id, :provider, :sale_price, :purchase_price).reject {|k,v| v.blank? })
    end
    if @animals.empty?
      redirect_to animals_url
    else
      @animal = Animal.new(params[:animal])
      render "edit_multiple"
    end
  end
  def import
    Animal.import(params[:file])
    redirect_to root_url, notice: "Animales importados."
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
      params.require(:animal).permit(:id, :animal_number, :species, :birthday, :ranch, :lot_id, :status, :breed, :provider, :mark, :color, :purchase_price, :sale_id, :sale_price)
    end

    # Use to set default sorting
    def sort_column
      %w[animal_number ranch species last_weight days_since_last_weight daily_gain lot_number].include?(params[:sort]) ? (params[:sort]) : "lot_id, animal_number"
    end

    def sort_direction
      %w[asc desc].include?(params[:direction]) ? (params[:direction]) : "asc"
    end
end
