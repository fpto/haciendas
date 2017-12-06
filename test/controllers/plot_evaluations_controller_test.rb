require 'test_helper'

class PlotEvaluationsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @plot_evaluation = plot_evaluations(:one)
  end

  test "should get index" do
    get plot_evaluations_url
    assert_response :success
  end

  test "should get new" do
    get new_plot_evaluation_url
    assert_response :success
  end

  test "should create plot_evaluation" do
    assert_difference('PlotEvaluation.count') do
      post plot_evaluations_url, params: { plot_evaluation: { comment: @plot_evaluation.comment, date: @plot_evaluation.date, fences_score: @plot_evaluation.fences_score, pasture_score: @plot_evaluation.pasture_score, plot_id: @plot_evaluation.plot_id, weed_score: @plot_evaluation.weed_score } }
    end

    assert_redirected_to plot_evaluation_url(PlotEvaluation.last)
  end

  test "should show plot_evaluation" do
    get plot_evaluation_url(@plot_evaluation)
    assert_response :success
  end

  test "should get edit" do
    get edit_plot_evaluation_url(@plot_evaluation)
    assert_response :success
  end

  test "should update plot_evaluation" do
    patch plot_evaluation_url(@plot_evaluation), params: { plot_evaluation: { comment: @plot_evaluation.comment, date: @plot_evaluation.date, fences_score: @plot_evaluation.fences_score, pasture_score: @plot_evaluation.pasture_score, plot_id: @plot_evaluation.plot_id, weed_score: @plot_evaluation.weed_score } }
    assert_redirected_to plot_evaluation_url(@plot_evaluation)
  end

  test "should destroy plot_evaluation" do
    assert_difference('PlotEvaluation.count', -1) do
      delete plot_evaluation_url(@plot_evaluation)
    end

    assert_redirected_to plot_evaluations_url
  end
end
