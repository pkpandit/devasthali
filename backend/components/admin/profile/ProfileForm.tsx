"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { updateSiteProfileAction } from "@/lib/server/profile-actions";

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
  updatedAt: string;
}

interface ProfileFormProps {
  initialProfile: SerializedSiteProfile;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    schoolName: initialProfile.schoolName || "",
    tagline: initialProfile.tagline || "",
    affiliationNo: initialProfile.affiliationNo || "",
    schoolCode: initialProfile.schoolCode || "",
    establishedYear: initialProfile.establishedYear ? String(initialProfile.establishedYear) : "",
    legacyYearsText: initialProfile.legacyYearsText || "",
    schoolType: initialProfile.schoolType || "",
    medium: initialProfile.medium || "",
    gradesOffered: initialProfile.gradesOffered || "",
    campusAddress: initialProfile.campusAddress || "",
    tehsil: initialProfile.tehsil || "",
    district: initialProfile.district || "",
    state: initialProfile.state || "",
    pinCode: initialProfile.pinCode || "",
    landmark: initialProfile.landmark || "",
    primaryPhone: initialProfile.primaryPhone || "",
    admissionsPhone: initialProfile.admissionsPhone || "",
    receptionPhone: initialProfile.receptionPhone || "",
    hostelWardenPhone: initialProfile.hostelWardenPhone || "",
    whatsappNumber: initialProfile.whatsappNumber || "",
    officeEmail: initialProfile.officeEmail || "",
    principalEmail: initialProfile.principalEmail || "",
    workingHours: initialProfile.workingHours || "",
    facebookUrl: initialProfile.facebookUrl || "",
    youtubeUrl: initialProfile.youtubeUrl || "",
    instagramUrl: initialProfile.instagramUrl || "",
    copyrightText: initialProfile.copyrightText || "",
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successBanner, setSuccessBanner] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});
    setSuccessBanner(false);

    startTransition(async () => {
      try {
        const res = await updateSiteProfileAction(null, formData);
        if (res.success) {
          setSuccessBanner(true);
          router.refresh();
          setTimeout(() => setSuccessBanner(false), 4000);
        } else {
          setServerError(res.error || "Failed to update site identity.");
          if (res.fieldErrors) {
            setFieldErrors(res.fieldErrors);
          }
        }
      } catch (err) {
        console.error("Submit error:", err);
        setServerError("An unexpected error occurred while saving profile.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Site identity and contact details saved successfully!</span>
        </div>
      )}

      {/* 1. Institutional Identity */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
        <h2 className="text-lg font-bold font-heading text-gray-900 border-b pb-2">
          1. Institutional Identity & Accreditation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              School Name *
            </label>
            <input
              type="text"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
              required
            />
            {fieldErrors.schoolName && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.schoolName[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Tagline / Institutional Motto
            </label>
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              CBSE Affiliation Number
            </label>
            <input
              type="text"
              name="affiliationNo"
              value={formData.affiliationNo}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              CBSE School Code
            </label>
            <input
              type="text"
              name="schoolCode"
              value={formData.schoolCode}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Established Year
            </label>
            <input
              type="number"
              name="establishedYear"
              value={formData.establishedYear}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Legacy Badge Text (e.g. 38+)
            </label>
            <input
              type="text"
              name="legacyYearsText"
              value={formData.legacyYearsText}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Institution Type
            </label>
            <input
              type="text"
              name="schoolType"
              value={formData.schoolType}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Instruction Medium
            </label>
            <input
              type="text"
              name="medium"
              value={formData.medium}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Grades Offered
            </label>
            <input
              type="text"
              name="gradesOffered"
              value={formData.gradesOffered}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* 2. Physical Campus Address */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
        <h2 className="text-lg font-bold font-heading text-gray-900 border-b pb-2">
          2. Physical Campus Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Campus Village / Area
            </label>
            <input
              type="text"
              name="campusAddress"
              value={formData.campusAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Tehsil
            </label>
            <input
              type="text"
              name="tehsil"
              value={formData.tehsil}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              District
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Pin Code
            </label>
            <input
              type="text"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Landmark & Highway Directions
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* 3. Primary Helplines & Contacts */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
        <h2 className="text-lg font-bold font-heading text-gray-900 border-b pb-2">
          3. Primary Helplines & Office Contacts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Admissions Helpline Phone
            </label>
            <input
              type="text"
              name="admissionsPhone"
              value={formData.admissionsPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Primary Office Phone
            </label>
            <input
              type="text"
              name="primaryPhone"
              value={formData.primaryPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Reception Phone
            </label>
            <input
              type="text"
              name="receptionPhone"
              value={formData.receptionPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Chief Hostel Warden Phone
            </label>
            <input
              type="text"
              name="hostelWardenPhone"
              value={formData.hostelWardenPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Admissions WhatsApp Number (10–12 digits, e.g. 919554960408)
            </label>
            <input
              type="text"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Office Email
            </label>
            <input
              type="email"
              name="officeEmail"
              value={formData.officeEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Principal&apos;s Email
            </label>
            <input
              type="email"
              name="principalEmail"
              value={formData.principalEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Working Hours
            </label>
            <input
              type="text"
              name="workingHours"
              value={formData.workingHours}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>
        </div>
      </div>

      {/* 4. Social Channels & Footer */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
        <h2 className="text-lg font-bold font-heading text-gray-900 border-b pb-2">
          4. Social Channels & Copyright
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Facebook Page URL
            </label>
            <input
              type="url"
              name="facebookUrl"
              value={formData.facebookUrl}
              onChange={handleChange}
              placeholder="https://facebook.com/..."
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              YouTube Channel URL
            </label>
            <input
              type="url"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Instagram Profile URL
            </label>
            <input
              type="url"
              name="instagramUrl"
              value={formData.instagramUrl}
              onChange={handleChange}
              placeholder="https://instagram.com/..."
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Footer Copyright Text
            </label>
            <input
              type="text"
              name="copyrightText"
              value={formData.copyrightText}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-600 border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Site Identity Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
