"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  InputAdornment,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import Image from "next/image";
import { SolarPower, PriceCheck, RestartAlt, PictureAsPdf, WhatsApp, Print } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useReactToPrint } from "react-to-print";
// Note: GST and incentive UI elements are internal and removed from the main UI.
import { products, productsBySupplier, companyDetails, EXTRA_HEIGHT_RATE } from "../data/priceList";
import { defaultComponents } from "../data/components";
import { formatCurrency } from "../lib/utils";
import { SupplierTabs } from "../components/ProductSelector";
import type { Product, QuoteComponent } from "../types/quote";

type DialogMode = "whatsapp" | "customerPrint";

export default function SolarPricingPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("tata");
  const [extraMargin, setExtraMargin] = useState<number>(0);
  const [salespersonIncentivePercent, setSalespersonIncentivePercent] = useState<number>(0);
  const [salespersonIncentiveMode, setSalespersonIncentiveMode] = useState<'percent' | 'fixed'>('percent');
  const [salespersonIncentiveFixed, setSalespersonIncentiveFixed] = useState<number>(0);
  const [extraWireChecked, setExtraWireChecked] = useState<boolean>(false);
  const [extraWireLength, setExtraWireLength] = useState<number>(0);
  const [extraHeightChecked, setExtraHeightChecked] = useState<boolean>(false);
  const [extraHeightValue, setExtraHeightValue] = useState<number>(0);
  const [outOfVnsFee, setOutOfVnsFee] = useState<number>(5000);
  const [discount, setDiscount] = useState<number>(0);
  const [location, setLocation] = useState<string>("Varanasi");
  const [salespersonName, setSalespersonName] = useState<string>("");
  const [nowString, setNowString] = useState("");
  const [todayString, setTodayString] = useState("");
  const [gstFiveShare, setGstFiveShare] = useState<number>(70);
  const [gstFiveRatePercent, setGstFiveRatePercent] = useState<number>(5);
  const [gstEighteenRatePercent, setGstEighteenRatePercent] = useState<number>(18);
  const [shareLock, setShareLock] = useState<'A' | 'B' | 'none'>('none');
  const components: QuoteComponent[] = (defaultComponents as unknown) as QuoteComponent[];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("whatsapp");
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [serverReady, setServerReady] = useState<boolean | null>(null);
  const [serverMissingEnv, setServerMissingEnv] = useState<string[]>([]);

  const salesPrintRef = useRef<HTMLDivElement>(null);
  const customerPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNowString(new Date().toLocaleString());
    setTodayString(new Date().toLocaleDateString());
  }, []);

  // Persist GST settings to localStorage so preferences survive reloads
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('gstConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.share === 'number') setGstFiveShare(parsed.share);
        if (typeof parsed.rateA === 'number') setGstFiveRatePercent(parsed.rateA);
        if (typeof parsed.rateB === 'number') setGstEighteenRatePercent(parsed.rateB);
        if (parsed.lock === 'A' || parsed.lock === 'B' || parsed.lock === 'none') setShareLock(parsed.lock);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('gstConfig', JSON.stringify({ share: gstFiveShare, rateA: gstFiveRatePercent, rateB: gstEighteenRatePercent, lock: shareLock }));
    } catch {}
  }, [gstFiveShare, gstFiveRatePercent, gstEighteenRatePercent, shareLock]);

  // Persist Sales Incentive percent so preference survives reloads
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('salesIncentivePercent');
      if (saved !== null) {
        const v = parseFloat(saved);
        if (!isNaN(v)) setSalespersonIncentivePercent(v);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('salesIncentivePercent', String(salespersonIncentivePercent));
    } catch {}
  }, [salespersonIncentivePercent]);

  // Persist incentive mode and fixed amount
  useEffect(() => {
    try {
      const m = window.localStorage.getItem('salesIncentiveMode');
      if (m === 'percent' || m === 'fixed') setSalespersonIncentiveMode(m);
      const fixed = window.localStorage.getItem('salesIncentiveFixed');
      if (fixed !== null) {
        const v = parseFloat(fixed);
        if (!isNaN(v)) setSalespersonIncentiveFixed(v);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('salesIncentiveMode', salespersonIncentiveMode);
      window.localStorage.setItem('salesIncentiveFixed', String(salespersonIncentiveFixed));
    } catch {}
  }, [salespersonIncentiveMode, salespersonIncentiveFixed]);

  // Check server-side readiness (required envs for PDF upload / WhatsApp)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/quote');
        const data = await res.json();
        if (!mounted) return;
        if (data?.ok) {
          setServerReady(true);
          setServerMissingEnv([]);
        } else {
          setServerReady(false);
          setServerMissingEnv(data?.missingEnv || []);
        }
      } catch {
        if (!mounted) return;
        setServerReady(false);
        setServerMissingEnv([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const {
    basePrice,
    marginPrice,
    wirePrice,
    heightPrice,
    outOfVnsPrice,
    subtotal,
    gst5Amount,
    gst18Amount,
    gstAmount,
    salespersonIncentiveAmount,
    companyRetainedMargin,
    total,
  } = useMemo(() => {
    if (!selectedProduct)
      return { basePrice: 0, marginPrice: extraMargin, wirePrice: 0, heightPrice: 0, outOfVnsPrice: 0, subtotal: 0, gst5Amount: 0, gst18Amount: 0, gstAmount: 0, total: 0, salespersonIncentiveAmount: 0, companyRetainedMargin: 0 };
    const basePriceVal = selectedProduct.price;
    const marginPriceVal = extraMargin;
    const wirePriceVal = extraWireChecked ? extraWireLength * selectedProduct.wire : 0;
    // Extra Height Cost = (Extra Height) × (Rate per ft/m) × (System kW)
    const heightPriceVal = extraHeightChecked ? extraHeightValue * EXTRA_HEIGHT_RATE * selectedProduct.kWp : 0;
    // For locations outside Varanasi, use editable out-of-Varanasi fee (default 5000).
    const outOfVnsPriceVal = location !== "Varanasi"
      ? (typeof outOfVnsFee === 'number' && outOfVnsFee > 0 ? outOfVnsFee : (selectedProduct.outOfVns || 5000))
      : 0;

    const subtotalVal = basePriceVal + marginPriceVal + wirePriceVal + heightPriceVal + outOfVnsPriceVal;
    // GST split (configurable): use gstFiveShare and configured rates
    const share5Local = Math.max(0, Math.min(100, gstFiveShare)) / 100;
    const share18Local = 1 - share5Local;
    const gst5Val = +(subtotalVal * share5Local * (gstFiveRatePercent / 100)).toFixed(2);
    const gst18Val = +(subtotalVal * share18Local * (gstEighteenRatePercent / 100)).toFixed(2);
    const gstAmountVal = +(gst5Val + gst18Val).toFixed(2);
    const totalVal = +(subtotalVal + gstAmountVal).toFixed(2);
    // Sales incentive is taken from the margin (company profit). Compute incentive amount and company retained margin.
    let salespersonIncentiveAmountVal = 0;
    if (salespersonIncentiveMode === 'percent') {
      const incentiveShare = Math.max(0, Math.min(100, salespersonIncentivePercent)) / 100;
      salespersonIncentiveAmountVal = +(marginPriceVal * incentiveShare).toFixed(2);
    } else {
      // fixed amount — cannot exceed the margin
      salespersonIncentiveAmountVal = Math.max(0, Math.min(marginPriceVal, +(salespersonIncentiveFixed || 0)));
      salespersonIncentiveAmountVal = +salespersonIncentiveAmountVal.toFixed(2);
    }
    const companyRetainedMarginVal = +(marginPriceVal - salespersonIncentiveAmountVal).toFixed(2);
    return { basePrice: basePriceVal, marginPrice: marginPriceVal, wirePrice: wirePriceVal, heightPrice: heightPriceVal, outOfVnsPrice: outOfVnsPriceVal, subtotal: subtotalVal, gst5Amount: gst5Val, gst18Amount: gst18Val, gstAmount: gstAmountVal, total: totalVal, salespersonIncentiveAmount: salespersonIncentiveAmountVal, companyRetainedMargin: companyRetainedMarginVal };
  }, [selectedProduct, extraMargin, extraWireChecked, extraWireLength, extraHeightChecked, extraHeightValue, location, salespersonIncentivePercent, salespersonIncentiveMode, salespersonIncentiveFixed]);

  const safeDiscount = Math.max(0, discount || 0);
  const grandTotal = Math.max(0, +(total - safeDiscount).toFixed(2));

  const handleReset = () => {
    setSelectedProduct(null);
    setExtraMargin(0);
    setExtraWireChecked(false);
    setExtraWireLength(0);
    setExtraHeightChecked(false);
    setExtraHeightValue(0);
    setDiscount(0);
    setLocation("Varanasi");
    setSalespersonName("");
  };

  // react-to-print v3 API: use contentRef
  const handlePrintSales = useReactToPrint({ contentRef: salesPrintRef, documentTitle: `SalesCopy_ArpitSolar_${new Date().toISOString().slice(0, 10)}` });
  const handlePrintCustomer = useReactToPrint({ contentRef: customerPrintRef, documentTitle: `CustomerCopy_ArpitSolar_${new Date().toISOString().slice(0, 10)}` });

  const handleOpenDialog = (mode: DialogMode) => { setDialogMode(mode); setDialogOpen(true); };
  const handleCloseDialog = () => setDialogOpen(false);

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({ ...customerInfo, [e.target.name]: e.target.value });
  };

  const buildQuotePayload = () => {
    if (!selectedProduct) return null;
    const customerSubtotal = basePrice + marginPrice + wirePrice + heightPrice + outOfVnsPrice;
    const share5 = Math.max(0, Math.min(100, gstFiveShare)) / 100;
    const share18 = 1 - share5;
    const customerGst5 = +(customerSubtotal * share5 * (gstFiveRatePercent / 100)).toFixed(2);
    const customerGst18 = +(customerSubtotal * share18 * (gstEighteenRatePercent / 100)).toFixed(2);
    const customerGst = +(customerGst5 + customerGst18).toFixed(2);
    const customerTotal = +(customerSubtotal + customerGst).toFixed(2);
    return {
      customerInfo,
      selectedProduct,
      salespersonName,
      location,
      extraMargin,
      calculations: {
        basePrice,
        marginPrice,
        wirePrice,
        heightPrice,
        outOfVnsPrice,
        subtotal: customerSubtotal,
        gstAmount: customerGst,
        gst5Amount: customerGst5,
        gst18Amount: customerGst18,
        gstConfig: { share5Percent: gstFiveShare, gst5RatePercent: gstFiveRatePercent, gst18RatePercent: gstEighteenRatePercent },
          total: customerTotal,
          discount: safeDiscount,
          grandTotal: Math.max(0, +(customerTotal - safeDiscount).toFixed(2)),
          salespersonIncentiveMode: salespersonIncentiveMode,
          salespersonIncentivePercent: salespersonIncentivePercent,
          salespersonIncentiveFixed: salespersonIncentiveFixed,
          salespersonIncentiveAmount: salespersonIncentiveAmount,
          companyRetainedMargin: companyRetainedMargin,
      },
      components,
      inverterCapacityKw: selectedProduct.kWp,
    };
  };

  const saveQuoteRecord = async (payload: any) => {
    try {
      await fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } catch {
      console.error("Failed to save quote record");
    }
  };

  const sendWhatsApp = async () => {
    if (serverReady === false) {
      setNotification({ open: true, message: `Server not configured for WhatsApp/pdf upload. Missing: ${serverMissingEnv.join(', ') || 'envs'}`, severity: 'error' });
      return;
    }
    if (!customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
      setNotification({ open: true, message: "Please enter a valid 10-digit phone number.", severity: "error" });
      return;
    }
    setLoading(true);
    handleCloseDialog();

    const payload = { ...buildQuotePayload(), channel: 'whatsapp', taxRate: 0.089, currency: 'INR' };

    try {
      if (!payload) throw new Error("Please select a product before sending.");
      const response = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to send quote");
      // Save record to Supabase via our capture route
      await saveQuoteRecord(payload);
      setNotification({ open: true, message: "Quotation sent successfully!", severity: "success" });
    } catch (error: any) {
      setNotification({ open: true, message: error.message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const printCustomerCopy = async () => {
    // Validation optional for print; keep consistent with WhatsApp
    if (!selectedProduct) {
      setNotification({ open: true, message: "Please select a product before printing.", severity: "error" });
      return;
    }
    if (!customerInfo.name || !customerInfo.phone || !/^\d{10}$/.test(customerInfo.phone)) {
      setNotification({ open: true, message: "Please fill customer name and a valid 10-digit phone number.", severity: "error" });
      return;
    }
    setLoading(true);
    handleCloseDialog();
    const payload = { ...buildQuotePayload(), channel: 'customer_print', taxRate: 0.089, currency: 'INR' };
    try {
      // Save the record first (for tracking)
      await saveQuoteRecord(payload);
      // Then trigger the print
      await handlePrintCustomer?.();
      setNotification({ open: true, message: "Customer copy ready to print.", severity: "success" });
    } catch (e: any) {
      setNotification({ open: true, message: e.message || "Failed to print customer copy.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogPrimary = async () => {
    if (dialogMode === "whatsapp") return sendWhatsApp();
    return printCustomerCopy();
  };

  // Allow page to render without a selected product; guard dependent UI below

  const animationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  } as const;

  // Return the exact product arrays for the selected supplier (no programmatic filtering)
  const getSupplierProducts = () => {
    const supplierMap: { [key: string]: Product[] } = {
      'tata': productsBySupplier.tata,
      'waaree-topcon': productsBySupplier.waareeTopcon,
      'adani-topcon': productsBySupplier.adaniTopcon,
      'premier-topcon': productsBySupplier.premierTopcon,
      'waaree-dcr': productsBySupplier.waareeHybridDcrBattery,
      'waaree-dcr-nobattery': productsBySupplier.waareeHybridDcrNoBattery,
      'waaree-ndcr': productsBySupplier.waareeHybridNDcrBattery,
      'waaree-ndcr-nobattery': productsBySupplier.waareeHybridNDcrNoBattery,
    };
    return supplierMap[selectedSupplier] || products;
  };

  const supplierProducts = getSupplierProducts();

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "grey.50", minHeight: "100vh" }}>
        <Box sx={{ maxWidth: "xl", mx: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Image src={companyDetails.logo} alt="Arpit Solar Logo" width={180} height={60} priority />
          </Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1, textAlign: "center", fontWeight: "bold" }}>
            <SolarPower sx={{ verticalAlign: "middle" }} /> Solar Pricing Calculator
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", mb: 3 }}>
            Select your product type and configure your quote
          </Typography>

          {/* Product Type Selector */}
          <Box sx={{ mb: 4 }}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  🔧 Select Product Type
                </Typography>
                <Grid container spacing={2}>
                  {SupplierTabs.map((supplier) => (
                    <Grid item xs={12} sm={6} md={3} key={supplier.id}>
                      <Paper
                        onClick={() => {
                          setSelectedSupplier(supplier.id);
                          setSelectedProduct(null); // Reset selected product
                        }}
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          border: selectedSupplier === supplier.id ? `3px solid ${supplier.color}` : "2px solid #e0e0e0",
                          backgroundColor: selectedSupplier === supplier.id ? `${supplier.color}15` : "#fff",
                          borderRadius: 2,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: 3,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: "bold",
                            color: supplier.color,
                            mb: 0.5,
                          }}
                        >
                          {supplier.label}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {supplier.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                  <Button
                    href="/catalog"
                    variant="outlined"
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontWeight: "bold",
                      textTransform: "none",
                      fontSize: "1rem",
                    }}
                  >
                    📋 View Complete Product Catalog
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          <Grid container spacing={4}>
            {/* Price Breakdown - moved above all */}
            <Grid item xs={12} sm={12} md={6}>
              <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5 }}>
                <Paper elevation={4} sx={{ borderRadius: 3, p: 3, background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)' }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PriceCheck /> Price Breakdown
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {[
                      { label: "Base Price", value: basePrice },
                      { label: "Extra Margin", value: marginPrice, bold: true },
                      { label: "Sales Incentive (from Margin)", value: salespersonIncentiveAmount, indent: true },
                      { label: "Company Retained Margin (after incentive)", value: companyRetainedMargin, indent: true },
                      { label: "Extra Wire Cost", value: wirePrice },
                      { label: "Extra Height Cost", value: heightPrice },
                      { label: "Logistics & Delivery Fee", value: outOfVnsPrice },
                    ]
                      .filter((item) => item.value > 0 || item.label === "Base Price")
                      .map((item) => (
                        <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", pl: item.indent ? 2 : 0, color: item.indent ? "text.secondary" : "text.primary", fontSize: item.indent ? "0.9rem" : "1rem" }}>
                          <Typography variant="body1">{item.label}:</Typography>
                          <Typography variant="body1" fontWeight={item.bold ? 600 : 400}>{formatCurrency(item.value)}</Typography>
                        </Box>
                      ))}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography>Subtotal (Before GST):</Typography><Typography>{formatCurrency(subtotal)}</Typography></Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography>{`Portion taxed @ ${gstFiveRatePercent}% (${gstFiveShare}% of subtotal):`}</Typography>
                          <Typography>{formatCurrency(gst5Amount)}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography>{`Portion taxed @ ${gstEighteenRatePercent}% (${100 - gstFiveShare}% of subtotal):`}</Typography>
                          <Typography>{formatCurrency(gst18Amount)}</Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                          <Typography>Total GST (combined):</Typography>
                          <Typography>{formatCurrency(gstAmount)}</Typography>
                        </Box>
                      </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">GST calculation: {gstFiveShare}% of subtotal taxed at {gstFiveRatePercent}%, remainder taxed at {gstEighteenRatePercent}%. Effective GST = {subtotal > 0 ? ((gstAmount / subtotal) * 100).toFixed(2) : '0.00'}% of subtotal.</Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="h6" fontWeight="bold">Total (After GST):</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(total)}</Typography></Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                      <Typography>Suggested Inverter Capacity:</Typography>
                      <Typography>{selectedProduct ? `${selectedProduct.kWp} kWp` : '-'}</Typography>
                    </Box>
                    {safeDiscount > 0 && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", color: "success.main" }}>
                        <Typography variant="h6" fontWeight="bold">Discount:</Typography>
                        <Typography variant="h6" fontWeight="bold">-{formatCurrency(safeDiscount)}</Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography variant="h6" fontWeight="bold">Grand Total:</Typography><Typography variant="h6" fontWeight="bold">{formatCurrency(grandTotal)}</Typography></Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
            {/* Left column - Configuration */}
            <Grid item xs={12} sm={12} md={6}>
              <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Configuration
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <FormControl fullWidth sx={{ minWidth: 320 }}>
                        <InputLabel id="product-select-label">Select Product</InputLabel>
                        <Select
                          labelId="product-select-label"
                          label="Select Product"
                          size="medium"
                          sx={{ height: 56 }}
                          value={(() => {
                            if (!selectedProduct) return "";
                            const idx = supplierProducts.findIndex(
                              (p) => p.kWp === selectedProduct.kWp && p.phase === selectedProduct.phase && p.price === selectedProduct.price && p.qty === selectedProduct.qty && p.supplier === selectedProduct.supplier
                            );
                            return idx === -1 ? "" : String(idx);
                          })()}
                          onChange={(e: SelectChangeEvent) => {
                            const idx = parseInt(e.target.value as string, 10);
                            if (!isNaN(idx) && supplierProducts[idx]) setSelectedProduct(supplierProducts[idx]);
                            else setSelectedProduct(null);
                          }}
                        >
                          <MenuItem value=""><em>Select Product</em></MenuItem>
                          {supplierProducts.map((p, idx) => (
                            <MenuItem key={`${p.kWp}-${p.phase}-${idx}`} value={String(idx)}>{
                              `${p.kWp} kWp • Phase ${p.phase} • ${formatCurrency(p.price)}`
                            }</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Salesperson Name"
                        fullWidth
                        value={salespersonName}
                        onChange={(e) => setSalespersonName(e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Extra Margin"
                        type="number"
                        fullWidth
                        value={extraMargin === 0 ? "" : extraMargin}
                        onChange={(e) => setExtraMargin(Math.max(0, parseFloat(e.target.value) || 0))}
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                      />
                    </Grid>
                    {/* Incentive mode is internal — managed in admin portal */}
                    <Grid item xs={12}>
                      <TextField
                        label="Discount"
                        type="number"
                        fullWidth
                        value={discount === 0 ? "" : discount}
                        onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                      />
                    </Grid>

                    {/* GST configuration is internal — moved to admin portal */}

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="location-select-label">Location</InputLabel>
                        <Select
                          labelId="location-select-label"
                          label="Location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        >
                          <MenuItem value="Varanasi">Varanasi</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {location === 'Other' && (
                      <Grid item xs={12}>
                        <TextField
                          label="Out-of-Varanasi Fee"
                          type="number"
                          fullWidth
                          value={outOfVnsFee === 0 ? "" : outOfVnsFee}
                          onChange={(e) => setOutOfVnsFee(Math.max(0, parseFloat(e.target.value) || 0))}
                          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                          helperText="Default ₹5000; editable for other locations"
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Checkbox checked={extraWireChecked} onChange={() => setExtraWireChecked(!extraWireChecked)} />}
                        label={`Add Extra Wire (@ ${formatCurrency(selectedProduct ? selectedProduct.wire : 0)}/m)`}
                      />
                      <AnimatePresence>
                        {extraWireChecked && (
                          <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
                            <TextField
                              label="Extra Wire Length (m)"
                              type="number"
                              size="small"
                              sx={{ mt: 1, width: { xs: "100%", sm: "50%" } }}
                              value={extraWireLength === 0 ? "" : extraWireLength}
                              onChange={(e) => setExtraWireLength(Math.max(0, parseFloat(e.target.value) || 0))}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Grid>

                    <Grid xs={12}>
                      <FormControlLabel
                        control={<Checkbox checked={extraHeightChecked} onChange={() => setExtraHeightChecked(!extraHeightChecked)} />}
                        label={`Include Extra Height (@ ${formatCurrency(EXTRA_HEIGHT_RATE)} per ft/m × kW)`}
                      />
                      <AnimatePresence>
                        {extraHeightChecked && (
                          <motion.div variants={animationVariants} initial="hidden" animate="visible" exit="exit">
                            <TextField
                              label="Extra Height (ft/m)"
                              type="number"
                              size="small"
                              sx={{ mt: 1, width: { xs: "100%", sm: "50%" } }}
                              value={extraHeightValue === 0 ? "" : extraHeightValue}
                              onChange={(e) => setExtraHeightValue(Math.max(0, parseFloat(e.target.value) || 0))}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Grid>

                    <Grid xs={12}>
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Button variant="outlined" color="error" onClick={handleReset} startIcon={<RestartAlt />}>Reset All</Button>
                        <Button variant="contained" onClick={async () => { await saveQuoteRecord({ ...buildQuotePayload(), channel: 'sales_print', taxRate: 0.089, currency: 'INR' }); handlePrintSales?.(); }} startIcon={<Print />}>Print Sales Copy</Button>
                        <Button variant="contained" onClick={() => handleOpenDialog("customerPrint")} startIcon={<PictureAsPdf />}>Print Customer Copy</Button>
                        <Button variant="contained" color="success" onClick={() => handleOpenDialog("whatsapp")} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <WhatsApp />} disabled={loading || serverReady === false}>{loading ? "Sending..." : "Send on WhatsApp"}</Button>
                      </Box>
                      {serverReady === false && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                          Server not configured for sending/saving quotes. Missing: {serverMissingEnv.join(', ') || 'required envs'}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* (moved) */}

            {/* Components Preview */}
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ borderRadius: 3, p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Included Components</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      {components.map((c, idx) => (
                        <TableRow key={`comp-main-${idx}-${c.name}`}>
                          <TableCell>{c.name}</TableCell>
                          <TableCell>{[c.brand, c.spec].filter(Boolean).join(' ')}</TableCell>
                          <TableCell align="right">{c.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{dialogMode === "whatsapp" ? "Send Quotation to Customer" : "Customer Copy Print"}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>{dialogMode === "whatsapp" ? "Enter customer details. The quote will be sent to WhatsApp." : "Enter customer details to print a customer-friendly copy."}</DialogContentText>
          <TextField autoFocus margin="dense" name="name" label="Customer Name" type="text" fullWidth variant="standard" value={customerInfo.name} onChange={handleCustomerInfoChange} />
          <TextField margin="dense" name="phone" label="Phone Number (10 digits)" type="tel" fullWidth variant="standard" value={customerInfo.phone} onChange={handleCustomerInfoChange} />
          <TextField margin="dense" name="address" label="Address" type="text" fullWidth variant="standard" value={customerInfo.address} onChange={handleCustomerInfoChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDialogPrimary} variant="contained" color={dialogMode === "whatsapp" ? "success" : "primary"}>{dialogMode === "whatsapp" ? (loading ? "Sending..." : "Send") : (loading ? "Printing..." : "Print")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: "100%" }}>{notification.message}</Alert>
      </Snackbar>

      {/* Hidden printable areas */}
      <div style={{ display: "none" }}>
        {/* Sales Copy (Internal) */}
        <div ref={salesPrintRef} style={{ padding: 24, color: "black", width: "800px" }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <Image src={companyDetails.logo} alt="Arpit Solar Logo" width={140} height={50} style={{ height: 'auto' }} />
          </Box>
          <Box sx={{ mb: 1 }}>
            <Typography variant="h6">Arpit Solar Shop - Sales Copy</Typography>
            <Typography variant="body2">{nowString}</Typography>
            <Typography variant="body2">Salesperson: {salespersonName || "N/A"}</Typography>
            <Typography variant="body2">Location: {location}</Typography>
            <Typography variant="body2">Suggested Inverter Capacity: {selectedProduct ? `${selectedProduct.kWp} kWp` : 'N/A'}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>Effective GST: {subtotal > 0 ? ((gstAmount / subtotal) * 100).toFixed(2) : '0.00'}%</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>Arpit Solar Shop</Typography>
              <Typography variant="body2">SH16/114-25-K-2, Sharvodayanagar,</Typography>
              <Typography variant="body2">Varanasi – 221003, Uttar Pradesh</Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="body2">GSTIN: 09APKPM6299L1ZW</Typography>
              <Typography variant="body2">Contact: 9044555572</Typography>
              <Typography variant="body2">Email: info@arpitsolar.com</Typography>
            </Box>
          </Box>
          <Typography variant="h6" gutterBottom>System Details</Typography>
          {selectedProduct ? (
            <>
              <Typography>System: {selectedProduct.kWp} kWp (Phase {selectedProduct.phase})</Typography>
              <Typography>Module: {selectedProduct.module}W × {selectedProduct.qty} Qty</Typography>
            </>
          ) : (
            <Typography color="text.secondary">Please select a product to show system details.</Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Included Components</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableBody>
                {components.map((c, idx) => (
                  <TableRow key={`comp-sales-${idx}-${c.name}`}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{[c.brand, c.spec].filter(Boolean).join(' ')}</TableCell>
                    <TableCell align="right">{c.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h6" gutterBottom>Price Breakdown</Typography>
          <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                <TableBody>
                <TableRow><TableCell>Base Price</TableCell><TableCell align="right">{formatCurrency(basePrice)}</TableCell></TableRow>
                <TableRow><TableCell>Extra Margin</TableCell><TableCell align="right">{formatCurrency(marginPrice)}</TableCell></TableRow>
                <TableRow><TableCell sx={{ pl: 4, color: "text.secondary" }}>Sales Incentive (from Margin)</TableCell><TableCell align="right" sx={{ color: "text.secondary" }}>{formatCurrency(salespersonIncentiveAmount)}</TableCell></TableRow>
                <TableRow><TableCell sx={{ pl: 4, color: "text.secondary" }}>Company Retained Margin</TableCell><TableCell align="right" sx={{ color: "text.secondary" }}>{formatCurrency(companyRetainedMargin)}</TableCell></TableRow>
                {wirePrice > 0 && (<TableRow><TableCell>Extra Wire Cost</TableCell><TableCell align="right">{formatCurrency(wirePrice)}</TableCell></TableRow>)}
                {heightPrice > 0 && (<TableRow><TableCell>Extra Height Cost (H × Rate × kW)</TableCell><TableCell align="right">{formatCurrency(heightPrice)}</TableCell></TableRow>)}
                {outOfVnsPrice > 0 && (<TableRow><TableCell>Logistics & Delivery Fee</TableCell><TableCell align="right">{formatCurrency(outOfVnsPrice)}</TableCell></TableRow>)}
                <TableRow><TableCell sx={{ fontWeight: 600 }}>Subtotal (Before GST)</TableCell><TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</TableCell></TableRow>
                <TableRow><TableCell>{`Portion taxed @ ${gstFiveRatePercent}% (${gstFiveShare}% of subtotal)`}</TableCell><TableCell align="right">{formatCurrency(gst5Amount)}</TableCell></TableRow>
                <TableRow><TableCell>{`Portion taxed @ ${gstEighteenRatePercent}% (${100 - gstFiveShare}% of subtotal)`}</TableCell><TableCell align="right">{formatCurrency(gst18Amount)}</TableCell></TableRow>
                <TableRow><TableCell>{`GST (combined) — Effective ${subtotal > 0 ? ((gstAmount / subtotal) * 100).toFixed(2) : '0.00'}%`}</TableCell><TableCell align="right">{formatCurrency(gstAmount)}</TableCell></TableRow>
                <TableRow><TableCell>Total (After GST)</TableCell><TableCell align="right">{formatCurrency(total)}</TableCell></TableRow>
                {safeDiscount > 0 && (<TableRow><TableCell sx={{ color: "success.main", fontWeight: 600 }}>Discount</TableCell><TableCell align="right" sx={{ color: "success.main", fontWeight: 600 }}>-{formatCurrency(safeDiscount)}</TableCell></TableRow>)}
                <TableRow sx={{ '& > *': { fontWeight: 700 } }}><TableCell>Grand Total</TableCell><TableCell align="right">{formatCurrency(grandTotal)}</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption">GST split: {gstFiveShare}% of subtotal @ {gstFiveRatePercent}% and {100 - gstFiveShare}% @ {gstEighteenRatePercent}% — effective {(subtotal > 0 ? ((gstAmount / subtotal) * 100).toFixed(2) : "0.00")}%</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption">Internal copy for sales records. Not intended for customer distribution.</Typography>
        </div>

        {/* Customer Copy */}
        <div ref={customerPrintRef} style={{ padding: 24, color: "black", width: "800px" }}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
            <Image src={companyDetails.logo} alt="Arpit Solar Logo" width={140} height={50} style={{ height: 'auto' }} />
          </Box>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6">Arpit Solar Shop - Quotation</Typography>
              <Typography variant="body2">Date: {todayString}</Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="subtitle2" fontWeight={700}>Arpit Solar Shop</Typography>
              <Typography variant="body2">SH16/114-25-K-2, Sharvodayanagar,</Typography>
              <Typography variant="body2">Varanasi – 221003, Uttar Pradesh</Typography>
              <Typography variant="body2">GSTIN: 09APKPM6299L1ZW</Typography>
              <Typography variant="body2">Contact: 9044555572</Typography>
              <Typography variant="body2">Email: info@arpitsolar.com</Typography>
            </Box>
              <Typography variant="body2">Suggested Inverter Capacity: {selectedProduct ? `${selectedProduct.kWp} kWp` : 'N/A'}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>Effective GST: {subtotal > 0 ? ((gstAmount / subtotal) * 100).toFixed(2) : '0.00'}%</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>Customer Details</Typography>
          <Typography><strong>Name:</strong> {customerInfo.name || "N/A"}</Typography>
          <Typography><strong>Phone:</strong> {customerInfo.phone || "N/A"}</Typography>
          <Typography><strong>Address:</strong> {customerInfo.address || "N/A"}</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>System Details</Typography>
          {selectedProduct ? (
            <>
              <Typography>System: {selectedProduct.kWp} kWp (Phase {selectedProduct.phase})</Typography>
              <Typography>Module: {selectedProduct.module}W × {selectedProduct.qty} Qty</Typography>
            </>
          ) : (
            <Typography color="text.secondary">Please select a product to show system details.</Typography>
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>Included Components</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableBody>
                {components.map((c, idx) => (
                  <TableRow key={`comp-cust-${idx}-${c.name}`}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{[c.brand, c.spec].filter(Boolean).join(' ')}</TableCell>
                    <TableCell align="right">{c.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="h6" gutterBottom>Price Summary</Typography>
          <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                <TableBody>
                <TableRow><TableCell>Base Price</TableCell><TableCell align="right">{formatCurrency(basePrice + marginPrice)}</TableCell></TableRow>
                <TableRow><TableCell>Sales Incentive (from Margin)</TableCell><TableCell align="right">{formatCurrency(salespersonIncentiveAmount)}</TableCell></TableRow>
                <TableRow><TableCell>Company Retained Margin</TableCell><TableCell align="right">{formatCurrency(companyRetainedMargin)}</TableCell></TableRow>
                {wirePrice > 0 && (<TableRow><TableCell>Extra Wire Cost</TableCell><TableCell align="right">{formatCurrency(wirePrice)}</TableCell></TableRow>)}
                {heightPrice > 0 && (<TableRow><TableCell>Extra Height Cost</TableCell><TableCell align="right">{formatCurrency(heightPrice)}</TableCell></TableRow>)}
                {outOfVnsPrice > 0 && (<TableRow><TableCell>Logistics & Delivery Fee</TableCell><TableCell align="right">{formatCurrency(outOfVnsPrice)}</TableCell></TableRow>)}
                <TableRow><TableCell sx={{ fontWeight: 600 }}>Subtotal (Before GST)</TableCell><TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</TableCell></TableRow>
                <TableRow><TableCell>{`Portion taxed @ ${gstFiveRatePercent}% (${gstFiveShare}% of subtotal)`}</TableCell><TableCell align="right">{formatCurrency(gst5Amount)}</TableCell></TableRow>
                <TableRow><TableCell>{`Portion taxed @ ${gstEighteenRatePercent}% (${100 - gstFiveShare}% of subtotal)`}</TableCell><TableCell align="right">{formatCurrency(gst18Amount)}</TableCell></TableRow>
                <TableRow><TableCell>{`GST (combined) — Effective ${subtotal > 0 ? ((gstAmount / subtotal) * 100).toFixed(2) : '0.00'}%`}</TableCell><TableCell align="right">{formatCurrency(gstAmount)}</TableCell></TableRow>
                <TableRow><TableCell>Total (After GST)</TableCell><TableCell align="right">{formatCurrency(total)}</TableCell></TableRow>
                {safeDiscount > 0 && (<TableRow><TableCell sx={{ color: "success.main", fontWeight: 600 }}>Discount</TableCell><TableCell align="right" sx={{ color: "success.main", fontWeight: 600 }}>-{formatCurrency(safeDiscount)}</TableCell></TableRow>)}
                <TableRow sx={{ '& > *': { fontWeight: 700 } }}><TableCell>Grand Total</TableCell><TableCell align="right">{formatCurrency(grandTotal)}</TableCell></TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption">GST split: {gstFiveShare}% of subtotal @ {gstFiveRatePercent}% and {100 - gstFiveShare}% @ {gstEighteenRatePercent}% — effective {(subtotal > 0 ? ((gstAmount / subtotal) * 100).toFixed(2) : "0.00")}%</Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption">Thank you for considering Arpit Solar.</Typography>
        </div>
      </div>
    </>
  );
}
