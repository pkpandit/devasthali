"use client";

import { useState, useTransition } from "react";
import { X, Loader2, Save } from "lucide-react";
import {
  updateAdmissionRegistrationSettingsAction,
  type SerializedRegistrationSettings,
} from "@/lib/server/online-admission-actions";

interface RegistrationSettingsDialogProps {
  isOpen: boolean;
  settings: SerializedRegistrationSettings;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegistrationSettingsDialog({
  isOpen,
  settings,
  onClose,
  onSuccess,
}: RegistrationSettingsDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpenToggle, setIsOpenToggle] = useState<boolean>(settings.isRegistrationOpen);
  const [sessionLabel, setSessionLabel] = useState<string>(settings.sessionLabel);
  const [guidanceNotice, setGuidanceNotice] = useState<string>(settings.guidanceNotice || "");
  const [closedMessage, setClosedMessage] = useState<string>(settings.closedMessage || "");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await updateAdmissionRegistrationSettingsAction({
          isRegistrationOpen: isOpenToggle,
          sessionLabel: sessionLabel.trim(),
          guidanceNotice: guidanceNotice.trim() || null,
          closedMessage: closedMessage.trim() || null,
        });

        if (res.success) {
          onSuccess();
          onClose();
        } else {
          setError(res.error || "Failed to update registration settings.");
        }
      } catch (err) {
        console.error("Update settings error:", err);
        setError("An unexpected error occurred while saving registration settings.");
      }
    });
  };

  return (
    <div className="admin-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="admin-dialog-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "580px", width: "100%" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 id="settings-dialog-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" }}>
            Online Registration Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="admin-button admin-button--icon"
            aria-label="Close dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#fee2e2",
              border: "1px solid #f87171",
              borderRadius: "6px",
              color: "#b91c1c",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Registration Open/Closed Toggle */}
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: isOpenToggle ? "#ecfdf5" : "#fef2f2",
              border: `1px solid ${isOpenToggle ? "#a7f3d0" : "#fecaca"}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: isOpenToggle ? "#065f46" : "#991b1b" }}>
                Portal State: {isOpenToggle ? "OPEN" : "CLOSED"}
              </span>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: isOpenToggle ? "#047857" : "#b91c1c" }}>
                {isOpenToggle
                  ? "Public parents can submit new online admission applications."
                  : "Online application submission is disabled. Public visitors see the closed notice."}
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "8px" }}>
              <input
                type="checkbox"
                checked={isOpenToggle}
                onChange={(e) => setIsOpenToggle(e.target.checked)}
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600 }}>{isOpenToggle ? "Active" : "Closed"}</span>
            </label>
          </div>

          {/* Academic Session Label */}
          <div>
            <label
              htmlFor="settings-session-label"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Academic Session Label *
            </label>
            <input
              id="settings-session-label"
              type="text"
              required
              value={sessionLabel}
              onChange={(e) => setSessionLabel(e.target.value)}
              placeholder="e.g. 2026-27"
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px" }}
            />
            <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px", display: "block" }}>
              Must match YYYY-YY format (e.g. 2026-27). This dictates the application reference prefix.
            </span>
          </div>

          {/* Guidance Notice */}
          <div>
            <label
              htmlFor="settings-guidance-notice"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Public Guidance Notice
            </label>
            <textarea
              id="settings-guidance-notice"
              rows={3}
              value={guidanceNotice}
              onChange={(e) => setGuidanceNotice(e.target.value)}
              placeholder="Notice displayed at the top of the online form when portal is open..."
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", resize: "vertical" }}
            />
          </div>

          {/* Closed Message */}
          <div>
            <label
              htmlFor="settings-closed-message"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}
            >
              Portal Closed Message
            </label>
            <textarea
              id="settings-closed-message"
              rows={3}
              value={closedMessage}
              onChange={(e) => setClosedMessage(e.target.value)}
              placeholder="Message displayed to visitors when online registration is closed..."
              className="admin-input"
              style={{ width: "100%", padding: "8px 12px", fontSize: "14px", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="admin-button admin-button--secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="admin-button admin-button--primary"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
