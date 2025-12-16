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
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Data Preview
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {data.fileName || 'Dataset'} • {data.rows.length} rows × {data.columns.length} columns
            </Typography>
          </Box>
          <Chip label="Data Loaded" color="success" icon={<Info />} />
        </Box>

        {/* Summary Statistics */}
        <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
          Dataset Overview
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Rows
                </Typography>
                <Typography variant="h4">{data.rows.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Columns
                </Typography>
                <Typography variant="h4">{data.columns.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Numeric Columns
                </Typography>
                <Typography variant="h4">
                  {data.columns.filter(col => getColumnStats(col).type === 'numeric').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Categorical Columns
                </Typography>
                <Typography variant="h4">
                  {data.columns.filter(col => getColumnStats(col).type === 'categorical').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Column Statistics */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Column Statistics
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {data.columns.slice(0, 4).map(column => {
            const stats = getColumnStats(column);
            return (
              <Grid item xs={12} sm={6} md={3} key={column}>
                <Card variant="outlined">
                  <CardContent>
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
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Data Sample
        </Typography>
        <TableContainer component={Paper} variant="outlined">
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<NavigateBefore />}
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          size="large"
          endIcon={<NavigateNext />}
          onClick={onNext}
        >
          Continue to Manipulation
        </Button>
      </Box>
    </Box>
  );
}
