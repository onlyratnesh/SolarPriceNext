"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Paper, TableContainer, Table, TableBody, TableRow, TableCell, CircularProgress } from "@mui/material";

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/quotes')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setQuotes(data);
        else if (data?.quotes) setQuotes(data.quotes);
        else setQuotes([]);
      })
      .catch((e) => { if (mounted) setError(String(e)); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Admin — Saved Quotations</Typography>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && quotes && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              {quotes.map((q, idx) => (
                <TableRow key={q.id || idx}>
                  <TableCell>
                    <Typography fontWeight={700}>{q.customerInfo?.name || 'N/A'}</Typography>
                    <Typography variant="caption">Phone: {q.customerInfo?.phone || 'N/A'}</Typography>
                    <Typography variant="caption" display="block">Sales: {q.salespersonName || 'N/A'}</Typography>
                    <Typography variant="caption" display="block">Date: {q.created_at || q.createdAt || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography>Subtotal: {q.calculations?.subtotal ? q.calculations.subtotal : 'N/A'}</Typography>
                    <Typography>GST: {q.calculations?.gstAmount ?? 'N/A'}</Typography>
                    <Typography>Incentive: {q.calculations?.salespersonIncentiveAmount ?? 'N/A'}</Typography>
                    <Typography>Company Kept: {q.calculations?.companyRetainedMargin ?? 'N/A'}</Typography>
                    <Typography fontWeight={700}>Grand Total: {q.calculations?.grandTotal ?? 'N/A'}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
