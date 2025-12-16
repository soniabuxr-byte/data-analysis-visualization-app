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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  FilterList,
  Sort,
  Delete,
  Add,
  Functions,
} from '@mui/icons-material';
import { DataState, DataRow } from '../App';

interface DataManipulationProps {
  data: DataState;
  onUpdate: (data: DataState) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Filter {
  column: string;
  operator: string;
  value: string;
}

export function DataManipulation({ data, onUpdate, onNext, onBack }: DataManipulationProps) {
  const [workingData, setWorkingData] = useState<DataState>(data);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(data.columns);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [showTransformDialog, setShowTransformDialog] = useState(false);

  const applyFilters = () => {
    let filteredRows = [...data.rows];

    filters.forEach(filter => {
      filteredRows = filteredRows.filter(row => {
        const value = row[filter.column];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'equals':
            return String(value) === filterValue;
          case 'contains':
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
          case 'greater':
            return Number(value) > Number(filterValue);
          case 'less':
            return Number(value) < Number(filterValue);
          case 'notNull':
            return value !== null && value !== '';
          default:
            return true;
        }
      });
    });

    setWorkingData({ ...workingData, rows: filteredRows });
  };

  const applySort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);

    const sortedRows = [...workingData.rows].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return direction === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    setWorkingData({ ...workingData, rows: sortedRows });
  };

  const addFilter = () => {
    setFilters([...filters, { column: data.columns[0], operator: 'equals', value: '' }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof Filter, value: string) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const handleApplyChanges = () => {
    const finalData = {
      ...workingData,
      columns: selectedColumns,
    };
    onUpdate(finalData);
    onNext();
  };

  const applyTransformation = (type: string, column: string) => {
    const transformedRows = workingData.rows.map(row => {
      const value = row[column];
      let newValue = value;

      switch (type) {
        case 'normalize':
          if (typeof value === 'number') {
            const values = workingData.rows.map(r => r[column] as number);
            const min = Math.min(...values);
            const max = Math.max(...values);
            newValue = (value - min) / (max - min);
          }
          break;
        case 'uppercase':
          newValue = String(value).toUpperCase();
          break;
        case 'lowercase':
          newValue = String(value).toLowerCase();
          break;
        case 'removeNulls':
          newValue = value === null || value === '' ? 0 : value;
          break;
      }

      return { ...row, [column]: newValue };
    });

    setWorkingData({ ...workingData, rows: transformedRows });
    setShowTransformDialog(false);
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Data Manipulation
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Filter, sort, and transform your data
        </Typography>

        {/* Action Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              variant="outlined" 
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => setShowFilterDialog(true)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterList color="primary" />
                  <Box>
                    <Typography variant="subtitle1">Filtering</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {filters.length} active
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              variant="outlined"
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => setShowColumnDialog(true)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sort color="primary" />
                  <Box>
                    <Typography variant="subtitle1">Columns</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedColumns.length} selected
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              variant="outlined"
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => setShowTransformDialog(true)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Functions color="primary" />
                  <Box>
                    <Typography variant="subtitle1">Transform</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Apply functions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box>
                    <Typography variant="subtitle1">Result</Typography>
                    <Typography variant="h6" color="primary">
                      {workingData.rows.length} rows
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {filters.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Active Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {filters.map((filter, index) => (
                <Chip
                  key={index}
                  label={`${filter.column} ${filter.operator} "${filter.value}"`}
                  onDelete={() => removeFilter(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Data Table */}
        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                {selectedColumns.map((column) => (
                  <TableCell key={column} sx={{ fontWeight: 600 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {column}
                      <IconButton size="small" onClick={() => applySort(column)}>
                        <Sort fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {workingData.rows.slice(0, 20).map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{index + 1}</TableCell>
                  {selectedColumns.map((column) => (
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
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Showing first 20 rows of {workingData.rows.length} total
        </Typography>
      </Paper>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onClose={() => setShowFilterDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Configure Filters</DialogTitle>
        <DialogContent>
          {filters.map((filter, index) => (
            <Box key={index} sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Column</InputLabel>
                <Select
                  value={filter.column}
                  label="Column"
                  onChange={(e) => updateFilter(index, 'column', e.target.value)}
                >
                  {data.columns.map(col => (
                    <MenuItem key={col} value={col}>{col}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={filter.operator}
                  label="Operator"
                  onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                >
                  <MenuItem value="equals">Equals</MenuItem>
                  <MenuItem value="contains">Contains</MenuItem>
                  <MenuItem value="greater">Greater Than</MenuItem>
                  <MenuItem value="less">Less Than</MenuItem>
                  <MenuItem value="notNull">Not Null</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Value"
                value={filter.value}
                onChange={(e) => updateFilter(index, 'value', e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <IconButton onClick={() => removeFilter(index)} color="error">
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<Add />} onClick={addFilter} variant="outlined">
            Add Filter
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilterDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => { applyFilters(); setShowFilterDialog(false); }} 
            variant="contained"
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Column Selection Dialog */}
      <Dialog open={showColumnDialog} onClose={() => setShowColumnDialog(false)}>
        <DialogTitle>Select Columns</DialogTitle>
        <DialogContent>
          <List>
            {data.columns.map(column => (
              <ListItem key={column} dense button onClick={() => toggleColumn(column)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedColumns.includes(column)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={column} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowColumnDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Transform Dialog */}
      <Dialog open={showTransformDialog} onClose={() => setShowTransformDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Transformations</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a transformation to apply to a column
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {data.columns.slice(0, 3).map(column => (
            <Box key={column} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>{column}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" onClick={() => applyTransformation('normalize', column)}>
                  Normalize
                </Button>
                <Button size="small" variant="outlined" onClick={() => applyTransformation('uppercase', column)}>
                  Uppercase
                </Button>
                <Button size="small" variant="outlined" onClick={() => applyTransformation('lowercase', column)}>
                  Lowercase
                </Button>
                <Button size="small" variant="outlined" onClick={() => applyTransformation('removeNulls', column)}>
                  Remove Nulls
                </Button>
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTransformDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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
          onClick={handleApplyChanges}
        >
          Continue to Augmentation
        </Button>
      </Box>
    </Box>
  );
}
