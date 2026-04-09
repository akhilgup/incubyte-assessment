require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  def setup
    @employee = Employee.new(
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@example.com",
      job_title: "Software Engineer",
      department: "Engineering",
      country: "United States",
      salary: 85000.00,
      hire_date: Date.new(2024, 1, 15)
    )
  end

  test "valid employee is saved successfully" do
    assert @employee.valid?
  end

  test "requires first_name" do
    @employee.first_name = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:first_name], "can't be blank"
  end

  test "requires last_name" do
    @employee.last_name = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:last_name], "can't be blank"
  end

  test "requires email" do
    @employee.email = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:email], "can't be blank"
  end

  test "requires unique email" do
    @employee.save!
    duplicate = @employee.dup
    duplicate.email = @employee.email.upcase
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], "has already been taken"
  end

  test "rejects invalid email format" do
    ["plaintext", "@no-local.com", "spaces in@email.com"].each do |bad_email|
      @employee.email = bad_email
      assert_not @employee.valid?, "#{bad_email} should be invalid"
    end
  end

  test "requires job_title" do
    @employee.job_title = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:job_title], "can't be blank"
  end

  test "requires department" do
    @employee.department = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:department], "can't be blank"
  end

  test "requires country" do
    @employee.country = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:country], "can't be blank"
  end

  test "requires salary" do
    @employee.salary = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:salary], "can't be blank"
  end

  test "salary must be greater than zero" do
    @employee.salary = 0
    assert_not @employee.valid?
    assert_includes @employee.errors[:salary], "must be greater than 0"
  end

  test "salary must not exceed upper limit" do
    @employee.salary = 10_000_001
    assert_not @employee.valid?
    assert_includes @employee.errors[:salary], "must be less than or equal to 10000000"
  end

  test "rejects negative salary" do
    @employee.salary = -5000
    assert_not @employee.valid?
  end

  test "requires hire_date" do
    @employee.hire_date = nil
    assert_not @employee.valid?
    assert_includes @employee.errors[:hire_date], "can't be blank"
  end

  test "first_name respects maximum length" do
    @employee.first_name = "a" * 101
    assert_not @employee.valid?
  end

  test "last_name respects maximum length" do
    @employee.last_name = "a" * 101
    assert_not @employee.valid?
  end

  test "full_name returns first and last name combined" do
    assert_equal "John Smith", @employee.full_name
  end

  test "fixtures are valid" do
    assert employees(:one).valid?
    assert employees(:two).valid?
  end
end
