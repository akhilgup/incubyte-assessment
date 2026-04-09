module Api
  module V1
    class EmployeesController < BaseController
      before_action :set_employee, only: [ :show, :update, :destroy ]

      def index
        employees = Employee.all

        employees = employees.where(country: params[:country]) if params[:country].present?
        employees = employees.where(department: params[:department]) if params[:department].present?
        employees = employees.where(job_title: params[:job_title]) if params[:job_title].present?

        if params[:search].present?
          search_term = "%#{params[:search]}%"
          employees = employees.where(
            "first_name LIKE :q OR last_name LIKE :q OR email LIKE :q",
            q: search_term
          )
        end

        employees = employees.order(sort_column => sort_direction)

        page = (params[:page] || 1).to_i
        per_page = (params[:per_page] || 25).to_i.clamp(1, 100)
        total_count = employees.count
        employees = employees.offset((page - 1) * per_page).limit(per_page)

        render json: {
          employees: employees.map { |e| employee_json(e) },
          meta: {
            current_page: page,
            per_page: per_page,
            total_count: total_count,
            total_pages: (total_count.to_f / per_page).ceil
          }
        }
      end

      def show
        render json: { employee: employee_json(@employee) }
      end

      def create
        employee = Employee.new(employee_params)
        if employee.save
          render json: { employee: employee_json(employee) }, status: :created
        else
          render json: { errors: employee.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @employee.update(employee_params)
          render json: { employee: employee_json(@employee) }
        else
          render json: { errors: @employee.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @employee.destroy
        head :no_content
      end

      private

      def set_employee
        @employee = Employee.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Employee not found" }, status: :not_found
      end

      def employee_params
        params.require(:employee).permit(
          :first_name, :last_name, :email, :job_title,
          :department, :country, :salary, :hire_date
        )
      end

      def employee_json(employee)
        {
          id: employee.id,
          first_name: employee.first_name,
          last_name: employee.last_name,
          full_name: employee.full_name,
          email: employee.email,
          job_title: employee.job_title,
          department: employee.department,
          country: employee.country,
          salary: employee.salary.to_f,
          hire_date: employee.hire_date,
          created_at: employee.created_at,
          updated_at: employee.updated_at
        }
      end

      def sort_column
        %w[first_name last_name email salary hire_date country department job_title].include?(params[:sort]) ? params[:sort] : "first_name"
      end

      def sort_direction
        %w[asc desc].include?(params[:direction]) ? params[:direction] : "asc"
      end
    end
  end
end
