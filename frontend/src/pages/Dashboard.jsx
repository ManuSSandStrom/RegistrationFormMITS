import { useEffect, useState } from "react";
import api from "../api";
import PersonalForm from "../forms/PersonalForm";
import SchoolingForm from "../forms/SchoolingForm";
import FamilyForm from "../forms/FamilyForm";
import DocumentsForm from "../forms/DocumentsForm";

export default function Dashboard() {
  const [tab, setTab] = useState("personal");
  const [profile, setProfile] = useState({ personal: {}, schooling: {}, family: {} });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [approval, setApproval] = useState({ status: "pending", note: "", at: null });
  const [docsComplete, setDocsComplete] = useState(false);

  const isEmail = (s) => /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(String(s || "").trim());
  const isMits = (s) => /^[a-f0-9]{10}@mits\.ac\.in$/i.test(String(s || ""));

  const isPersonalComplete = (p) => {
    const fullNameOk = /^[A-Za-z]+(?: [A-Za-z]+)+$/.test(String(p?.name || "").trim());
    const collegeOk = isMits(p?.email);
    const personalOk = !p?.personalEmail || isEmail(p?.personalEmail);
    const phoneOk = /^\d{10}$/.test(String(p?.phone || ""));
    const dobOk = !!p?.dob;
    const genderOk = !!p?.gender;
    const addrOk = String(p?.address || "").trim().length >= 3;
    const bloodOk = (p?.bloodGroup || "").length > 0;
    const nationOk = (p?.nationality || "").length > 0;
    const religionOk = (p?.religion || "").length > 0;
    return fullNameOk && collegeOk && personalOk && phoneOk && dobOk && genderOk && addrOk && bloodOk && nationOk && religionOk;
  };

  const isSchoolingComplete = (s) => {
    const req = ["tenth", "inter", "degree"];
    return req.every((k) => {
      const e = (s || {})[k] || {};
      return (
        String(e.institute || "").trim() &&
        String(e.board || "").trim() &&
        /^\d{4}$/.test(String(e.joinYear || "")) &&
        /^\d{4}$/.test(String(e.passYear || "")) &&
        String(e.score || "").trim()
      );
    });
  };

  const isFamilyComplete = (f) => {
    const fatherOk = /^[A-Za-z ]{2,}$/.test(String(f?.father || ""));
    const motherOk = /^[A-Za-z ]{2,}$/.test(String(f?.mother || ""));
    const guardianOk = /^\d{10}$/.test(String(f?.guardianContact || ""));
    const incomeOk = String(f?.familyIncome || "").trim().length > 0;
    return fatherOk && motherOk && guardianOk && incomeOk;
  };

  const isAllFormsComplete = () =>
    isPersonalComplete(profile.personal) && isSchoolingComplete(profile.schooling) && isFamilyComplete(profile.family);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/me");
        setProfile({
          personal: {
            name: data?.user?.name || data?.name || "",
            email: data?.user?.email || data?.email || "",
            personalEmail: data?.personalEmail || "",
            phone: data?.phone || "",
            course: data?.course || "MCA",
            dob: data?.dob || "",
            gender: data?.gender || "Male",
            bloodGroup: data?.bloodGroup || "",
            nationality: data?.nationality || "Indian",
            religion: data?.religion || "Other",
            address: data?.address || "",
          },
          schooling: data?.schooling || {},
          family: data?.family || {},
        });
        setApproval({ status: data?.approvalStatus || "pending", note: data?.approvalNote || "", at: data?.approvalAt || null });
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    if (approval.status !== "pending") return;
    const id = setInterval(async () => {
      try {
        const { data } = await api.get("/api/me");
        setApproval({ status: data?.approvalStatus || "pending", note: data?.approvalNote || "", at: data?.approvalAt || null });
      } catch {}
    }, 10000);
    return () => clearInterval(id);
  }, [approval.status]);

  const save = async () => {
    setMsg("");
    const college = profile?.personal?.email;
    if (!isMits(college)) {
      setMsg("College email must be 10 hex characters + @mits.ac.in (e.g., 24691f00e3@mits.ac.in)");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/students/me", profile);
      setMsg("Profile saved successfully.");
    } catch (e) {
      setMsg(e?.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const submitAll = async () => {
    setMsg("");
    const college = profile?.personal?.email;
    if (!isMits(college)) {
      setMsg("College email must be 10 hex characters + @mits.ac.in (e.g., 24691f00e3@mits.ac.in)");
      return;
    }
    if (!isAllFormsComplete() || !docsComplete) {
      setMsg("Complete all steps and required documents before submitting.");
      return;
    }
    setSaving(true);
    try {
      await api.put("/api/students/me", profile);
      setMsg("Application submitted. You will be notified after review.");
    } catch (e) {
      setMsg(e?.response?.data?.error || "Submit failed");
    } finally {
      setSaving(false);
    }
  };

  const order = ["personal", "schooling", "family", "documents"];
  const canGoForward = (from) => {
    if (from === "personal") return isPersonalComplete(profile.personal);
    if (from === "schooling") return isSchoolingComplete(profile.schooling);
    if (from === "family") return isFamilyComplete(profile.family);
    return true;
  };
  const handleTab = (next) => {
    if (order.indexOf(next) > order.indexOf(tab)) {
      if (!canGoForward(tab)) {
        const label = tab === "personal" ? "Personal" : tab === "schooling" ? "Schooling" : tab === "family" ? "Family" : "";
        setMsg(`Please complete all fields in ${label} step before continuing.`);
        return;
      }
    }
    setMsg("");
    setTab(next);
  };

  const tabs = [
    { key: "personal", label: "Step 1 — Personal", disabled: false },
    { key: "schooling", label: "Step 2 — Schooling", disabled: !isPersonalComplete(profile.personal) },
    { key: "family", label: "Step 3 — Family", disabled: !isPersonalComplete(profile.personal) || !isSchoolingComplete(profile.schooling) },
    { key: "documents", label: "Step 4 — Documents", disabled: !isAllFormsComplete() },
  ];

  return (
    <div className="container">
      {approval?.status && (
        <div className="card mb-16" style={{ borderColor: approval.status === "approved" ? "#16a34a" : approval.status === "rejected" ? "#ef4444" : "#f59e0b", background: "#0b1324" }}>
          <div>
            <strong>Application Status:</strong> <span className={`badge ${approval.status}`}>{approval.status}</span>
            <button className="btn secondary" style={{ marginLeft: 12 }} onClick={async () => { try { const { data } = await api.get("/api/me"); setApproval({ status: data?.approvalStatus || "pending", note: data?.approvalNote || "", at: data?.approvalAt || null }); } catch {} }}>Refresh</button>
          </div>
          {approval.status === "rejected" && approval.note && (
            <div style={{ marginTop: 8, color: "#fca5a5" }}><strong>Reason:</strong> {approval.note}</div>
          )}
        </div>
      )}

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.key} className={`tab ${tab === t.key ? "active" : ""}`} onClick={() => handleTab(t.key)} disabled={t.disabled}>{t.label}</button>
        ))}
      </div>

      {msg && (<div className="mb-16" style={{ color: "#fbbf24" }}>{msg}</div>)}

      <div className="card">
        {tab === "personal" && (<PersonalForm value={profile.personal} onChange={(v) => setProfile({ ...profile, personal: v })} />)}
        {tab === "schooling" && (<SchoolingForm value={profile.schooling} onChange={(v) => setProfile({ ...profile, schooling: v })} />)}
        {tab === "family" && (<FamilyForm value={profile.family} onChange={(v) => setProfile({ ...profile, family: v })} />)}
        {tab === "documents" && (<DocumentsForm onDocsChange={setDocsComplete} />)}

        {tab !== "documents" && (
          <div className="mt-24">
            <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            {msg && <span style={{ marginLeft: 12, color: "#a7f3d0" }}>{msg}</span>}
          </div>
        )}
        {tab === "documents" && (
          <div className="mt-24">
            <button className="btn success" onClick={submitAll} disabled={saving || !isAllFormsComplete() || !docsComplete}>{saving ? "Submitting..." : "Submit Application"}</button>
            {msg && <span style={{ marginLeft: 12, color: "#a7f3d0" }}>{msg}</span>}
            {(!isAllFormsComplete() || !docsComplete) && (
              <div className="mt-8" style={{ color: "#fbbf24" }}>Complete all steps (Personal, Schooling, Family) and upload all required documents before submitting.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
