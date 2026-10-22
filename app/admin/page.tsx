"use client";

import React, { useState } from "react";
import {
  Users,
  Bell,
  FileText,
  UploadCloud,
  Calendar,
  Settings,
  ShieldCheck,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Search,
} from "lucide-react";
import { NOTICES_DATA, SCHOOL_INFO } from "@/lib/school-data";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "enquiries" | "notices" | "downloads" | "banners" | "seo"
  >("enquiries");

  // Simulated Enquiry records
  const [enquiries, setEnquiries] = useState([
    {
      id: "ENQ-901",
      studentName: "Aditya Rai",
      parentName: "Sanjay Rai",
      phone: "+91 94500 11223",
      grade: "Class XI (Science)",
      type: "Residential Boarder",
      city: "Rasra",
      status: "Callback Scheduled",
      date: "Today, 10:15 AM",
    },
    {
      id: "ENQ-902",
      studentName: "Pooja Singh",
      parentName: "Devendra Singh",
      phone: "+91 98380 44556",
      grade: "Class I",
      type: "Day-Scholar",
      city: "Ballia City",
      status: "Prospectus Sent",
      date: "Today, 09:30 AM",
    },
    {
      id: "ENQ-903",
      studentName: "Mohit Verma",
      parentName: "Ramesh Verma",
      phone: "+91 99350 77889",
      grade: "Class IX",
      type: "Residential Boarder",
      city: "Buxar",
      status: "New Lead",
      date: "Yesterday",
    },
  ]);

  const [notices, setNotices] = useState(NOTICES_DATA);
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeCategory, setNewNoticeCategory] = useState<"Circular" | "Examination" | "Admission">("Circular");

  const handleAddNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim()) return;

    const newObj = {
      id: `not-${Date.now()}`,
      title: newNoticeTitle.trim(),
      category: newNoticeCategory,
      date: "Just now",
      isNew: true,
      fileSize: "1.2 MB",
    };

    setNotices([newObj, ...notices]);
    setNewNoticeTitle("");
  };

  return (
    <div className="w-full min-h-screen bg-[#F3F4F6] py-10">
      <div className="site-container space-y-8">
        {/* Top Admin Header */}
        <div className="bg-[#111827] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
              <span>Devasthaly Vidyapeeth • Management Portal</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold">
              School Administrative & Content Control Center
            </h1>
            <p className="text-xs text-gray-300 mt-1">
              Manage admission leads, post circulars, upload mandatory disclosures, and configure SEO metadata.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-white/10 text-gray-200 border border-white/20 px-3 py-1.5 rounded-lg font-bold">
              Role: Academic Director / Principal
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-2">
          {[
            { id: "enquiries", label: "Admission Enquiries", icon: Users, badge: enquiries.length },
            { id: "notices", label: "Notices & Circulars", icon: Bell, badge: notices.length },
            { id: "downloads", label: "PDFs & Disclosures", icon: UploadCloud },
            { id: "banners", label: "Announcement Banners", icon: Calendar },
            { id: "seo", label: "Page SEO Metadata", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#4F46E5] text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-[#F3F4F6] border border-[#E5E7EB]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? "bg-white/20 text-white" : "bg-[#F3F4F6] text-gray-700 border border-[#E5E7EB]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ADMISSION ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-bold text-[#111827]">
                  Incoming Admission Leads (Session 2025–26)
                </h2>
                <p className="text-xs text-[#4B5563]">
                  Enquiries received via website form and WhatsApp lead capture.
                </p>
              </div>
              <button
                onClick={() => alert("Exporting enquiries to Excel/CSV format...")}
                className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-colors self-start sm:self-auto shadow-xs border border-[#4338CA]"
              >
                Export Leads to Excel / CSV
              </button>
            </div>

            <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-[#111827] text-white">
                  <tr>
                    <th className="py-3 px-4 font-bold">Lead ID</th>
                    <th className="py-3 px-4 font-bold">Student Name</th>
                    <th className="py-3 px-4 font-bold">Parent & Phone</th>
                    <th className="py-3 px-4 font-bold">Class & Type</th>
                    <th className="py-3 px-4 font-bold">Location</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
                  {enquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-[#F3F4F6]">
                      <td className="py-3 px-4 font-mono font-bold text-[#4F46E5]">{enq.id}</td>
                      <td className="py-3 px-4 font-bold text-[#111827]">{enq.studentName}</td>
                      <td className="py-3 px-4">
                        <div className="text-[#111827] font-medium">{enq.parentName}</div>
                        <div className="text-[11px] text-gray-500">{enq.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#111827]">{enq.grade}</span>
                        <div className="text-[10px] text-gray-500">{enq.type}</div>
                      </td>
                      <td className="py-3 px-4">{enq.city}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            enq.status === "New Lead"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => alert(`Opening callback log for ${enq.studentName}`)}
                          className="px-2.5 py-1 rounded bg-[#F3F4F6] text-gray-700 hover:bg-[#4F46E5] hover:text-white transition-colors text-xs font-bold border border-[#E5E7EB]"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: NOTICES & CIRCULARS PUBLISHER */}
        {activeTab === "notices" && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs">
              <h2 className="font-heading text-xl font-bold text-[#111827] mb-2">
                Publish New Notice / Circular
              </h2>
              <form onSubmit={handleAddNotice} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Notice Title / Heading
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Schedule for CBSE Class X Practical Examinations 2026"
                      value={newNoticeTitle}
                      onChange={(e) => setNewNoticeTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs sm:text-sm focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Category
                    </label>
                    <select
                      value={newNoticeCategory}
                      onChange={(e) => setNewNoticeCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] text-xs sm:text-sm bg-white outline-none focus:border-[#4F46E5]"
                    >
                      <option value="Circular">Circular</option>
                      <option value="Examination">Examination</option>
                      <option value="Admission">Admission</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs border border-[#4338CA]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Notice Immediately</span>
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
              <h3 className="font-heading font-bold text-base text-[#111827]">Live Active Notices</h3>
              <div className="space-y-2">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#4F46E5] mr-2">[{n.category}]</span>
                      <span className="text-[#111827] font-medium">{n.title}</span>
                      <span className="text-gray-400 ml-2">({n.date})</span>
                    </div>
                    {/* Explicit Destructive Action with Confirmation */}
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete notice: "${n.title}"? This cannot be undone.`)) {
                          setNotices(notices.filter((item) => item.id !== n.id));
                        }
                      }}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg border border-red-200 transition-colors inline-flex items-center gap-1"
                      title="Delete Notice"
                      aria-label={`Delete notice ${n.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold">Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOWNLOADS & PDF REPOSITORY */}
        {activeTab === "downloads" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
            <h2 className="font-heading text-xl font-bold text-[#111827]">
              CBSE Mandatory Public Disclosure & PDF Document Repository
            </h2>
            <div className="border-2 border-dashed border-[#E5E7EB] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 bg-[#F3F4F6]">
              <UploadCloud className="w-12 h-12 text-[#4F46E5]" />
              <div>
                <p className="font-bold text-sm text-[#111827]">
                  Drag & Drop PDF document here to publish
                </p>
                <p className="text-xs text-[#4B5563]">Supports PDF, DOCX up to 25 MB</p>
              </div>
              <button
                onClick={() => alert("Browse local files dialog simulated.")}
                className="px-5 py-2.5 bg-[#4F46E5] text-white text-xs font-bold rounded-xl hover:bg-[#4338CA] transition-colors shadow-xs border border-[#4338CA]"
              >
                Browse Files
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: BANNER SCHEDULER */}
        {activeTab === "banners" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#111827]">
              Homepage Emergency Banner & Admission Ticker
            </h2>
            <p className="text-xs text-[#4B5563]">
              Configure top announcement text visible to all website visitors across desktop and mobile.
            </p>
            <div className="space-y-3 pt-2">
              <input
                type="text"
                defaultValue="Admissions Open for Session 2025–26: Registration for LKG to Class XI (Science & Commerce)"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-xs sm:text-sm outline-none focus:border-[#4F46E5]"
              />
              <button
                onClick={() => alert("Banner headline updated across website!")}
                className="px-6 py-2.5 bg-[#4F46E5] text-white text-xs font-bold rounded-xl hover:bg-[#4338CA] transition-colors shadow-xs border border-[#4338CA]"
              >
                Save & Update Live Banner
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: SEO METADATA MANAGER */}
        {activeTab === "seo" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h2 className="font-heading text-xl font-bold text-[#111827]">
              Search Engine Optimization (SEO) & Schema Settings
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-[#4B5563]">
              <div>
                <label className="block font-bold text-[#111827] mb-1">Homepage Title Tag</label>
                <input
                  type="text"
                  readOnly
                  value="Devasthaly Vidyapeeth | Best CBSE School in Ballia & Rasra (UP)"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] text-[#111827]"
                />
              </div>
              <div>
                <label className="block font-bold text-[#111827] mb-1">Local SEO Schema Type</label>
                <input
                  type="text"
                  readOnly
                  value="School, EducationalOrganization, PostalAddress, ContactPoint, FAQPage (Active)"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] text-emerald-700 font-bold"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
