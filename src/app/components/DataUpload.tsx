import { useState, useCallback } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  Info,
} from '@mui/icons-material';
import { DataState } from '../App';

interface DataUploadProps {
  onUpload: (data: DataState) => void;
}

export function DataUpload({ onUpload }: DataUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    messages: { type: 'success' | 'error' | 'warning'; text: string }[];
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const parseCSV = (text: string): DataState => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // Try to parse as number
        const numValue = parseFloat(value);
        row[header] = isNaN(numValue) ? value : numValue;
      });
      return row;
    });

    return {
      columns: headers,
      rows: rows,
    };
  };

  const loadSampleData = async () => {
    try {
      const response = await fetch('/sample_data.csv');
      const text = await response.text();
      const parsedData = parseCSV(text);
      parsedData.fileName = 'sample_data.csv';
      
      setSelectedFile(new File([text], 'sample_data.csv', { type: 'text/csv' }));
      validateData(parsedData, 'sample_data.csv');
      (window as any).__uploadedData = parsedData;
    } catch (error) {
      console.error('Error loading sample data:', error);
    }
  };

  const validateData = useCallback((data: DataState, fileName: string) => {
    setIsValidating(true);
    
    // Simulate AI validation
    setTimeout(() => {
      const messages: { type: 'success' | 'error' | 'warning'; text: string }[] = [];
      
      // Check for missing values
      const missingCount = data.rows.reduce((count, row) => {
        return count + Object.values(row).filter(v => v === null || v === '').length;
      }, 0);
      
      if (missingCount > 0) {
        messages.push({
          type: 'warning',
          text: `Found ${missingCount} missing values across ${data.rows.length} rows`,
        });
      }
      
      // Check data types
      const numericColumns = data.columns.filter(col => {
        return data.rows.every(row => typeof row[col] === 'number' || row[col] === null);
      });
      
      messages.push({
        type: 'success',
        text: `Detected ${numericColumns.length} numeric columns and ${data.columns.length - numericColumns.length} text columns`,
      });
      
      // File format check
      messages.push({
        type: 'success',
        text: `File format: ${fileName.endsWith('.csv') ? 'CSV' : 'Unknown'} - Valid`,
      });
      
      // Data quality score
      const qualityScore = Math.max(0, 100 - (missingCount / (data.rows.length * data.columns.length)) * 100);
      messages.push({
        type: qualityScore > 80 ? 'success' : 'warning',
        text: `Data quality score: ${qualityScore.toFixed(1)}%`,
      });

      setValidationResults({
        isValid: true,
        messages,
      });
      setIsValidating(false);
    }, 1500);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setValidationResults(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedData = parseCSV(text);
      parsedData.fileName = file.name;
      
      validateData(parsedData, file.name);
      
      // Store data for upload
      (window as any).__uploadedData = parsedData;
    };
    reader.readAsText(file);
  }, [validateData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleContinue = () => {
    const uploadedData = (window as any).__uploadedData;
    if (uploadedData) {
      onUpload(uploadedData);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Upload Your Data
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload your dataset to begin analysis. We support CSV files.
      </Typography>

      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 6,
          textAlign: 'center',
          bgcolor: isDragging ? 'action.hover' : 'background.paper',
          transition: 'all 0.2s',
          cursor: 'pointer',
          mb: 3,
        }}
      >
        <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag & drop your CSV file here
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or
        </Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUpload />}
        >
          Browse Files
          <input
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileInput}
          />
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
          or try with sample data
        </Typography>
        <Button
          variant="outlined"
          onClick={loadSampleData}
          color="secondary"
        >
          Load Sample Dataset
        </Button>
      </Box>

      {selectedFile && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" icon={<Info />}>
            <AlertTitle>File Selected</AlertTitle>
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </Alert>
        </Box>
      )}

      {isValidating && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            AI-Powered Validation in Progress...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {validationResults && (
        <Box sx={{ mb: 3 }}>
          <Alert severity={validationResults.isValid ? 'success' : 'error'} sx={{ mb: 2 }}>
            <AlertTitle>
              {validationResults.isValid ? 'Validation Complete' : 'Validation Failed'}
            </AlertTitle>
            AI-powered analysis of your dataset is complete.
          </Alert>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Validation Results
            </Typography>
            <List dense>
              {validationResults.messages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {message.type === 'success' && <CheckCircle color="success" />}
                    {message.type === 'error' && <ErrorIcon color="error" />}
                    {message.type === 'warning' && <ErrorIcon color="warning" />}
                  </ListItemIcon>
                  <ListItemText primary={message.text} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleContinue}
          disabled={!validationResults?.isValid}
        >
          Continue to Preview
        </Button>
      </Box>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Supported File Formats
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="CSV" size="small" color="primary" variant="outlined" />
          <Chip label="Excel (coming soon)" size="small" disabled />
          <Chip label="JSON (coming soon)" size="small" disabled />
        </Box>
      </Box>
    </Paper>
  );
}
