module Api
  module V1
    class SalaryInsightsController < BaseController
      def by_country
        stats = Employee
          .group(:country)
          .select(
            "country",
            "MIN(salary) AS min_salary",
            "MAX(salary) AS max_salary",
            "ROUND(AVG(salary), 2) AS avg_salary",
            "COUNT(*) AS employee_count"
          )
          .order(:country)

        render json: {
          data: stats.map { |s|
            {
              country: s.country,
              min_salary: s.min_salary.to_f,
              max_salary: s.max_salary.to_f,
              avg_salary: s.avg_salary.to_f,
              employee_count: s.employee_count
            }
          }
        }
      end

      def by_country_and_title
        unless params[:country].present?
          return render json: { error: "country parameter is required" }, status: :bad_request
        end

        stats = Employee
          .where(country: params[:country])
          .group(:job_title)
          .select(
            "job_title",
            "ROUND(AVG(salary), 2) AS avg_salary",
            "MIN(salary) AS min_salary",
            "MAX(salary) AS max_salary",
            "COUNT(*) AS employee_count"
          )
          .order("avg_salary DESC")

        render json: {
          country: params[:country],
          data: stats.map { |s|
            {
              job_title: s.job_title,
              avg_salary: s.avg_salary.to_f,
              min_salary: s.min_salary.to_f,
              max_salary: s.max_salary.to_f,
              employee_count: s.employee_count
            }
          }
        }
      end

      def summary
        total = Employee.count
        overall_avg = Employee.average(:salary).to_f.round(2)
        overall_min = Employee.minimum(:salary).to_f
        overall_max = Employee.maximum(:salary).to_f
        median = compute_median_salary

        by_department = Employee
          .group(:department)
          .select(
            "department",
            "ROUND(AVG(salary), 2) AS avg_salary",
            "COUNT(*) AS employee_count"
          )
          .order("avg_salary DESC")

        render json: {
          total_employees: total,
          overall_avg_salary: overall_avg,
          overall_min_salary: overall_min,
          overall_max_salary: overall_max,
          median_salary: median,
          by_department: by_department.map { |d|
            {
              department: d.department,
              avg_salary: d.avg_salary.to_f,
              employee_count: d.employee_count
            }
          }
        }
      end

      private

      def compute_median_salary
        count = Employee.count
        return 0 if count == 0

        mid = count / 2
        salaries = Employee.order(:salary).offset(mid - 1).limit(2).pluck(:salary)

        if count.even?
          ((salaries[0] + salaries[1]) / 2.0).round(2).to_f
        else
          salaries[1].to_f
        end
      end
    end
  end
end
