import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BarChartIcon from "@mui/icons-material/BarChart";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/employees")}
          >
            Salary Management
          </Typography>
          <Button
            color="inherit"
            startIcon={<PeopleIcon />}
            onClick={() => navigate("/employees")}
            sx={{
              borderBottom: isActive("/employees") ? "2px solid white" : "none",
            }}
          >
            Employees
          </Button>
          <Button
            color="inherit"
            startIcon={<BarChartIcon />}
            onClick={() => navigate("/insights")}
            sx={{
              borderBottom: isActive("/insights") ? "2px solid white" : "none",
            }}
          >
            Insights
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
}
