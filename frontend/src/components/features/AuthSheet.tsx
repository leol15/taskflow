"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Cloud, Mail, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import styles from "./AuthSheet.module.scss";

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "choose" | "email" | "email-sent";

export function AuthSheet({ isOpen, onClose }: AuthSheetProps) {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [step, setStep] = useState<Step>("choose");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setStep("choose");
      setEmail("");
      setError(null);
      setLoading(false);
    }, 300);
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      handleClose();
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email.trim());
      setStep("email-sent");
    } catch {
      setError("Failed to send link. Check the email address and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={handleClose}>
          <motion.div
            className={styles.sheet}
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Link account for cloud sync"
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerIcon}>
                <Cloud size={18} />
              </div>
              <div>
                <h2 className={styles.title}>Sync to Cloud</h2>
                <p className={styles.subtitle}>
                  Back up tasks and access them on any device.
                </p>
              </div>
              <button
                className={styles.close}
                onClick={handleClose}
                aria-label="Close"
                id="auth-sheet-close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {step === "choose" && (
                <>
                  <button
                    className={styles.providerButton}
                    onClick={handleGoogle}
                    disabled={loading}
                    id="auth-google-btn"
                  >
                    {loading ? (
                      <Loader2 size={16} className={styles.spinner} />
                    ) : (
                      // Google "G" logo as inline SVG (no external asset needed)
                      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#4285F4" d="M45.3 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12a10.2 10.2 0 0 1-4.4 6.7v5.6h7.1c4.2-3.9 6.6-9.6 6.6-16.3z"/>
                        <path fill="#34A853" d="M24 46c6 0 11-2 14.7-5.3l-7.1-5.6c-2 1.3-4.5 2.1-7.6 2.1-5.8 0-10.8-3.9-12.5-9.2H4.1v5.8A22 22 0 0 0 24 46z"/>
                        <path fill="#FBBC04" d="M11.5 28c-.4-1.3-.7-2.6-.7-4s.3-2.7.7-4v-5.8H4.1A22 22 0 0 0 2 24c0 3.6.9 7 2.1 10l7.4-6z"/>
                        <path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.4-6.4C34.9 4.1 29.9 2 24 2A22 22 0 0 0 4.1 14l7.4 5.8C13.2 14.7 18.2 10.8 24 10.8z"/>
                      </svg>
                    )}
                    Continue with Google
                  </button>

                  <div className={styles.divider}>
                    <span>or</span>
                  </div>

                  <button
                    className={`${styles.providerButton} ${styles.secondary}`}
                    onClick={() => setStep("email")}
                    disabled={loading}
                    id="auth-email-btn"
                  >
                    <Mail size={16} />
                    Continue with email
                  </button>

                  {error && <p className={styles.error}>{error}</p>}
                </>
              )}

              {step === "email" && (
                <form onSubmit={handleEmailSubmit} className={styles.emailForm}>
                  <label htmlFor="auth-email-input" className={styles.label}>
                    Email address
                  </label>
                  <input
                    id="auth-email-input"
                    type="email"
                    className={styles.emailInput}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                  {error && <p className={styles.error}>{error}</p>}
                  <div className={styles.emailActions}>
                    <button
                      type="button"
                      className={styles.back}
                      onClick={() => { setStep("choose"); setError(null); }}
                    >
                      ← Back
                    </button>
                    <Button
                      type="submit"
                      size="sm"
                      variant="primary"
                      disabled={loading || !email.trim()}
                      id="auth-email-submit"
                    >
                      {loading ? <Loader2 size={13} className={styles.spinner} /> : null}
                      Send link
                    </Button>
                  </div>
                </form>
              )}

              {step === "email-sent" && (
                <div className={styles.sent}>
                  <div className={styles.sentIcon}>✉️</div>
                  <p className={styles.sentTitle}>Check your inbox</p>
                  <p className={styles.sentDesc}>
                    We sent a sign-in link to <strong>{email}</strong>. Click the link to
                    finish linking your account.
                  </p>
                  <button className={styles.back} onClick={handleClose}>
                    Got it
                  </button>
                </div>
              )}
            </div>

            {/* Footer note */}
            {step === "choose" && (
              <p className={styles.footerNote}>
                Your local tasks are always preserved regardless of your account status.
              </p>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
