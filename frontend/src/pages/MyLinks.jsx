import { useEffect, useState } from "react";
import { myUrls } from "../services/url";
import { ExternalLink, Copy, Check, ClipboardEdit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null); // for tick icon

  /* ---------- 1. load user’s URLs on mount ---------- */
  useEffect(() => {
    (async () => {
      try {
        const data = await myUrls(); // ← backend already returns shortUrl
        setUrls(data); // ← no normalising needed
      } catch (err) {
        toast.error(err.response?.data?.message ?? "Failed to load URLs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- 3. copy to clipboard ---------- */
  const handleCopy = async (url, code) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedCode(code);
      toast.success("Copied!");
      setTimeout(() => setCopiedCode(null), 2000); // tick reverts after 2 s
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Box maxWidth="960px" mx="auto" p={2}>
      <Typography variant="h5" align="center" fontWeight={700} mb={2}>
        My Short Links
      </Typography>

      {/* ---- list ---- */}
      <Paper elevation={2}>
        {loading ? (
          <Box p={4} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : urls.length === 0 ? (
          <Typography p={4} textAlign="center" color="text.secondary">
            No URLs yet — start by shortening one above.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "action.hover" }}>
                <TableCell>Short&nbsp;/&nbsp;Share</TableCell>
                <TableCell>Destination</TableCell>
                <TableCell align="center" sx={{ width: 80 }}>
                  Clicks
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <AnimatePresence initial={false}>
                {urls.map((u) => (
                  <motion.tr
                    key={u.shortCode}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "table-row" }}
                  >
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <a
                          href={u.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {u.shortUrl}
                          <ExternalLink size={14} />
                        </a>

                        <Tooltip title="Copy link">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(u.shortUrl, u.shortCode)}
                          >
                            {copiedCode === u.shortCode ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Tooltip title={u.longUrl}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span>{u.longUrl}</span>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleCopy(u.longUrl, u.shortCode + "-long")
                            }
                          >
                            {copiedCode === u.shortCode + "-long" ? (
                              <Check size={14} />
                            ) : (
                              <ClipboardEdit size={14} />
                            )}
                          </IconButton>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">{u.clicks}</TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
