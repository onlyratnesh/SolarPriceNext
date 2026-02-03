"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Inventory,
  SettingsInputComponent,
  Receipt,
  Home,
  Add,
} from "@mui/icons-material";
import Link from "next/link";
import { companyDetails } from "@/lib/companyDetails";

type DashboardStats = {
  totalQuotations: number;
  draftQuotations: number;
  sentQuotations: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotations: 0,
    draftQuotations: 0,
    sentQuotations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/quotations?limit=100");
        const data = await res.json();
        if (data.success) {
          const quotations = data.data || [];
          setStats({
            totalQuotations: quotations.length,
            draftQuotations: quotations.filter((q: any) => q.status === "draft").length,
            sentQuotations: quotations.filter((q: any) => q.status === "sent").length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    {
      title: "Create Quotation",
      description: "Create a new solar quotation",
      icon: <Add sx={{ fontSize: 40 }} />,
      color: "#4CAF50",
      href: "/",
    },
    {
      title: "Manage Products",
      description: "Add, edit, or delete solar products",
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: "#2196F3",
      href: "/admin/products",
    },
    {
      title: "Manage Components",
      description: "Customize bill of materials",
      icon: <SettingsInputComponent sx={{ fontSize: 40 }} />,
      color: "#FF9800",
      href: "/admin/components",
    },
    {
      title: "Quotations",
      description: "View all saved quotations",
      icon: <Receipt sx={{ fontSize: 40 }} />,
      color: "#9C27B0",
      href: "/admin/quotations",
    },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="#1a237e">
              {companyDetails.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Admin Dashboard
            </Typography>
          </Box>
          <Link href="/">
            <Button variant="outlined" startIcon={<Home />}>
              Back to Home
            </Button>
          </Link>
        </Box>

        {/* Stats Cards */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, borderLeft: "4px solid #4CAF50" }}>
                <CardContent>
                  <Typography variant="h3" fontWeight="bold" color="#4CAF50">
                    {stats.totalQuotations}
                  </Typography>
                  <Typography color="text.secondary">Total Quotations</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, borderLeft: "4px solid #FF9800" }}>
                <CardContent>
                  <Typography variant="h3" fontWeight="bold" color="#FF9800">
                    {stats.draftQuotations}
                  </Typography>
                  <Typography color="text.secondary">Draft Quotations</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 2, borderLeft: "4px solid #2196F3" }}>
                <CardContent>
                  <Typography variant="h3" fontWeight="bold" color="#2196F3">
                    {stats.sentQuotations}
                  </Typography>
                  <Typography color="text.secondary">Sent Quotations</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Menu Cards */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          {menuItems.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.title}>
              <Link href={item.href} style={{ textDecoration: "none" }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <Box sx={{ color: item.color, mb: 2 }}>{item.icon}</Box>
                    <Typography variant="h6" fontWeight="bold">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>

        {/* Company Info */}
        <Card sx={{ mt: 4, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
              Company Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  GSTIN: {companyDetails.gstin}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Head Office: {companyDetails.headOffice}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone: {companyDetails.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {companyDetails.email}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
