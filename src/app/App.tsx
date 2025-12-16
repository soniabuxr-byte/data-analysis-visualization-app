import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState } from 'react';
import { DataUpload } from './components/DataUpload';
import { DataPreview } from './components/DataPreview';
import { DataManipulation } from './components/DataManipulation';
import { DataAugmentation } from './components/DataAugmentation';
import { Visualization } from './components/Visualization';
import { Box, Stepper, Step, StepLabel, Container, Paper } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export interface DataRow {
  [key: string]: string | number | boolean | null;
}

export interface DataState {
  columns: string[];
  rows: DataRow[];
  fileName?: string;
}

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<DataState>({ columns: [], rows: [] });

  const steps = [
    'Upload Data',
    'Preview & Explore',
    'Data Manipulation',
    'Data Augmentation',
    'Visualize'
  ];

  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleDataUpload = (uploadedData: DataState) => {
    setData(uploadedData);
    handleNext();
  };

  const handleDataUpdate = (updatedData: DataState) => {
    setData(updatedData);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <DataUpload onUpload={handleDataUpload} />;
      case 1:
        return <DataPreview data={data} onNext={handleNext} onBack={handleBack} />;
      case 2:
        return (
          <DataManipulation
            data={data}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <DataAugmentation
            data={data}
            onUpdate={handleDataUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return <Visualization data={data} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
          
          <Box>{renderStepContent(activeStep)}</Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
