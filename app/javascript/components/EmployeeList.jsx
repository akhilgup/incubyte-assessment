import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  TableSortLabel,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { fetchEmployees, deleteEmployee } from "../api/employees";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Germany", "France",
  "India", "Australia", "Japan", "Brazil", "Netherlands",
];

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Human Resources", "Finance", "Operations", "Legal", "Support",
];

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: 25, total_count: 0, total_pages: 0 });
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [sort, setSort] = useState("first_name");
  const [direction, setDirection] = useState("asc");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const loadEmployees = useCallback(async (page = 1) => {
    try {
      const params = { page, per_page: meta.per_page, sort, direction };
      if (search) params.search = search;
      if (country) params.country = country;
      if (department) params.department = department;
      const data = await fetchEmployees(params);
      setEmployees(data.employees);
      setMeta(data.meta);
    } catch {
      setSnackbar({ open: true, message: "Failed to load employees", severity: "error" });
    }
  }, [search, country, department, sort, direction, meta.per_page]);

  useEffect(() => {
    loadEmployees(1);
  }, [search, country, department, sort, direction]);

  const handlePageChange = (_event, newPage) => {
    loadEmployees(newPage + 1);
  };

  const handleRowsPerPageChange = (event) => {
    setMeta((prev) => ({ ...prev, per_page: parseInt(event.target.value, 10) }));
  };

  useEffect(() => {
    loadEmployees(1);
  }, [meta.per_page]);

  const handleSort = (column) => {
    if (sort === column) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSort(column);
      setDirection("asc");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmployee(deleteTarget.id);
      setSnackbar({ open: true, message: `${deleteTarget.full_name} deleted`, severity: "success" });
      setDeleteTarget(null);
      loadEmployees(meta.current_page);
    } catch {
      setSnackbar({ open: true, message: "Failed to delete employee", severity: "error" });
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCountry("");
    setDepartment("");
  };

  const hasFilters = search || country || department;

  const formatSalary = (val) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Employees</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/employees/new")}>
          Add Employee
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Country</InputLabel>
            <Select value={country} label="Country" onChange={(e) => setCountry(e.target.value)}>
              <MenuItem value="">All Countries</MenuItem>
              {COUNTRIES.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Department</InputLabel>
            <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
              <MenuItem value="">All Departments</MenuItem>
              {DEPARTMENTS.map((d) => (
                <MenuItem key={d} value={d}>{d}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {hasFilters && (
            <Chip label="Clear filters" onDelete={clearFilters} onClick={clearFilters} size="small" />
          )}
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {[
                { id: "first_name", label: "Name" },
                { id: "email", label: "Email" },
                { id: "job_title", label: "Job Title" },
                { id: "department", label: "Department" },
                { id: "country", label: "Country" },
                { id: "salary", label: "Salary" },
                { id: "hire_date", label: "Hire Date" },
              ].map((col) => (
                <TableCell key={col.id} sortDirection={sort === col.id ? direction : false}>
                  <TableSortLabel
                    active={sort === col.id}
                    direction={sort === col.id ? direction : "asc"}
                    onClick={() => handleSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No employees found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell>{emp.full_name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.job_title}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.country}</TableCell>
                  <TableCell>{formatSalary(emp.salary)}</TableCell>
                  <TableCell>{emp.hire_date}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => navigate(`/employees/${emp.id}/edit`)} title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeleteTarget(emp)} title="Delete" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={meta.total_count}
          page={meta.current_page - 1}
          onPageChange={handlePageChange}
          rowsPerPage={meta.per_page}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deleteTarget?.full_name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
