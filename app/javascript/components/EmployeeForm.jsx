import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { fetchEmployee, createEmployee, updateEmployee } from "../api/employees";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Germany", "France",
  "India", "Australia", "Japan", "Brazil", "Netherlands",
];

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Human Resources", "Finance", "Operations", "Legal", "Support",
];

const JOB_TITLES = {
  Engineering: ["Software Engineer", "Senior Software Engineer", "Staff Engineer", "Engineering Manager", "QA Engineer", "DevOps Engineer"],
  Product: ["Product Manager", "Senior Product Manager", "Product Analyst"],
  Design: ["UX Designer", "UI Designer", "Design Lead"],
  Marketing: ["Marketing Manager", "Content Strategist", "SEO Specialist", "Growth Analyst"],
  Sales: ["Account Executive", "Sales Manager", "Sales Representative", "Business Development Rep"],
  "Human Resources": ["HR Manager", "HR Coordinator", "Recruiter", "Talent Acquisition Lead"],
  Finance: ["Financial Analyst", "Accountant", "Finance Manager", "Controller"],
  Operations: ["Operations Manager", "Operations Analyst", "Project Manager"],
  Legal: ["Legal Counsel", "Compliance Officer", "Paralegal"],
  Support: ["Support Engineer", "Support Manager", "Customer Success Manager"],
};

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email: "",
  job_title: "",
  department: "",
  country: "",
  salary: "",
  hire_date: "",
};

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      fetchEmployee(id)
        .then((emp) => {
          setForm({
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            job_title: emp.job_title,
            department: emp.department,
            country: emp.country,
            salary: String(emp.salary),
            hire_date: emp.hire_date,
          });
        })
        .catch(() => setErrors(["Employee not found"]))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === "department") {
      setForm((prev) => ({ ...prev, department: e.target.value, job_title: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    const payload = { ...form, salary: parseFloat(form.salary) };

    try {
      if (isEdit) {
        await updateEmployee(id, payload);
      } else {
        await createEmployee(payload);
      }
      navigate("/employees");
    } catch (err) {
      const msgs = err.response?.data?.errors || ["Something went wrong"];
      setErrors(msgs);
    } finally {
      setLoading(false);
    }
  };

  const availableTitles = JOB_TITLES[form.department] || [];

  if (fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/employees")} sx={{ mb: 2 }}>
        Back to Employees
      </Button>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {isEdit ? "Edit Employee" : "Add Employee"}
      </Typography>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="First Name"
                value={form.first_name}
                onChange={handleChange("first_name")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                label="Last Name"
                value={form.last_name}
                onChange={handleChange("last_name")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                value={form.email}
                onChange={handleChange("email")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                select
                label="Country"
                value={form.country}
                onChange={handleChange("country")}
              >
                {COUNTRIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                select
                label="Department"
                value={form.department}
                onChange={handleChange("department")}
              >
                {DEPARTMENTS.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                select
                label="Job Title"
                value={form.job_title}
                onChange={handleChange("job_title")}
                disabled={!form.department}
                helperText={!form.department ? "Select a department first" : ""}
              >
                {availableTitles.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="number"
                label="Salary (USD)"
                value={form.salary}
                onChange={handleChange("salary")}
                inputProps={{ min: 1, step: "0.01" }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                required
                type="date"
                label="Hire Date"
                value={form.hire_date}
                onChange={handleChange("hire_date")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/employees")}>
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
