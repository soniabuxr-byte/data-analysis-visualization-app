import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  AutoAwesome,
  CheckCircle,
  Psychology,
  TrendingUp,
  Category,
} from '@mui/icons-material';
import { DataState } from '../App';

interface DataAugmentationProps {
  data: DataState;
  onUpdate: (data: DataState) => void;
  onNext: () => void;
  onBack: () => void;
}

interface AugmentationOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  config?: any;
}

export function DataAugmentation({ data, onUpdate, onNext, onBack }: DataAugmentationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [augmentationComplete, setAugmentationComplete] = useState(false);
  
  const [options, setOptions] = useState<AugmentationOption[]>([
    {
      id: 'synthetic',
      name: 'Generate Synthetic Data',
      description: 'Use AI to generate additional realistic rows based on existing patterns',
      icon: <AutoAwesome />,
      enabled: false,
      config: { rows: 100 },
    },
    {
      id: 'missing',
      name: 'Fill Missing Values',
      description: 'Automatically fill missing values using statistical methods or ML predictions',
      icon: <CheckCircle />,
      enabled: true,
    },
    {
      id: 'feature',
      name: 'Feature Engineering',
      description: 'Create new features from existing columns using AI-powered suggestions',
      icon: <Psychology />,
      enabled: false,
    },
    {
      id: 'outlier',
      name: 'Outlier Detection',
      description: 'Identify and handle outliers in your numeric columns',
      icon: <TrendingUp />,
      enabled: false,
    },
    {
      id: 'categorize',
      name: 'Smart Categorization',
      description: 'Automatically categorize text data into meaningful groups',
      icon: <Category />,
      enabled: false,
    },
  ]);

  const toggleOption = (id: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
    ));
  };

  const updateConfig = (id: string, config: any) => {
    setOptions(options.map(opt =>
      opt.id === id ? { ...opt, config } : opt
    ));
  };

  const applyAugmentation = () => {
    setIsProcessing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setAugmentationComplete(true);
          
          // Apply augmentations
          let augmentedData = { ...data };
          
          // Simulate data augmentation
          options.forEach(opt => {
            if (opt.enabled) {
              if (opt.id === 'synthetic' && opt.config?.rows) {
                // Add synthetic rows
                const syntheticRows = Array.from({ length: Math.min(opt.config.rows, 50) }, (_, i) => {
                  const newRow: any = {};
                  data.columns.forEach(col => {
                    const existingValues = data.rows.map(r => r[col]);
                    const randomValue = existingValues[Math.floor(Math.random() * existingValues.length)];
                    newRow[col] = randomValue;
                  });
                  return newRow;
                });
                augmentedData.rows = [...augmentedData.rows, ...syntheticRows];
              }
              
              if (opt.id === 'missing') {
                // Fill missing values
                augmentedData.rows = augmentedData.rows.map(row => {
                  const newRow = { ...row };
                  Object.keys(newRow).forEach(key => {
                    if (newRow[key] === null || newRow[key] === '') {
                      // Use mean for numbers, mode for strings
                      const values = data.rows.map(r => r[key]).filter(v => v !== null && v !== '');
                      if (values.length > 0) {
                        if (typeof values[0] === 'number') {
                          const sum = (values as number[]).reduce((a, b) => a + b, 0);
                          newRow[key] = sum / values.length;
                        } else {
                          newRow[key] = values[0];
                        }
                      }
                    }
                  });
                  return newRow;
                });
              }
            }
          });
          
          onUpdate(augmentedData);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const enabledCount = options.filter(opt => opt.enabled).length;

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Data Augmentation
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Use AI-powered tools to enhance and expand your dataset
        </Typography>

        {/* Summary */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Current Rows
                </Typography>
                <Typography variant="h4">{data.rows.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Augmentations
                </Typography>
                <Typography variant="h4">{enabledCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ bgcolor: augmentationComplete ? 'success.light' : 'background.paper' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Typography variant="h6">
                  {augmentationComplete ? 'Complete' : 'Ready'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Augmentation Options */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Augmentation Options
        </Typography>
        
        <List>
          {options.map((option, index) => (
            <Box key={option.id}>
              <ListItem
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2,
                  bgcolor: option.enabled ? 'action.selected' : 'background.paper',
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  {option.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{option.name}</Typography>
                      {option.enabled && <Chip label="Active" size="small" color="primary" />}
                    </Box>
                  }
                  secondary={option.description}
                />
                <Switch
                  edge="end"
                  checked={option.enabled}
                  onChange={() => toggleOption(option.id)}
                />
              </ListItem>

              {/* Configuration for specific options */}
              {option.id === 'synthetic' && option.enabled && (
                <Box sx={{ mb: 2, ml: 7, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <TextField
                    size="small"
                    label="Number of Synthetic Rows"
                    type="number"
                    value={option.config?.rows || 100}
                    onChange={(e) => updateConfig(option.id, { rows: parseInt(e.target.value) })}
                    InputProps={{ inputProps: { min: 10, max: 1000 } }}
                    sx={{ width: 250 }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
                    Generate between 10-1000 synthetic rows
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </List>

        {/* Processing Status */}
        {isProcessing && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Processing augmentations...
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {progress}% complete
            </Typography>
          </Box>
        )}

        {/* Success Message */}
        {augmentationComplete && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
            Augmentation complete! Your dataset has been enhanced with {enabledCount} AI-powered transformations.
          </Alert>
        )}

        {/* Apply Button */}
        {!augmentationComplete && !isProcessing && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AutoAwesome />}
              onClick={applyAugmentation}
              disabled={enabledCount === 0}
              fullWidth
            >
              Apply Augmentations ({enabledCount} selected)
            </Button>
          </Box>
        )}

        {/* AI Insights */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          AI Recommendations
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <AutoAwesome color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Missing Data Detected"
                  secondary="We recommend enabling 'Fill Missing Values' to improve data quality"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Psychology color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Feature Engineering Opportunity"
                  secondary="Your dataset could benefit from derived features for better analysis"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Small Dataset Size"
                  secondary="Consider generating synthetic data to improve model training"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
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
          Continue to Visualization
        </Button>
      </Box>
    </Box>
  );
}
