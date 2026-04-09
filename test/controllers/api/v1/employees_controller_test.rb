require "test_helper"

class Api::V1::EmployeesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @employee = employees(:one)
  end

  test "index returns paginated employees" do
    get api_v1_employees_url
    assert_response :success

    json = JSON.parse(response.body)
    assert json.key?("employees")
    assert json.key?("meta")
    assert_equal 1, json["meta"]["current_page"]
    assert json["meta"]["total_count"] >= 2
  end

  test "index filters by country" do
    get api_v1_employees_url, params: { country: "United States" }
    assert_response :success

    json = JSON.parse(response.body)
    json["employees"].each do |emp|
      assert_equal "United States", emp["country"]
    end
  end

  test "index filters by department" do
    get api_v1_employees_url, params: { department: "Engineering" }
    assert_response :success

    json = JSON.parse(response.body)
    json["employees"].each do |emp|
      assert_equal "Engineering", emp["department"]
    end
  end

  test "index filters by job_title" do
    get api_v1_employees_url, params: { job_title: "Software Engineer" }
    assert_response :success

    json = JSON.parse(response.body)
    json["employees"].each do |emp|
      assert_equal "Software Engineer", emp["job_title"]
    end
  end

  test "index searches by name" do
    get api_v1_employees_url, params: { search: "Jane" }
    assert_response :success

    json = JSON.parse(response.body)
    assert json["employees"].any? { |e| e["first_name"] == "Jane" }
  end

  test "index respects per_page param" do
    get api_v1_employees_url, params: { per_page: 1 }
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal 1, json["employees"].length
    assert_equal 1, json["meta"]["per_page"]
  end

  test "index supports sorting" do
    get api_v1_employees_url, params: { sort: "salary", direction: "desc" }
    assert_response :success

    json = JSON.parse(response.body)
    salaries = json["employees"].map { |e| e["salary"] }
    assert_equal salaries, salaries.sort.reverse
  end

  test "show returns an employee" do
    get api_v1_employee_url(@employee)
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal @employee.first_name, json["employee"]["first_name"]
    assert_equal @employee.full_name, json["employee"]["full_name"]
  end

  test "show returns 404 for missing employee" do
    get api_v1_employee_url(id: 999999)
    assert_response :not_found
  end

  test "create saves a valid employee" do
    assert_difference("Employee.count", 1) do
      post api_v1_employees_url, params: {
        employee: {
          first_name: "Alice",
          last_name: "Wonder",
          email: "alice.wonder@example.com",
          job_title: "Designer",
          department: "Design",
          country: "Canada",
          salary: 72000,
          hire_date: "2025-01-10"
        }
      }
    end

    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "Alice", json["employee"]["first_name"]
  end

  test "create returns errors for invalid data" do
    post api_v1_employees_url, params: {
      employee: { first_name: "", salary: -100 }
    }

    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].length > 0
  end

  test "update modifies an employee" do
    patch api_v1_employee_url(@employee), params: {
      employee: { salary: 110000 }
    }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 110000.0, json["employee"]["salary"]
  end

  test "update returns errors for invalid data" do
    patch api_v1_employee_url(@employee), params: {
      employee: { salary: -500 }
    }

    assert_response :unprocessable_entity
  end

  test "update returns 404 for missing employee" do
    patch api_v1_employee_url(id: 999999), params: {
      employee: { salary: 50000 }
    }

    assert_response :not_found
  end

  test "destroy removes an employee" do
    assert_difference("Employee.count", -1) do
      delete api_v1_employee_url(@employee)
    end

    assert_response :no_content
  end

  test "destroy returns 404 for missing employee" do
    delete api_v1_employee_url(id: 999999)
    assert_response :not_found
  end
end
