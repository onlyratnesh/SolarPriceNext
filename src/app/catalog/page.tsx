import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { productCatalog, productStats } from '../../data/productCatalog';
import { formatCurrency } from '../../lib/utils';

export default function ProductCatalogView() {
  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
            Complete Product Catalog
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            All Solar System Variants - {productStats.totalProducts} products across {productStats.categories} categories
          </Typography>
        </CardContent>
      </Card>

      {/* Back to Pricing Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          href="/"
          variant="contained"
          color="primary"
        >
          ← Back to Pricing Calculator
        </Button>
      </Box>

      {/* Summary Stats */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            📊 Quick Statistics
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Total Products
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                {productStats.totalProducts}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Price Range
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                {formatCurrency(productStats.priceRange.min)} - {formatCurrency(productStats.priceRange.max)}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Module Types:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="560wp Modules (8)" color="primary" variant="outlined" />
                <Chip label="580wp Modules (22)" color="primary" variant="outlined" />
                <Chip label="600wp Modules (5)" color="primary" variant="outlined" />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Product Categories */}
      {productCatalog.map((category, idx) => (
        <Accordion key={idx} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: '#667eea',
                  minWidth: '200px',
                }}
              >
                {category.category}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {category.supplier}
              </Typography>
              <Chip
                label={`${category.variants.reduce((sum, v) => sum + v.products.length, 0)} products`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 'auto' }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ width: '100%' }}>
              {category.variants.map((variant, variantIdx) => (
                <Box key={variantIdx} sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 'bold',
                      mb: 1,
                      pb: 1,
                      borderBottom: '2px solid #e0e0e0',
                      color: '#333',
                    }}
                  >
                    {variant.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {variant.description}
                  </Typography>

                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Capacity (kWp)</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            Phase
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            Module (wp)
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            Qty
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            Price
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            Wire (m)
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {variant.products.map((product, prodIdx) => (
                          <TableRow key={prodIdx} hover>
                            <TableCell sx={{ fontWeight: '500' }}>{product.kWp} kW</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={product.phase === 1 ? 'Single' : 'Three'}
                                size="small"
                                color={product.phase === 1 ? 'success' : 'info'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="center">{product.module}wp</TableCell>
                            <TableCell align="center">{product.qty} Nos</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                              {formatCurrency(product.price)}
                            </TableCell>
                            <TableCell align="center">{product.wire}m</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Legend */}
      <Card sx={{ mt: 4, backgroundColor: '#f9f9f9' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            ℹ️ Information
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Capacity (kWp):</strong> Kilowatt peak - maximum power output of the system
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Phase:</strong> Single phase (1PH) for residential, Three phase (3PH) for commercial
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Module Type:</strong> Solar panel wattage - higher efficiency modules use fewer panels
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Qty:</strong> Number of solar modules included in the system
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Wire Length:</strong> Total AC/DC wiring included in the package
          </Typography>
          <Typography variant="body2">
            <strong>Note:</strong> All prices are base prices excluding GST and location-based charges.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
