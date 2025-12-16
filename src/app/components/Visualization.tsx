import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  NavigateBefore,
  Download,
  BarChart as BarChartIcon,
  ShowChart,
  PieChart as PieChartIcon,
  ScatterPlot,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DataState } from '../App';

interface VisualizationProps {
  data: DataState;
  onBack: () => void;
}

const COLORS = ['#1976d2', '#dc004e', '#f57c00', '#388e3c', '#7b1fa2', '#0097a7'];

export function Visualization({ data, onBack }: VisualizationProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter'>('bar');
  const [xAxis, setXAxis] = useState(data.columns[0]);
  const [yAxis, setYAxis] = useState(data.columns[1] || data.columns[0]);

  const numericColumns = data.columns.filter(col => {
    return data.rows.every(row => typeof row[col] === 'number' || row[col] === null);
  });

  const categoricalColumns = data.columns.filter(col => !numericColumns.includes(col));

  // Prepare chart data
  const chartData = data.rows.slice(0, 20).map((row, index) => ({
    name: String(row[xAxis]) || `Row ${index + 1}`,
    value: Number(row[yAxis]) || 0,
    x: Number(row[xAxis]) || index,
    y: Number(row[yAxis]) || 0,
  }));

  const handleExport = (format: string) => {
    if (format === 'csv') {
      const csv = [
        data.columns.join(','),
        ...data.rows.map(row => 
          data.columns.map(col => row[col]).join(',')
        ),
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'processed_data.csv';
      a.click();
    }
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS[0]} name={yAxis} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={COLORS[0]} name={yAxis} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name={xAxis} />
              <YAxis type="number" dataKey="y" name={yAxis} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name={`${xAxis} vs ${yAxis}`} data={chartData} fill={COLORS[0]} />
            </ScatterChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Data Visualization
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Visualize your processed data and export results
        </Typography>

        {/* Stats Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Records
                </Typography>
                <Typography variant="h4">{data.rows.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Columns
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
                <Typography variant="h4">{numericColumns.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Categorical Columns
                </Typography>
                <Typography variant="h4">{categoricalColumns.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Chart Configuration */}
        <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Chart Configuration
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <ToggleButtonGroup
                value={chartType}
                exclusive
                onChange={(_, value) => value && setChartType(value)}
                fullWidth
              >
                <ToggleButton value="bar">
                  <BarChartIcon sx={{ mr: 1 }} /> Bar
                </ToggleButton>
                <ToggleButton value="line">
                  <ShowChart sx={{ mr: 1 }} /> Line
                </ToggleButton>
                <ToggleButton value="pie">
                  <PieChartIcon sx={{ mr: 1 }} /> Pie
                </ToggleButton>
                <ToggleButton value="scatter">
                  <ScatterPlot sx={{ mr: 1 }} /> Scatter
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>X-Axis</InputLabel>
                <Select value={xAxis} label="X-Axis" onChange={(e) => setXAxis(e.target.value)}>
                  {data.columns.map(col => (
                    <MenuItem key={col} value={col}>{col}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Y-Axis</InputLabel>
                <Select value={yAxis} label="Y-Axis" onChange={(e) => setYAxis(e.target.value)}>
                  {data.columns.map(col => (
                    <MenuItem key={col} value={col}>{col}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {/* Chart Display */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
            </Typography>
            <Chip label={`${chartData.length} data points`} size="small" />
          </Box>
          {renderChart()}
        </Paper>

        {/* Export Options */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Export Data
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Download />}
              onClick={() => handleExport('csv')}
            >
              Export as CSV
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="outlined" fullWidth startIcon={<Download />} disabled>
              Export as Excel
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="outlined" fullWidth startIcon={<Download />} disabled>
              Export as JSON
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button variant="outlined" fullWidth startIcon={<Download />} disabled>
              Export Chart
            </Button>
          </Grid>
        </Grid>

        {/* Data Summary */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Processing Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your data has been successfully processed through all stages: Upload → Preview → Manipulation → Augmentation → Visualization. 
            You can now export your processed dataset or create additional visualizations.
          </Typography>
        </Box>
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
          color="success"
          startIcon={<Download />}
          onClick={() => handleExport('csv')}
        >
          Download Results
        </Button>
      </Box>
    </Box>
  );
}
