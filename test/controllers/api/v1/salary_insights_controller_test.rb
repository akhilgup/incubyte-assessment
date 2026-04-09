require "test_helper"

class Api::V1::SalaryInsightsControllerTest < ActionDispatch::IntegrationTest
  test "by_country returns stats grouped by country" do
    get by_country_api_v1_salary_insights_url
    assert_response :success

    json = JSON.parse(response.body)
    assert json.key?("data")
    assert json["data"].length > 0

    entry = json["data"].first
    assert entry.key?("country")
    assert entry.key?("min_salary")
    assert entry.key?("max_salary")
    assert entry.key?("avg_salary")
    assert entry.key?("employee_count")
  end

  test "by_country includes both fixture countries" do
    get by_country_api_v1_salary_insights_url
    json = JSON.parse(response.body)

    countries = json["data"].map { |d| d["country"] }
    assert_includes countries, "United States"
    assert_includes countries, "India"
  end

  test "by_country_and_title returns stats for given country" do
    get by_country_and_title_api_v1_salary_insights_url, params: { country: "United States" }
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal "United States", json["country"]
    assert json["data"].length > 0

    entry = json["data"].first
    assert entry.key?("job_title")
    assert entry.key?("avg_salary")
    assert entry.key?("employee_count")
  end

  test "by_country_and_title returns 400 without country param" do
    get by_country_and_title_api_v1_salary_insights_url
    assert_response :bad_request

    json = JSON.parse(response.body)
    assert_equal "country parameter is required", json["error"]
  end

  test "by_country_and_title returns empty for non-existent country" do
    get by_country_and_title_api_v1_salary_insights_url, params: { country: "Narnia" }
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal 0, json["data"].length
  end

  test "summary returns org-wide statistics" do
    get summary_api_v1_salary_insights_url
    assert_response :success

    json = JSON.parse(response.body)
    assert json["total_employees"] >= 2
    assert json["overall_avg_salary"] > 0
    assert json["overall_min_salary"] > 0
    assert json["overall_max_salary"] > 0
    assert json["median_salary"] > 0
    assert json.key?("by_department")
    assert json["by_department"].length > 0
  end

  test "summary avg is between min and max" do
    get summary_api_v1_salary_insights_url
    json = JSON.parse(response.body)

    assert json["overall_avg_salary"] >= json["overall_min_salary"]
    assert json["overall_avg_salary"] <= json["overall_max_salary"]
  end
end
