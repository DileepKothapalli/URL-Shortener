// src/pages/Auth.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../services/Auth";

import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

export default function Auth() {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [username, setUsername] = useState("");
  const [password, setPwd] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');               // clear previous error

  // quick front‑end validation
  if (!username || !password) {
    setError('username and password are required');
    return;
  }

  try {
    // call the correct endpoint
    const { token } =
      mode === 'login'
        ? await login({ username, password })
        : await signup({ username, password });

    // Bearer‑token style → save it
    if (token) localStorage.setItem('token', token);

    // Cookie style → nothing to save; the cookie is set by the server

    nav('/my-links');
  } catch (err) {
    setError(err?.response?.data?.message || 'Something went wrong');
  }
};

return (
  <Container
    component="main"
    maxWidth={false}          // ← full‑width, no max constraint
    disableGutters            // ← remove the 16 px side padding
    sx={{
      minHeight: '100vh',     // full viewport height
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      bgcolor: 'grey.100',
      padding: '0',
      margin:'0'
    }}
  >
    <Paper
      elevation={6}
      sx={{
        p: 4,
        width: '100%',         // allow it to shrink/grow inside container
        maxWidth: 360,         // cap so it never becomes too wide
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 3,
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
        <LockIcon />
      </Avatar>

      <Typography component="h1" variant="h5" fontWeight={600}>
        {mode === 'login' ? 'Log in' : 'Sign up'}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 2, width: '100%' }}
      >
        <TextField
          label="Username"
          margin="normal"
          fullWidth
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          margin="normal"
          fullWidth
          required
          value={password}
          onChange={(e) => setPwd(e.target.value)}
        />

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {mode === 'login' ? 'Log in' : 'Create account'}
        </Button>

        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Log in'}
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  </Container>
);


}
