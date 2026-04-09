require "benchmark"

EMPLOYEE_COUNT = 10_000

COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Germany", "France",
  "India", "Australia", "Japan", "Brazil", "Netherlands"
].freeze

DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Human Resources", "Finance", "Operations", "Legal", "Support"
].freeze

JOB_TITLES = {
  "Engineering"     => [ "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Engineering Manager", "QA Engineer", "DevOps Engineer" ],
  "Product"         => [ "Product Manager", "Senior Product Manager", "Product Analyst" ],
  "Design"          => [ "UX Designer", "UI Designer", "Design Lead" ],
  "Marketing"       => [ "Marketing Manager", "Content Strategist", "SEO Specialist", "Growth Analyst" ],
  "Sales"           => [ "Account Executive", "Sales Manager", "Sales Representative", "Business Development Rep" ],
  "Human Resources" => [ "HR Manager", "HR Coordinator", "Recruiter", "Talent Acquisition Lead" ],
  "Finance"         => [ "Financial Analyst", "Accountant", "Finance Manager", "Controller" ],
  "Operations"      => [ "Operations Manager", "Operations Analyst", "Project Manager" ],
  "Legal"           => [ "Legal Counsel", "Compliance Officer", "Paralegal" ],
  "Support"         => [ "Support Engineer", "Support Manager", "Customer Success Manager" ]
}.freeze

SALARY_RANGES = {
  "United States"  => { min: 55_000, max: 180_000 },
  "United Kingdom" => { min: 35_000, max: 130_000 },
  "Canada"         => { min: 45_000, max: 150_000 },
  "Germany"        => { min: 40_000, max: 140_000 },
  "France"         => { min: 35_000, max: 120_000 },
  "India"          => { min: 8_000,  max: 60_000 },
  "Australia"      => { min: 50_000, max: 160_000 },
  "Japan"          => { min: 35_000, max: 120_000 },
  "Brazil"         => { min: 10_000, max: 70_000 },
  "Netherlands"    => { min: 38_000, max: 135_000 }
}.freeze

data_dir = Rails.root.join("db", "data")
first_names = File.readlines(data_dir.join("first_names.txt"), chomp: true).reject(&:blank?)
last_names  = File.readlines(data_dir.join("last_names.txt"), chomp: true).reject(&:blank?)

puts "Seeding #{EMPLOYEE_COUNT} employees..."

elapsed = Benchmark.realtime do
  now = Time.current
  hire_date_start = Date.new(2018, 1, 1)
  hire_date_range = (Date.today - hire_date_start).to_i

  records = Array.new(EMPLOYEE_COUNT) do |i|
    first = first_names.sample
    last  = last_names.sample
    email = "#{first.downcase}.#{last.downcase}.#{i}@example.com"

    department = DEPARTMENTS.sample
    job_title  = JOB_TITLES[department].sample
    country    = COUNTRIES.sample
    range      = SALARY_RANGES[country]
    salary     = rand(range[:min]..range[:max]).round(2)
    hire_date  = hire_date_start + rand(0..hire_date_range)

    {
      first_name: first,
      last_name:  last,
      email:      email,
      job_title:  job_title,
      department: department,
      country:    country,
      salary:     salary,
      hire_date:  hire_date,
      created_at: now,
      updated_at: now
    }
  end

  Employee.delete_all
  Employee.insert_all(records)
end

puts "Seeded #{Employee.count} employees in #{elapsed.round(2)} seconds"
