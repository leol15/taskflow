"use client";

import React, { useState } from "react";
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AuthSheet } from "../features/AuthSheet";
import styles from "./SyncBadge.module.scss";

export function SyncBadge() {
  const { user, syncStatus, isDisconnected, disconnect, reconnect, signOut, firebaseConfigured } =
    useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showAuthSheet, setShowAuthSheet] = useState(false);

  if (!firebaseConfigured) return null;

  const isSignedIn = !!user;
  const isConnected = isSignedIn && !isDisconnected;

  function getStatusIcon() {
    if (!isSignedIn || isDisconnected) {
      return <CloudOff size={13} />;
    }
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw size={13} className={styles.spinning} />;
      case "synced":
        return <CheckCircle2 size={13} />;
      case "error":
        return <AlertCircle size={13} />;
      default:
        return <CloudOff size={13} />;
    }
  }

  function getStatusLabel() {
    if (!isSignedIn) return "Local only";
    if (isDisconnected) return "Disconnected";
    switch (syncStatus) {
      case "syncing": return "Syncing…";
      case "synced":  return "Synced";
      case "error":   return "Sync error";
      default:        return "Local only";
    }
  }

  function getBadgeModifier() {
    if (!isSignedIn || isDisconnected) return styles.local;
    if (syncStatus === "synced") return styles.synced;
    if (syncStatus === "syncing") return styles.syncing;
    if (syncStatus === "error") return styles.error;
    return styles.local;
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.badge} ${getBadgeModifier()}`}
        onClick={() => setShowMenu((v) => !v)}
        aria-label="Sync status"
        id="sync-badge"
      >
        {getStatusIcon()}
        <span>{getStatusLabel()}</span>
      </button>

      {showMenu && (
        <>
          <div className={styles.menuBackdrop} onClick={() => setShowMenu(false)} />
          <div className={styles.menu}>
            {!isSignedIn ? (
              <>
                <p className={styles.menuTitle}>Cloud Sync</p>
                <p className={styles.menuDesc}>
                  Link an account to back up tasks and access them from any device.
                </p>
                <button
                  className={styles.menuAction}
                  onClick={() => { setShowMenu(false); setShowAuthSheet(true); }}
                  id="sync-menu-link-account"
                >
                  <Cloud size={14} />
                  Link account…
                </button>
              </>
            ) : isDisconnected ? (
              <>
                <p className={styles.menuTitle}>
                  {user.displayName ?? user.email}
                </p>
                <p className={styles.menuDesc}>
                  Sync is paused. Your local tasks are safe.
                </p>
                <button
                  className={styles.menuAction}
                  onClick={() => { reconnect(); setShowMenu(false); }}
                  id="sync-menu-reconnect"
                >
                  <Cloud size={14} />
                  Resume sync
                </button>
                <button
                  className={`${styles.menuAction} ${styles.danger}`}
                  onClick={() => { signOut(); setShowMenu(false); }}
                  id="sync-menu-signout"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <p className={styles.menuTitle}>
                  {user.displayName ?? user.email}
                </p>
                {syncStatus === "error" && (
                  <p className={styles.menuDesc}>
                    Last sync failed. Your local tasks are safe.
                  </p>
                )}
                <button
                  className={styles.menuAction}
                  onClick={() => { disconnect(); setShowMenu(false); }}
                  id="sync-menu-disconnect"
                >
                  <CloudOff size={14} />
                  Go local only
                </button>
                <button
                  className={`${styles.menuAction} ${styles.danger}`}
                  onClick={() => { signOut(); setShowMenu(false); }}
                  id="sync-menu-signout"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </>
      )}

      <AuthSheet
        isOpen={showAuthSheet}
        onClose={() => setShowAuthSheet(false)}
      />
    </div>
  );
}
