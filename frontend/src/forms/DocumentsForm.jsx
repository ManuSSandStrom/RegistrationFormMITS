import { useEffect, useState } from "react";
import api from "../api";

const LABELS = {
  aadhar: "Aadhar",
  pan: "PAN Card",
  caste: "Caste Certificate",
  tenth: "10th Marksheet",
  inter: "Inter Marksheet",
  degree: "Degree Certificate",
};

export default function DocumentsForm({ onDocsChange }) {
  const [stdFiles, setStdFiles] = useState({});
  const [existingStd, setExistingStd] = useState({});
  const [extras, setExtras] = useState([{ name: "", file: null }]);
  const [existingExtras, setExistingExtras] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const base = api.defaults.baseURL?.replace(/\/$/, "") || "";

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/api/me");
        setExistingStd(data.documents || {});
        setExistingExtras(data.extraDocuments || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const required = Object.keys(LABELS);
    const complete = required.every((k) => !!existingStd?.[k]);
    if (onDocsChange) onDocsChange(complete);
  }, [existingStd, onDocsChange]);

  const onStdFile = (key) => (e) => setStdFiles({ ...stdFiles, [key]: e.target.files?.[0] });

  const uploadStandardAll = async () => {
    setMsg(""); setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(LABELS).forEach((k) => { if (stdFiles[k]) fd.append(k, stdFiles[k]); });
      const { data } = await api.post("/api/students/me/documents", fd);
      setExistingStd(data.documents || existingStd);
      setMsg("Documents uploaded successfully.");
    } catch (e) { setMsg(e?.response?.data?.error || "Upload failed"); }
    finally { setLoading(false); }
  };

  const reuploadOne = async (key) => {
    const file = stdFiles[key];
    if (!file) { setMsg(`Choose a file for ${LABELS[key]} before reuploading.`); return; }
    setMsg(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append(key, file);
      const { data } = await api.post("/api/students/me/documents", fd);
      setExistingStd(data.documents || existingStd);
      setMsg(`${LABELS[key]} reuploaded.`);
    } catch (e) { setMsg(e?.response?.data?.error || `Reupload failed for ${LABELS[key]}`); }
    finally { setLoading(false); }
  };

  const deleteStandard = async (key) => {
    try {
      const { data } = await api.delete('/api/students/me/documents', { params: { key } });
      setExistingStd(data.documents || {});
      setMsg(`${LABELS[key]} removed.`);
    } catch (e) { setMsg(e?.response?.data?.error || 'Delete failed'); }
  };

  const updateExtra = (idx, key, val) => {
    const next = extras.slice();
    next[idx] = { ...next[idx], [key]: val };
    setExtras(next);
  };
  const addExtra = () => setExtras([...extras, { name: "", file: null }]);

  const uploadExtras = async () => {
    const items = extras.filter((x) => x.file);
    if (!items.length) { setMsg("Please add at least one extra file."); return; }
    setLoading(true); setMsg("");
    try {
      const fd = new FormData();
      items.forEach((it) => { fd.append("names", it.name || "Attachment"); fd.append("extras", it.file); });
      const { data } = await api.post("/api/students/me/attachments", fd);
      setExistingExtras([...(existingExtras || []), ...(data.added || [])]);
      setExtras([{ name: "", file: null }]);
      setMsg("Additional files uploaded.");
    } catch (e) { setMsg(e?.response?.data?.error || "Extra upload failed"); }
    finally { setLoading(false); }
  };

  const deleteExtra = async (path) => {
    try {
      const { data } = await api.delete('/api/students/me/attachments', { params: { path } });
      setExistingExtras(data.extraDocuments || []);
      setMsg('Deleted attachment.');
    } catch (e) { setMsg(e?.response?.data?.error || 'Delete failed'); }
  };

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Standard Documents</h3>
        {Object.keys(LABELS).map((k) => (
          <div key={k} className="grid2 mt-8">
            <div>
              <label className="label">{LABELS[k]}</label>
              <input className="input" type="file" onChange={onStdFile(k)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {existingStd?.[k] ? (
                <>
                  <a href={`${base}${existingStd[k]}`} target="_blank" rel="noreferrer">Download current</a>
                  <button className="btn secondary" type="button" onClick={() => reuploadOne(k)} disabled={loading}>Reupload</button>
                  <button className="btn danger" type="button" onClick={() => deleteStandard(k)}>Delete</button>
                </>
              ) : (
                <>
                  <span style={{ color: "#a1a1aa" }}>(not uploaded)</span>
                  <button className="btn secondary" type="button" onClick={() => reuploadOne(k)} disabled={loading}>Upload</button>
                </>
              )}
            </div>
          </div>
        ))}
        <div className="mt-16">
          <button className="btn" onClick={uploadStandardAll} disabled={loading}>{loading ? "Uploading..." : "Upload All Selected"}</button>
        </div>
      </div>

      <div className="card mt-24">
        <h3 style={{ marginTop: 0 }}>Additional Files</h3>
        {extras.map((ex, idx) => (
          <div key={idx} className="grid2 mt-8">
            <input className="input" placeholder="File name (e.g., Transfer Certificate)" value={ex.name} onChange={(e) => updateExtra(idx, "name", e.target.value)} />
            <input className="input" type="file" onChange={(e) => updateExtra(idx, "file", e.target.files?.[0] || null)} />
          </div>
        ))}
        <div className="mt-8" style={{ display: "flex", gap: 8 }}>
          <button className="btn secondary" onClick={addExtra} type="button">Add More</button>
          <button className="btn warn" onClick={uploadExtras} disabled={loading}>{loading ? "Uploading..." : "Upload Additional Files"}</button>
        </div>
        {!!existingExtras?.length && (
          <div className="mt-16">
            <strong>Uploaded Files</strong>
            <ul>
              {existingExtras.map((d, i) => (
                <li key={i} className="mt-8">
                  <a href={`${base}${d.path}`} download>{d.name || d.path}</a>
                  {d.size ? <span style={{marginLeft:8, color:'#a1a1aa'}}>({Math.round(d.size/1024)} KB)</span> : null}
                  {d.uploadedAt ? <span style={{marginLeft:8, color:'#a1a1aa'}}>{new Date(d.uploadedAt).toLocaleString()}</span> : null}
                  <button className="btn danger" style={{marginLeft:8}} type="button" onClick={()=>deleteExtra(d.path)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {msg && <div className="mt-16" style={{ color: msg.includes("failed") ? "#fca5a5" : "#a7f3d0" }}>{msg}</div>}
    </div>
  );
}
