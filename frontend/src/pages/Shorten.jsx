import { useState } from 'react';
import { shorten } from '../services/url';
import toast from 'react-hot-toast';

import {
  Box,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ExternalLink, Copy, Check } from 'lucide-react';

const isValidUrl = (str) => {
  try { new URL(str); return true; } catch { return false; }
};

export default function Shorten() {
  const [longUrl, setLongUrl] = useState('');
  const [alias,   setAlias]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [linkInfo, setLinkInfo] = useState(null);
  const [copied,   setCopied]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidUrl(longUrl)) {
      toast.error('Enter a valid URL (with http/https)');
      return;
    }

    setSubmitting(true);
    try {
      const data = await shorten(longUrl.trim(), alias.trim() || undefined);
      setLinkInfo(data);
      setCopied(false);
      toast.success('Short URL created 🎉');
      setLongUrl('');
      setAlias('');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error creating URL');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(linkInfo.shortUrl);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <Box maxWidth="640px" mx="auto" p={2}>
      {/* form */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Create a short link
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Long URL"
              placeholder="https://example.com/article"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              size="small"
              disabled={submitting}
              fullWidth
            />
            <TextField
              label="Custom alias (optional)"
              placeholder="my‑article"
              helperText="3‑30 chars · letters, numbers, - or _"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              size="small"
              disabled={submitting}
              fullWidth
            />
            <Box textAlign="right">
              <Button
                variant="contained"
                type="submit"
                disabled={submitting || !longUrl.trim()}
                sx={{ minWidth: 120 }}
              >
                {submitting ? <CircularProgress size={18} /> : 'Shorten'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>

      {/* result card */}
      {linkInfo && (
        <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
          {/* short URL row */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {linkInfo.shortUrl}
            </Typography>

            <Tooltip title="Copy link">
              <IconButton size="small" onClick={handleCopy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Open in new tab">
              <IconButton
                size="small"
                component="a"
                href={linkInfo.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={16} />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* long URL row */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ wordBreak: 'break-all', mt: 0.5 }}
          >
            {linkInfo.longUrl}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
