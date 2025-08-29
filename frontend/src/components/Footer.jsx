export default function Footer() {
  return (
    <footer style={{borderTop: '1px solid #203047', background:'#0b1324'}}>
      <div className="container" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px', color:'#a1a1aa', fontSize:12}}>
        <div>
          © {new Date().getFullYear()} MITS — Admission Portal
        </div>
        <div style={{textAlign:'right'}}>
          Developed by Manohar (MCA), Nishar (MCA), Mounika (MCA) — Batch 2024–2026
        </div>
      </div>
    </footer>
  );
}