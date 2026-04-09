import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Layout from "./Layout";
import EmployeeList from "./EmployeeList";
import EmployeeForm from "./EmployeeForm";
import SalaryInsights from "./SalaryInsights";

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },
    secondary: { main: "#f57c00" },
    background: { default: "#f5f5f5" },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id/edit" element={<EmployeeForm />} />
            <Route path="/insights" element={<SalaryInsights />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
