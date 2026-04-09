# Salary Management Tool

A minimal, end-to-end salary management application built for an HR Manager to manage 10,000 employees and gain salary insights across countries and job titles.

## Tech Stack

- **Backend:** Ruby on Rails 8 (API mode within a monolith)
- **Frontend:** React 19 + Material UI 9 (bundled via esbuild)
- **Database:** SQLite
- **Testing:** Minitest (41 tests)

## Prerequisites

- Ruby 3.3+
- Rails 8.x
- Node.js 18+
- npm or Yarn

## Setup

```bash
# Install Ruby dependencies
bundle install

# Install JavaScript dependencies
npm install

# Create and migrate the database
bin/rails db:prepare

# Seed 10,000 employees
bin/rails db:seed

# Build JavaScript assets
npm run build

# Start the development server
bin/dev
```

The app will be available at `http://localhost:3000`.

## Running Tests

```bash
bin/rails test
```

This runs all 41 tests (18 model + 23 controller) covering:

- Employee model validations and edge cases
- Full CRUD API operations with pagination, search, sorting, and filtering
- Salary insights endpoints (by country, by country + job title, org summary)

## Seed Script

The seed script generates 10,000 employees by combining names from `db/data/first_names.txt` and `db/data/last_names.txt`. It uses `insert_all` for bulk insertion, completing in ~1 second.

```bash
bin/rails db:seed
```

The script is idempotent — running it again clears existing data and re-seeds.

## Features

### Employee Management
- View all employees in a paginated, sortable table
- Search employees by name or email
- Filter by country or department
- Add new employees with validated form fields
- Edit existing employees
- Delete employees with confirmation dialog

### Salary Insights Dashboard
- Org-wide summary: total employees, average salary, highest salary, median salary
- Average salary breakdown by department
- Min/max/avg salary statistics by country
- Drill-down: average salary by job title within a selected country

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/employees` | List employees (paginated, filterable, sortable) |
| GET | `/api/v1/employees/:id` | Get a single employee |
| POST | `/api/v1/employees` | Create an employee |
| PATCH | `/api/v1/employees/:id` | Update an employee |
| DELETE | `/api/v1/employees/:id` | Delete an employee |
| GET | `/api/v1/salary_insights/by_country` | Min/max/avg salary by country |
| GET | `/api/v1/salary_insights/by_country_and_title?country=X` | Avg salary by job title in a country |
| GET | `/api/v1/salary_insights/summary` | Org-wide salary statistics |

## Project Structure

```
app/
  controllers/
    api/v1/
      base_controller.rb          # CSRF skip for API
      employees_controller.rb     # CRUD with pagination/search/sort/filter
      salary_insights_controller.rb  # Aggregation endpoints
    pages_controller.rb           # Serves React shell
  models/
    employee.rb                   # Validations + full_name helper
  javascript/
    api/employees.js              # Axios API client
    components/
      App.jsx                     # Router + MUI theme
      Layout.jsx                  # AppBar navigation
      EmployeeList.jsx            # Table with filters/search/pagination
      EmployeeForm.jsx            # Add/Edit form
      SalaryInsights.jsx          # Dashboard with cards + tables
db/
  data/
    first_names.txt               # 100 first names for seeding
    last_names.txt                # 100 last names for seeding
  seeds.rb                        # Bulk insert 10k employees
test/
  models/employee_test.rb         # 18 model tests
  controllers/api/v1/
    employees_controller_test.rb  # 15 controller tests
    salary_insights_controller_test.rb  # 8 controller tests
```
