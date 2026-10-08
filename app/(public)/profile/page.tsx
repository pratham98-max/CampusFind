"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  User,
  Hash,
  BookOpen,
  Phone,
  MapPin,
  Heart,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  QrCode,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";

const DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Chemical Engineering",
  "Instrumentation & Control",
  "Other / Staff",
];

const ACADEMIC_YEARS = [
  "First Year (FE)",
  "Second Year (SE)",
  "Third Year (TE)",
  "Final Year (BE)",
  "Postgraduate (M.Tech)",
  "Faculty / Staff",
];

const DIVISIONS = ["Division A", "Division B", "Division C", "Division D", "Division E", "N/A"];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Unknown"];

export default function ProfilePage() {
  const { user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [prn, setPrn] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[1]);
  const [division, setDivision] = useState(DIVISIONS[0]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [bloodGroup, setBloodGroup] = useState("B+");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          if (u) {
            setFullName(u.full_name || "");
            setPrn(u.prn || (u.student_id?.match(/^\d+$/) ? u.student_id : "12210452"));
            setRollNo(u.roll_no || u.student_id || "42");
            setDepartment(u.department || DEPARTMENTS[0]);
            setAcademicYear(u.academic_year || ACADEMIC_YEARS[1]);
            setDivision(u.division || DIVISIONS[0]);
            setEmail(u.email || "");
            setPhone(u.phone || "+91 98223 44556");
            setAddress(u.address || "Hostel Block A, Room 204, Campus Grounds");
            setEmergencyContact(u.emergency_contact || "+91 98220 12345");
            setBloodGroup(u.blood_group || "B+");
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Full Name is mandatory.");
      return;
    }

    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          prn: prn.trim(),
          roll_no: rollNo.trim(),
          department,
          academic_year: academicYear,
          division,
          phone: phone.trim(),
          address: address.trim(),
          emergency_contact: emergencyContact.trim(),
          blood_group: bloodGroup,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save profile changes.");
      }

      setSuccessMsg("Institutional enrollment profile successfully saved!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center animate-pulse space-y-4">
          <div className="h-6 w-1/4 bg-slate-200 mx-auto rounded"></div>
          <div className="h-4 w-1/3 bg-slate-100 mx-auto rounded"></div>
          <div className="h-64 bg-slate-100 rounded-xl mt-6"></div>
        </div>
      </div>
    );
  }

  // Calculate completeness percentage
  const fields = [fullName, prn, rollNo, department, academicYear, division, email, phone, address];
  const filledCount = fields.filter((f) => f && f.trim() !== "").length;
  const completeness = Math.round((filledCount / fields.length) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded bg-[#0B1F4D] px-2 py-0.5 text-xs font-bold text-[#F5C542]">
                STUDENT PROFILE
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-semibold">
                Vishwakarma Institute of Technology
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B1F4D] sm:text-3xl">
              Institutional Enrollment Profile
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Maintain your official university registration, class, division, and emergency contacts to expedite lost &amp; found claim verifications.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-end">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verification Readiness</span>
            </div>
            <div className="mt-1.5 flex items-center space-x-2">
              <div className="h-2 w-28 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                ></div>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900">{completeness}%</span>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-xs font-medium text-rose-800 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Smart Institutional ID Card Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-white to-slate-50 p-5 shadow-md relative overflow-hidden">
            {/* College Card Top Banner */}
            <div className="bg-[#0B1F4D] -mx-5 -mt-5 p-4 text-white flex items-center justify-between border-b border-[#F5C542]">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#F5C542] block">
                  STUDENT IDENTITY CARD
                </span>
                <span className="text-xs font-extrabold tracking-tight block">
                  VIT PUNE
                </span>
              </div>
              <div className="h-7 w-7 rounded-lg bg-white/10 flex items-center justify-center text-[#F5C542] font-bold text-xs">
                C
              </div>
            </div>

            {/* Student Photo & Identity */}
            <div className="mt-5 flex items-start space-x-3.5">
              <div className="h-16 w-16 rounded-xl bg-[#0B1F4D] text-[#F5C542] flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm shrink-0">
                {fullName ? fullName.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {fullName || "Student Name"}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500 block truncate">
                  {department}
                </span>
                <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] font-bold uppercase text-slate-700 mt-1 inline-block">
                  {user?.role || "Student"}
                </span>
              </div>
            </div>

            {/* Quick Card Details Grid */}
            <div className="mt-5 space-y-2 border-t border-slate-200/80 pt-4 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans text-[11px]">PRN:</span>
                <span className="font-bold text-slate-900">{prn || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans text-[11px]">Roll No:</span>
                <span className="font-bold text-slate-900">{rollNo || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans text-[11px]">Class &amp; Div:</span>
                <span className="font-bold text-slate-900">
                  {academicYear.split(" ")[0]} &bull; {division.replace("Division ", "Div ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans text-[11px]">Blood Group:</span>
                <span className="font-bold text-rose-700">{bloodGroup}</span>
              </div>
            </div>

            {/* Card Footer Barcode Mock */}
            <div className="mt-5 border-t border-dashed border-slate-300 pt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span className="tracking-widest font-mono">||| | |||| | ||| ||</span>
              <span className="font-semibold text-slate-600">VALID 2026-2027</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-900 block flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Automated Verification Match</span>
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When campus security validates a lost item handover, your PRN and Division are verified against this record.
            </p>
          </div>
        </div>

        {/* Right: Comprehensive Profile Form (8 cols) */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSaveProfile}
            className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Section 1: Academic Enrollment */}
            <div>
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <GraduationCap className="h-4 w-4 text-[#0B1F4D]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  1. Academic Enrollment Information
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Full Name (As per College Registry) <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1.5 relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Pratham Shelke"
                      className="w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    />
                  </div>
                </div>

                {/* PRN */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    PRN (Permanent Registration No.) <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1.5 relative">
                    <Hash className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={prn}
                      onChange={(e) => setPrn(e.target.value)}
                      placeholder="e.g. 12210452"
                      className="w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">8-digit university PRN number</p>
                </div>

                {/* Roll No */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Class Roll No. / Student ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1.5 relative">
                    <Hash className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 63 or 2024BCSE042"
                      className="w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">College ID or class roll number</p>
                </div>

                {/* Department */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Academic Department / Branch
                  </label>
                  <div className="mt-1.5">
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Academic Year / Class
                  </label>
                  <div className="mt-1.5">
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    >
                      {ACADEMIC_YEARS.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Division */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Class Division
                  </label>
                  <div className="mt-1.5">
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    >
                      {DIVISIONS.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Campus Residence */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Phone className="h-4 w-4 text-[#0B1F4D]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Contact &amp; Campus Residence
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* College Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    College Email
                  </label>
                  <div className="mt-1.5">
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Primary Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="mt-1.5 relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Hostel Room or Local Residential Address
                  </label>
                  <div className="mt-1.5 relative">
                    <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Boys Hostel Block A, Room 204 or Bibwewadi, Pune"
                      className="w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Emergency & Medical Verification */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Heart className="h-4 w-4 text-rose-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. Emergency &amp; Medical Verification
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Emergency Contact */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Emergency Contact (Parent / Guardian)
                  </label>
                  <div className="mt-1.5 relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="+91 98220 12345"
                      className="w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    />
                  </div>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Blood Group
                  </label>
                  <div className="mt-1.5">
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1F4D] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/10"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Data is encrypted and stored in the VIT Campus Registry.
              </p>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 rounded-lg bg-[#0B1F4D] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#132d69] transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#F5C542]" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-[#F5C542]" />
                    <span>Save Institutional Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
