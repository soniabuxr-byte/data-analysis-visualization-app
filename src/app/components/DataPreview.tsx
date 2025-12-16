import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Info,
  TrendingUp,
  BarChart,
} from '@mui/icons-material';
import { DataState } from '../App';

interface DataPreviewProps {
  data: DataState;
  onNext: () => void;
  onBack: () => void;
}

export function DataPreview({ data, onNext, onBack }: DataPreviewProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getColumnStats = (columnName: string) => {
    const values = data.rows.map(row => row[columnName]);
    const numericValues = values.filter(v => typeof v === 'number') as number[];
    
    if (numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      const mean = sum / numericValues.length;
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      
      return {
        type: 'numeric',
        count: values.length,
        mean: mean.toFixed(2),
        min,
        max,
        nullCount: values.filter(v => v === null || v === '').length,
      };
    } else {
      const uniqueValues = new Set(values.filter(v => v !== null && v !== ''));
      return {
        type: 'categorical',
        count: values.length,
        unique: uniqueValues.size,
        nullCount: values.filter(v => v === null || v === '').length,
      };
    }
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: { xs: 2, sm: 0 },
          mb: { xs: 2, sm: 3 } 
        }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
              Data Preview
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {data.fileName || 'Dataset'} • {data.rows.length} rows × {data.columns.length} columns
            </Typography>
          </Box>
          <Chip label="Data Loaded" color="success" icon={<Info />} />
        </Box>

        {/* Summary Statistics */}
        <Typography variant="h6" gutterBottom sx={{ mt: { xs: 2, sm: 3 }, mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Dataset Overview
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Typography color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Rows
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>{data.rows.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Typography color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Total Columns
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>{data.columns.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Typography color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Numeric Columns
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                  {data.columns.filter(col => getColumnStats(col).type === 'numeric').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Typography color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Categorical Columns
                </Typography>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
                  {data.columns.filter(col => getColumnStats(col).type === 'categorical').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Column Statistics */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Column Statistics
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          {data.columns.slice(0, 4).map(column => {
            const stats = getColumnStats(column);
            return (
              <Grid item xs={6} sm={6} md={3} key={column}>
                <Card variant="outlined">
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {column}
                      </Typography>
                      <Tooltip title={stats.type === 'numeric' ? 'Numeric Column' : 'Categorical Column'}>
                        <IconButton size="small">
                          {stats.type === 'numeric' ? <TrendingUp fontSize="small" /> : <BarChart fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Chip
                      label={stats.type}
                      size="small"
                      color={stats.type === 'numeric' ? 'primary' : 'secondary'}
                      sx={{ mb: 1 }}
                    />
                    {stats.type === 'numeric' ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block">Mean: {stats.mean}</Typography>
                        <Typography variant="caption" display="block">Min: {stats.min}</Typography>
                        <Typography variant="caption" display="block">Max: {stats.max}</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block">Unique: {stats.unique}</Typography>
                        <Typography variant="caption" display="block">Count: {stats.count}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Data Table */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Data Sample
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                {data.columns.map((column) => (
                  <TableCell key={column} sx={{ fontWeight: 600 }}>
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    {data.columns.map((column) => (
                      <TableCell key={column}>
                        {row[column] !== null && row[column] !== undefined
                          ? String(row[column])
                          : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data.rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<NavigateBefore />}
          onClick={onBack}
          fullWidth
          sx={{ width: { sm: 'auto' } }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          size="large"
          endIcon={<NavigateNext />}
          onClick={onNext}
          fullWidth
          sx={{ width: { sm: 'auto' } }}
        >
          Continue to Manipulation
        </Button>
      </Box>
    </Box>
  );
}
