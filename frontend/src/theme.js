// theme.js
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary:   { main: '#3D5AFE' },
    secondary: { main: '#00C49A' },
    error:     { main: '#E53935' },
    background: {
      default: '#F5F7FA',      // body
      paper:   '#FFFFFF',      // cards
    },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 8 } } },
  },
});
