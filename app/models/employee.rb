class Employee < ApplicationRecord
  validates :first_name, presence: true, length: { maximum: 100 }
  validates :last_name, presence: true, length: { maximum: 100 }
  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :job_title, presence: true
  validates :department, presence: true
  validates :country, presence: true
  validates :salary, presence: true,
                     numericality: { greater_than: 0, less_than_or_equal_to: 10_000_000 }
  validates :hire_date, presence: true

  def full_name
    "#{first_name} #{last_name}"
  end
end
