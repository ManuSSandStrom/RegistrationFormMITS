import { useEffect, useState } from "react";
import api from "../api";

export default function Admin() {
  const [list, setList] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, viewed: 0 });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const base = api.defaults.baseURL?.replace(/\/$/, "") || "";

  const load = async () => {
    const { data } = await api.get(`/api/admin/students?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`);
    const items = data.items || data.students || [];
    setList(items);
    if (data.counts) setCounts(data.counts);
  };

  useEffect(() => { load(); }, [page, status]);

  const open = async (id) => {
    const { data } = await api.get(`/api/admin/students/${id}`);
    setSelected(data);
  };

  const setApproval = async (s) => {
    if (!selected?._id && !selected?.id) return;
    setMsg(""); setBusy(true);
    let note = '';
    try {
      if (s === 'rejected') {
        note = window.prompt('Please provide a reason for rejection:') || '';
        if (!note.trim()) { alert('Rejection requires a note.'); setBusy(false); return; }
      }
      const id = selected._id || selected.id;
      const { data } = await api.patch(`/api/admin/students/${id}/approval`, { status: s, note });
      await open(id);
      setMsg(s === 'approved' ? 'Approved successfully.' : `Rejected: ${data?.approvalNote || note}`);
      load();
    } catch (e) {
      setMsg(e?.response?.data?.error || 'Action failed');
    } finally { setBusy(false); }
  };

  const Badge = ({ status }) => <span className={`badge ${status || "pending"}`}>{status || "pending"}</span>;

  const DocLink = ({ label, path }) => (
    <div style={{ marginTop: 8 }}>
      <strong>{label}: </strong>
      {path ? (
        <a href={`${base}${path}`} target="_blank" rel="noreferrer">Download</a>
      ) : (
        <span style={{ color: "#a1a1aa" }}>(not uploaded)</span>
      )}
    </div>
  );

  const Edu = ({ title, data }) => (
    <div className="card mt-16">
      <h4 style={{ marginTop: 0 }}>{title}</h4>
      <div className="grid2">
        <div><strong>Institute:</strong> {data?.institute || "-"}</div>
        <div><strong>Board/Univ:</strong> {data?.board || "-"}</div>
        <div><strong>Join Year:</strong> {data?.joinYear || data?.year || "-"}</div>
        <div><strong>Passed Out:</strong> {data?.passYear || "-"}</div>
        <div><strong>Percent/CGPA:</strong> {data?.score || "-"}</div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Admin — Students</h2>
        <div className="mt-8" style={{ display: "flex", gap: 12, flexWrap: "wrap", color: "#a1a1aa" }}>
          <span><strong>Pending:</strong> {counts.pending}</span>
          <span><strong>Approved:</strong> {counts.approved}</span>
          <span><strong>Rejected:</strong> {counts.rejected}</span>
          <span><strong>Viewed:</strong> {counts.viewed}</span>
        </div>
        <div className="grid2">
          <input className="input" placeholder="Search by name/email..." value={search} onChange={(e)=>setSearch(e.target.value)} />
          <div style={{display:'flex', gap:8}}>
            <select className="select" value={status} onChange={(e)=>{ setStatus(e.target.value); setPage(1); }}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="viewed">Viewed</option>
            </select>
            <button className="btn" onClick={()=>{ setPage(1); load(); }}>Search</button>
          </div>
        </div>
        <table className="table mt-16">
          <thead>
            <tr><th>Name</th><th>College Email</th><th>Course</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {list.map(s=> (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.course}</td>
                <td><Badge status={s.approvalStatus} /></td>
                <td><button className="btn secondary" onClick={()=>open(s._id)}>Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-16" style={{display:"flex", gap:8}}>
          <button className="btn secondary" onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
          <button className="btn" onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </div>

      {selected && (
        <div className="card mt-24">
          <h3 style={{marginTop:0}}>Review Student</h3>
          {msg && <div className="mt-8" style={{color: msg.startsWith('Approved') ? '#34d399' : '#fca5a5'}}>{msg}</div>}
          <div className="grid2">
            <div>
              <div><strong>Name:</strong> {selected.name}</div>
              <div><strong>Course:</strong> {selected.course}</div>
              <div><strong>College Email:</strong> {selected.email}</div>
              <div><strong>Personal Email:</strong> {selected.profile?.personalEmail || '-'}</div>
              <div><strong>Phone:</strong> {selected.profile?.phone || '-'}</div>
            </div>
            <div>
              <div><strong>Status:</strong> <Badge status={selected.profile?.approvalStatus || 'pending'} /></div>
              {selected.profile?.approvalNote && (
                <div><strong>Note:</strong> {selected.profile.approvalNote}</div>
              )}
              <div><strong>Address:</strong> {selected.profile?.address || '-'}</div>
              <div><strong>Date of Birth:</strong> {selected.profile?.dob || '-'}</div>
              <div><strong>Gender:</strong> {selected.profile?.gender || '-'}</div>
              <div><strong>Blood Group:</strong> {selected.profile?.bloodGroup || '-'}</div>
              <div><strong>Nationality:</strong> {selected.profile?.nationality || '-'}</div>
              <div><strong>Religion:</strong> {selected.profile?.religion || '-'}</div>
            </div>
          </div>

          <div className="mt-24">
            <h4>Schooling</h4>
            <Edu title="10th" data={selected.profile?.schooling?.tenth} />
            <Edu title="Intermediate" data={selected.profile?.schooling?.inter} />
            <Edu title="Degree" data={selected.profile?.schooling?.degree} />
          </div>

          <div className="mt-24">
            <h4>Documents</h4>
            <DocLink label="Aadhar" path={selected.profile?.documents?.aadhar} />
            <DocLink label="PAN" path={selected.profile?.documents?.pan} />
            <DocLink label="Caste" path={selected.profile?.documents?.caste} />
            <DocLink label="10th" path={selected.profile?.documents?.tenth} />
            <DocLink label="Inter" path={selected.profile?.documents?.inter} />
            <DocLink label="Degree" path={selected.profile?.documents?.degree} />
            <DocLink label="Income Certificate" path={selected.profile?.documents?.income} />
            {Array.isArray(selected.profile?.extraDocuments) && selected.profile.extraDocuments.length > 0 && (
              <div className="mt-16">
                <strong>Additional Files</strong>
                <ul>
                  {selected.profile.extraDocuments.map((d,i)=> (
                    <li key={i} className="mt-8">
                      <a href={`${base}${d.path}`} target="_blank" rel="noreferrer">{d.name || d.path}</a>
                      {d.size ? <span style={{marginLeft:8, color:'#a1a1aa'}}>({Math.round(d.size/1024)} KB)</span> : null}
                      {d.uploadedAt ? <span style={{marginLeft:8, color:'#a1a1aa'}}>{new Date(d.uploadedAt).toLocaleString()}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-24" style={{display:'flex', gap:8}}>
            <button className="btn success" onClick={()=>setApproval('approved')} disabled={busy}>Approve</button>
            <button className="btn danger" onClick={()=>setApproval('rejected')} disabled={busy}>Reject</button>
          </div>
        </div>
      )}
    </div>
  );
}
