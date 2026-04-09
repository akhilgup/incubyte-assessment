import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import {
  fetchSalaryByCountry,
  fetchSalaryByCountryAndTitle,
  fetchSalarySummary,
} from "../api/employees";

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);

function StatCard({ title, value, icon, color }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: 2,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function SalaryInsights() {
  const [summary, setSummary] = useState(null);
  const [countryStats, setCountryStats] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [titleStats, setTitleStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchSalarySummary(), fetchSalaryByCountry()])
      .then(([summaryData, countryData]) => {
        setSummary(summaryData);
        setCountryStats(countryData.data);
      })
      .catch(() => setError("Failed to load salary insights"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setTitleStats([]);
      return;
    }
    fetchSalaryByCountryAndTitle(selectedCountry)
      .then((data) => setTitleStats(data.data))
      .catch(() => setError("Failed to load job title data"));
  }, [selectedCountry]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Salary Insights
      </Typography>

      {/* Org-wide summary cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Employees"
            value={summary.total_employees.toLocaleString()}
            icon={<PeopleIcon />}
            color="#1565c0"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average Salary"
            value={formatCurrency(summary.overall_avg_salary)}
            icon={<AttachMoneyIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Highest Salary"
            value={formatCurrency(summary.overall_max_salary)}
            icon={<TrendingUpIcon />}
            color="#f57c00"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Median Salary"
            value={formatCurrency(summary.median_salary)}
            icon={<AttachMoneyIcon />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      {/* Department breakdown */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Average Salary by Department
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Department</TableCell>
              <TableCell align="right">Employees</TableCell>
              <TableCell align="right">Avg Salary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summary.by_department.map((dept) => (
              <TableRow key={dept.department} hover>
                <TableCell>{dept.department}</TableCell>
                <TableCell align="right">{dept.employee_count}</TableCell>
                <TableCell align="right">{formatCurrency(dept.avg_salary)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ mb: 4 }} />

      {/* Country stats */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Salary Statistics by Country
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell align="right">Employees</TableCell>
              <TableCell align="right">Min Salary</TableCell>
              <TableCell align="right">Avg Salary</TableCell>
              <TableCell align="right">Max Salary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {countryStats.map((row) => (
              <TableRow
                key={row.country}
                hover
                onClick={() => setSelectedCountry(row.country)}
                sx={{ cursor: "pointer", backgroundColor: selectedCountry === row.country ? "action.selected" : "inherit" }}
              >
                <TableCell>{row.country}</TableCell>
                <TableCell align="right">{row.employee_count}</TableCell>
                <TableCell align="right">{formatCurrency(row.min_salary)}</TableCell>
                <TableCell align="right">{formatCurrency(row.avg_salary)}</TableCell>
                <TableCell align="right">{formatCurrency(row.max_salary)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ mb: 4 }} />

      {/* Country + Job Title drill-down */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Average Salary by Job Title in a Country
      </Typography>
      <TextField
        select
        label="Select Country"
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
        size="small"
        sx={{ minWidth: 250, mb: 2 }}
      >
        <MenuItem value="">-- Select --</MenuItem>
        {countryStats.map((c) => (
          <MenuItem key={c.country} value={c.country}>
            {c.country}
          </MenuItem>
        ))}
      </TextField>

      {selectedCountry && titleStats.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell align="right">Employees</TableCell>
                <TableCell align="right">Min Salary</TableCell>
                <TableCell align="right">Avg Salary</TableCell>
                <TableCell align="right">Max Salary</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {titleStats.map((row) => (
                <TableRow key={row.job_title} hover>
                  <TableCell>{row.job_title}</TableCell>
                  <TableCell align="right">{row.employee_count}</TableCell>
                  <TableCell align="right">{formatCurrency(row.min_salary)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.avg_salary)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.max_salary)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {selectedCountry && titleStats.length === 0 && (
        <Typography color="text.secondary">No data for {selectedCountry}</Typography>
      )}
    </Box>
  );
}
