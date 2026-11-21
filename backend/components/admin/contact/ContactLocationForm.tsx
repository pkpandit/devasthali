"use client";

import { useState, useTransition } from "react";
import { MapPin, Navigation, Eye, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { updateContactLocation } from "@/lib/server/contact-actions";
import { isValidGoogleMapsEmbedUrl, isValidGoogleMapsDirectionsUrl } from "@/lib/validation/contact";

export interface SerializedSiteProfile {
  id: string;
  schoolName: string;
  tagline: string | null;
  affiliationNo: string | null;
  schoolCode: string | null;
  establishedYear: number | null;
  legacyYearsText: string | null;
  schoolType: string | null;
  medium: string | null;
  gradesOffered: string | null;
  campusAddress: string | null;
  tehsil: string | null;
  district: string | null;
  state: string | null;
  pinCode: string | null;
  landmark: string | null;
  primaryPhone: string | null;
  admissionsPhone: string | null;
  receptionPhone: string | null;
  hostelWardenPhone: string | null;
  whatsappNumber: string | null;
  officeEmail: string | null;
  principalEmail: string | null;
  workingHours: string | null;
  facebookUrl: string | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  copyrightText: string | null;
  mapEmbedUrl?: string | null;
  mapDirectionsUrl?: string | null;
  directionsOverview?: string | null;
  visitorGuidelines?: string | null;
  emergencyMedicalPhone?: string | null;
  emergencySecurityPhone?: string | null;
  updatedAt: string;
}

interface ContactLocationFormProps {
  initialProfile: SerializedSiteProfile;
  onSuccess?: () => void;
}

export function ContactLocationForm({
  initialProfile,
  onSuccess,
}: ContactLocationFormProps) {
  const [isPending, startTransition] = useTransition();

  const [campusAddress, setCampusAddress] = useState(initialProfile.campusAddress || "");
  const [tehsil, setTehsil] = useState(initialProfile.tehsil || "");
  const [district, setDistrict] = useState(initialProfile.district || "");
  const [state, setState] = useState(initialProfile.state || "");
  const [pinCode, setPinCode] = useState(initialProfile.pinCode || "");
  const [landmark, setLandmark] = useState(initialProfile.landmark || "");
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initialProfile.mapEmbedUrl || "");
  const [mapDirectionsUrl, setMapDirectionsUrl] = useState(initialProfile.mapDirectionsUrl || "");
  const [directionsOverview, setDirectionsOverview] = useState(initialProfile.directionsOverview || "");
  const [visitorGuidelines, setVisitorGuidelines] = useState(initialProfile.visitorGuidelines || "");

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isEmbedValid = !mapEmbedUrl || isValidGoogleMapsEmbedUrl(mapEmbedUrl);
  const isDirectionsValid = !mapDirectionsUrl || isValidGoogleMapsDirectionsUrl(mapDirectionsUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (mapEmbedUrl && !isValidGoogleMapsEmbedUrl(mapEmbedUrl)) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid HTTPS Google Maps embed link (e.g., https://www.google.com/maps/embed?...).",
      });
      return;
    }

    if (mapDirectionsUrl && !isValidGoogleMapsDirectionsUrl(mapDirectionsUrl)) {
      setStatusMessage({
        type: "error",
        text: "Please enter a valid HTTPS Google Maps navigation link.",
      });
      return;
    }

    startTransition(async () => {
      const res = await updateContactLocation({
        campusAddress: campusAddress.trim() || null,
        tehsil: tehsil.trim() || null,
        district: district.trim() || null,
        state: state.trim() || null,
        pinCode: pinCode.trim() || null,
        landmark: landmark.trim() || null,
        mapEmbedUrl: mapEmbedUrl.trim() || null,
        mapDirectionsUrl: mapDirectionsUrl.trim() || null,
        directionsOverview: directionsOverview.trim() || null,
        visitorGuidelines: visitorGuidelines.trim() || null,
      });

      if (res.success) {
        setStatusMessage({
          type: "success",
          text: "Campus location, Google Maps embed, and driving directions saved successfully.",
        });
        if (onSuccess) onSuccess();
      } else {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to update campus location.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {statusMessage && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 500,
            backgroundColor: statusMessage.type === "success" ? "#ecfdf5" : "#fee2e2",
            border: `1px solid ${statusMessage.type === "success" ? "#a7f3d0" : "#fca5a5"}`,
            color: statusMessage.type === "success" ? "#065f46" : "#b91c1c",
          }}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 size={18} aria-hidden="true" />
          ) : (
            <AlertCircle size={18} aria-hidden="true" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Section 1: Physical Campus Address */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MapPin size={18} aria-hidden="true" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
              Physical Campus Address &amp; Geography
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
              Official administrative location rendered in public footers and contact directory.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Campus Address / Village
            </label>
            <input
              type="text"
              value={campusAddress}
              onChange={(e) => setCampusAddress(e.target.value)}
              placeholder="e.g. Chilkahar"
              className="admin-input"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Tehsil / Sub-division
            </label>
            <input
              type="text"
              value={tehsil}
              onChange={(e) => setTehsil(e.target.value)}
              placeholder="e.g. Rasra"
              className="admin-input"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              District
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Ballia"
              className="admin-input"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              State
            </label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. Uttar Pradesh"
              className="admin-input"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              PIN Code
            </label>
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="e.g. 277123"
              className="admin-input"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Landmark
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Chilkahar Railway Crossing"
              className="admin-input"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Google Maps Embed & Interactive Preview */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Navigation size={18} aria-hidden="true" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
              Google Maps Interactive Embed &amp; Directions URL
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
              Live map embedded on the public contact page and turn-by-turn navigation link.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Google Maps Embed URL (HTTPS only)
            </label>
            <input
              type="url"
              value={mapEmbedUrl}
              onChange={(e) => setMapEmbedUrl(e.target.value)}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="admin-input"
              style={{
                width: "100%",
                borderColor: !isEmbedValid ? "#ef4444" : undefined,
              }}
            />
            {!isEmbedValid && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#dc2626" }}>
                Must be an official HTTPS Google Maps embed link (e.g. https://www.google.com/maps/embed?...).
              </p>
            )}
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#6b7280" }}>
              Tip: In Google Maps, search for Devasthaly Vidyapeeth, click Share &gt; Embed a map, and copy the link from the src attribute.
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Google Maps Navigation / Directions URL
            </label>
            <input
              type="url"
              value={mapDirectionsUrl}
              onChange={(e) => setMapDirectionsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=Devasthaly+Vidyapeeth+Chilkahar+Ballia"
              className="admin-input"
              style={{
                width: "100%",
                borderColor: !isDirectionsValid ? "#ef4444" : undefined,
              }}
            />
            {!isDirectionsValid && (
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#dc2626" }}>
                Must be an official Google Maps navigation link (maps.google.com or maps.app.goo.gl).
              </p>
            )}
          </div>

          {/* Safe Embed Preview */}
          {mapEmbedUrl && isEmbedValid && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Eye size={16} color="#4b5563" aria-hidden="true" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#4b5563" }}>
                  Live Map Embed Preview:
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "320px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#f3f4f6",
                }}
              >
                <iframe
                  title="Google Maps Location Preview"
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Directions Overview & Visitor Guidelines */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#111827" }}>
          Directions Overview &amp; Visitor Guidelines
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Driving &amp; Transit Directions Overview
            </label>
            <textarea
              rows={3}
              value={directionsOverview}
              onChange={(e) => setDirectionsOverview(e.target.value)}
              placeholder="e.g. Located on the Ballia-Rasra State Highway near Chilkahar Railway Crossing. Approximately 8 km from Rasra Railway Station and 25 km from Ballia City Centre."
              className="admin-input"
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Campus Visitor &amp; Security Gate Guidelines
            </label>
            <textarea
              rows={3}
              value={visitorGuidelines}
              onChange={(e) => setVisitorGuidelines(e.target.value)}
              placeholder="e.g. All visitors must report to Main Gate for security entry pass. Visiting hours for Principal: Mon–Sat 9:00 AM – 1:30 PM."
              className="admin-input"
              style={{ width: "100%", resize: "vertical" }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={isPending || !isEmbedValid || !isDirectionsValid}
          className="admin-button admin-button--primary"
          style={{ minWidth: "180px", padding: "10px 20px" }}
        >
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span>Saving Location...</span>
            </>
          ) : (
            <span>Save Location Settings</span>
          )}
        </button>
      </div>
    </form>
  );
}
