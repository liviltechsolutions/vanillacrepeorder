import { useState, useMemo, useRef, useEffect } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const HOURS=[];
for(let h=9;h<=19;h++){HOURS.push(`${String(h).padStart(2,"0")}:00`);if(h<19)HOURS.push(`${String(h).padStart(2,"0")}:30`);}
const DAY_NAMES=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS_EN=["January","February","March","April","May","June","July","August","September","October","November","December"];
const PAY_METHODS=["fpx","tng","grabpay","duitnow","card","cash","boost"];
const PAY_ICONS={fpx:"🏦",tng:"💚",grabpay:"🟢",duitnow:"🔵",card:"💳",cash:"💵",boost:"⚡"};
const PC={paid:{bg:"#f0fdf4",br:"#86efac",tx:"#15803d"},unpaid:{bg:"#fef2f2",br:"#fca5a5",tx:"#991b1b"},partial:{bg:"#fffbeb",br:"#fcd34d",tx:"#92400e"}};
const BC={confirmed:{bg:"#f0fdf4",br:"#86efac",tx:"#15803d"},pending:{bg:"#fffbeb",br:"#fcd34d",tx:"#92400e"},cancelled:{bg:"#fef2f2",br:"#fca5a5",tx:"#991b1b"},unassigned:{bg:"#fdf4ff",br:"#e9d5ff",tx:"#7e22ce"}};
const POSITIONS=["Junior Beautician","Senior Beautician","Lead Stylist","Nail Technician","Therapist","Manager","Freelancer"];
const SKILL_OPTIONS=["Haircut","Colouring","Treatment","Manicure","Pedicure","Facial","Threading","Massage","Makeup","Lash Extension"];
const SEATS=["Seat A1","Seat A2","Seat B1","Seat B2","Room 1","Room 2","Room 3","VIP Room"];
// Malaysia national public holidays — gazetted federal holidays
const MY_HOLIDAYS_2026={
  "2026-01-01":"New Year's Day",
  "2026-02-17":"Chinese New Year",
  "2026-02-18":"Chinese New Year Holiday",
  "2026-03-21":"Hari Raya Aidilfitri",
  "2026-03-22":"Hari Raya Aidilfitri Holiday",
  "2026-05-01":"Labour Day",
  "2026-05-27":"Hari Raya Haji",
  "2026-05-31":"Wesak Day",
  "2026-06-01":"Agong's Birthday",
  "2026-06-17":"Awal Muharram",
  "2026-08-25":"Maulidur Rasul",
  "2026-08-31":"National Day",
  "2026-09-16":"Malaysia Day",
  "2026-11-08":"Deepavali",
  "2026-12-25":"Christmas Day",
};
const MY_HOLIDAYS_2025={"2025-01-01":"New Year's Day","2025-01-29":"Chinese New Year","2025-01-30":"Chinese New Year Holiday","2025-03-31":"Hari Raya Aidilfitri","2025-04-01":"Hari Raya Aidilfitri Holiday","2025-05-01":"Labour Day","2025-05-12":"Wesak Day","2025-06-02":"Agong's Birthday","2025-06-06":"Hari Raya Haji","2025-06-27":"Awal Muharram","2025-08-31":"National Day","2025-09-05":"Maulidur Rasul","2025-09-16":"Malaysia Day","2025-10-20":"Deepavali","2025-12-25":"Christmas Day"};
const MY_HOLIDAYS_2027={"2027-01-01":"New Year's Day","2027-02-06":"Chinese New Year","2027-02-07":"Chinese New Year Holiday","2027-03-11":"Hari Raya Aidilfitri","2027-03-12":"Hari Raya Aidilfitri Holiday","2027-05-01":"Labour Day","2027-05-17":"Hari Raya Haji","2027-05-20":"Wesak Day","2027-06-07":"Agong's Birthday","2027-06-17":"Awal Muharram","2027-08-31":"National Day","2027-09-16":"Malaysia Day","2027-09-25":"Maulidur Rasul","2027-11-08":"Deepavali","2027-12-25":"Christmas Day"};
const MY_HOLIDAYS={...MY_HOLIDAYS_2025,...MY_HOLIDAYS_2026,...MY_HOLIDAYS_2027};
const getHoliday=date=>MY_HOLIDAYS[date];

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const TRANSLATIONS={
  en:{
    "nav.calendar":"Calendar","nav.bookings":"Bookings","nav.customers":"Customers","nav.staff":"Staff","nav.services":"Services","nav.analytics":"Analytics","nav.settings":"Settings",
    "settings.companyProfile":"Company Profile","settings.companyName":"Company Name","settings.location":"Location","settings.save":"Save",
    "settings.appearance":"Appearance","settings.light":"Light","settings.dark":"Dark",
    "settings.language":"Language",
    "settings.notifications":"Notifications","settings.notifyOnPending":"Notify me about pending bookings",
    "settings.updatePassword":"Update Password","settings.currentPassword":"Current Password","settings.newPassword":"New Password","settings.confirmPassword":"Confirm New Password","settings.changePassword":"Change Password",
    "settings.exportReport":"Export Report","settings.exportWeekly":"Export Weekly","settings.exportMonthly":"Export Monthly","settings.exportYearly":"Export Yearly",
    "settings.notifyTiming":"Notify me how early before appointment","settings.contactPhone":"Contact Phone","settings.address":"Address","settings.personInCharge":"Person In Charge","settings.socialMedia":"Social Media","settings.account":"Account & Email","settings.registerEmail":"Register Email","settings.emailPlaceholder":"your@email.com","settings.verifyPending":"Verification email sent — click the link to verify","settings.verified":"Email verified","settings.reschedule":"Reschedule",
  },
  zh:{
    "nav.calendar":"日历","nav.bookings":"预约","nav.customers":"客户","nav.staff":"员工","nav.services":"服务项目","nav.analytics":"数据分析","nav.settings":"设置",
    "settings.companyProfile":"公司资料","settings.companyName":"公司名称","settings.location":"地点","settings.save":"保存",
    "settings.appearance":"外观","settings.light":"浅色","settings.dark":"深色",
    "settings.language":"语言",
    "settings.notifications":"通知","settings.notifyOnPending":"有待确认预约时通知我",
    "settings.updatePassword":"修改密码","settings.currentPassword":"当前密码","settings.newPassword":"新密码","settings.confirmPassword":"确认新密码","settings.changePassword":"修改密码",
    "settings.exportReport":"导出报表","settings.exportWeekly":"导出本周","settings.exportMonthly":"导出本月","settings.exportYearly":"导出本年",
    "settings.notifyTiming":"提前多久通知我","settings.contactPhone":"联系电话","settings.address":"地址","settings.personInCharge":"负责人","settings.socialMedia":"社交媒体","settings.account":"账号与电邮","settings.registerEmail":"注册电邮","settings.emailPlaceholder":"your@email.com","settings.verifyPending":"验证邮件已发送，请点击链接验证","settings.verified":"电邮已验证","settings.reschedule":"重新安排",
  },
  ms:{
    "nav.calendar":"Kalendar","nav.bookings":"Tempahan","nav.customers":"Pelanggan","nav.staff":"Kakitangan","nav.services":"Perkhidmatan","nav.analytics":"Analitik","nav.settings":"Tetapan",
    "settings.companyProfile":"Profil Syarikat","settings.companyName":"Nama Syarikat","settings.location":"Lokasi","settings.save":"Simpan",
    "settings.appearance":"Penampilan","settings.light":"Terang","settings.dark":"Gelap",
    "settings.language":"Bahasa",
    "settings.notifications":"Pemberitahuan","settings.notifyOnPending":"Maklumkan saya tentang tempahan tertangguh",
    "settings.updatePassword":"Kemas Kini Kata Laluan","settings.currentPassword":"Kata Laluan Semasa","settings.newPassword":"Kata Laluan Baharu","settings.confirmPassword":"Sahkan Kata Laluan Baharu","settings.changePassword":"Tukar Kata Laluan",
    "settings.exportReport":"Eksport Laporan","settings.exportWeekly":"Eksport Mingguan","settings.exportMonthly":"Eksport Bulanan","settings.exportYearly":"Eksport Tahunan",
    "settings.notifyTiming":"Beritahu saya berapa awal","settings.contactPhone":"No. Telefon","settings.address":"Alamat","settings.personInCharge":"Orang Bertanggungjawab","settings.socialMedia":"Media Sosial","settings.account":"Akaun & E-mel","settings.registerEmail":"Daftar E-mel","settings.emailPlaceholder":"your@email.com","settings.verifyPending":"E-mel pengesahan dihantar","settings.verified":"E-mel disahkan","settings.reschedule":"Jadual Semula",
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtD=ds=>new Date(ds+"T00:00:00").toLocaleDateString("en-MY",{day:"numeric",month:"short"});
const fmtDFull=ds=>new Date(ds+"T00:00:00").toLocaleDateString("en-MY",{weekday:"short",day:"numeric",month:"short"});
const timeToMin=t=>{const[h,m]=t.split(":").map(Number);return h*60+m;};
const nowStr=()=>new Date().toLocaleString("en-MY",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
const getDIM=(y,m)=>new Date(y,m+1,0).getDate();
const getFD=(y,m)=>new Date(y,m,1).getDay();
const _td=new Date();const TODAY=`${_td.getFullYear()}-${String(_td.getMonth()+1).padStart(2,"0")}-${String(_td.getDate()).padStart(2,"0")}`;
function getWkDates(base){const d=new Date(base);const dy=d.getDay();const out=[];for(let i=0;i<7;i++){const n=new Date(d);n.setDate(d.getDate()-dy+i);const nd=new Date(n);out.push(`${nd.getFullYear()}-${String(nd.getMonth()+1).padStart(2,"0")}-${String(nd.getDate()).padStart(2,"0")}`);}return out;}
function dateRange(from,to){const out=[];const cur=new Date(from+"T00:00:00");const end=new Date(to+"T00:00:00");while(cur<=end){out.push(cur.toISOString().split("T")[0]);cur.setDate(cur.getDate()+1);}return out;}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const card=(e={})=>({background:"var(--surface)",borderRadius:"var(--radius-lg,16px)",border:"1px solid var(--border)",boxShadow:"var(--shadow-sm)",...e});
const pBtn=(e={})=>({background:"linear-gradient(135deg,#0d9488,#10b981)",color:"#fff",border:"none",borderRadius:"var(--radius,12px)",padding:"10px 20px",cursor:"pointer",fontSize:14,fontWeight:600,letterSpacing:"-0.01em",...e});
const gBtn=(e={})=>({border:"1px solid var(--border)",background:"var(--surface)",borderRadius:"var(--radius,12px)",padding:"8px 16px",cursor:"pointer",fontSize:13,color:"#7c3aed",fontWeight:600,...e});
const inp={width:"100%",padding:"10px 13px",border:"1px solid var(--border)",borderRadius:"var(--radius,12px)",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"var(--input-bg)",color:"var(--text)"};
const lbl={fontSize:12,fontWeight:600,color:"var(--text-muted)",display:"block",marginBottom:5,letterSpacing:"0.02em",textTransform:"uppercase"};
const sectionLbl={fontSize:11,fontWeight:700,color:"var(--text-muted)",letterSpacing:"0.08em",textTransform:"uppercase"};
const statCard=(accent,e={})=>({background:"var(--surface)",borderRadius:"var(--radius-lg,16px)",border:"1px solid var(--border)",borderLeft:`4px solid ${accent}`,boxShadow:"var(--shadow-sm)",padding:"18px 20px",...e});
const Icon=({path,size=18,color="currentColor",strokeWidth=2})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">{path}</svg>;
const ICONS={
  calendar:<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  list:<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  user:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  users:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  scissors:<><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></>,
  chart:<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  check:<polyline points="20 6 9 17 4 12"/>,
  x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  phone:<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>,
  message:<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
  edit:<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  clock:<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  alert:<><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  bell:<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  money:<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  search:<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  chevLeft:<polyline points="15 18 9 12 15 6"/>,
  chevRight:<polyline points="9 18 15 12 9 6"/>,
  lock:<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
  settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
};

// ─── ADD BOOKING MODAL ───────────────────────────────────────────────────────
function AddModal({show,onClose,onAdd,initialDate,initialTime,leaveRecords,staffList,services}){
  const [f,setF]=useState({customer:"",phone:"",service:1,staff:1,date:initialDate||TODAY,time:initialTime||"09:00",remark:"",payStatus:"unpaid",payMethod:"",amtPaid:0,tip:0,txnId:"",seat:""});
  const [staffWarning,setStaffWarning]=useState(null);
  useMemo(()=>{if(show)setF(p=>({...p,date:initialDate||TODAY,time:initialTime||"09:00"}));},[show,initialDate,initialTime]);
  useEffect(()=>{if(show)setStaffWarning(null);},[show]);
  const isOL=(sid)=>leaveRecords.some(r=>r.dates.includes(f.date)&&r.staffId===sid);
  const avail=staffList.filter(s=>!isOL(s.id));
  useEffect(()=>{
    if(!show||!f.staff)return;
    if(!avail.some(s=>s.id===f.staff)){
      const offStaff=staffList.find(s=>s.id===f.staff);
      setF(p=>({...p,staff:avail[0]?.id||0}));
      if(offStaff)setStaffWarning(`${offStaff.name} is off on ${fmtD(f.date)}. Please choose another staff.`);
    }
  },[f.date,f.staff,avail,staffList,show]);
  if(!show) return null;
  const up=(k,v)=>{setF(p=>({...p,[k]:v}));if(k==="staff")setStaffWarning(null);};
  const price=services.find(s=>s.id===f.service)?.price||0;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:16,padding:20,width:460,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:15,color:"var(--text)"}}>➕ Add Booking</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"var(--text-muted)",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Customer Name</label><input value={f.customer} onChange={e=>up("customer",e.target.value)} placeholder="e.g. Sarah Lim" style={inp}/></div>
            <div><label style={lbl}>Phone</label><input value={f.phone} onChange={e=>up("phone",e.target.value)} placeholder="012-3456789" style={inp}/></div>
          </div>
          <div><label style={lbl}>Service</label>
            <select value={f.service} onChange={e=>up("service",Number(e.target.value))} style={inp}>
              {services.map(s=><option key={s.id} value={s.id}>{s.name} — RM{s.price} ({s.duration}min)</option>)}
            </select>
          </div>
          {staffWarning&&<div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 11px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:9,fontSize:12,color:"#991b1b",fontWeight:600}}><Icon path={ICONS.alert} size={15} color="#991b1b"/>{staffWarning}</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Staff</label>
              {avail.length===0
                ?<div style={{...inp,background:"#fef2f2",color:"#991b1b",fontSize:12}}>⚠️ All staff on leave</div>
                :<select value={f.staff} onChange={e=>up("staff",Number(e.target.value))} style={inp}>
                  {avail.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              }
            </div>
            <div><label style={lbl}>Seat / Room</label>
              <select value={f.seat} onChange={e=>up("seat",e.target.value)} style={inp}>
                <option value="">— Not assigned —</option>
                {SEATS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Date</label><input type="date" value={f.date} onChange={e=>up("date",e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Time</label><select value={f.time} onChange={e=>up("time",e.target.value)} style={inp}>{HOURS.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
          </div>
          <div><label style={lbl}>💬 Special Request / Remark</label><input value={f.remark} onChange={e=>up("remark",e.target.value)} placeholder="e.g. no heat, prefer gentle products" style={inp}/></div>
          <div style={{background:"var(--bg)",borderRadius:9,padding:"11px 13px"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#7e22ce",marginBottom:8}}>💳 Payment</div>
            <div style={{display:"flex",gap:5,marginBottom:8}}>
              {["paid","unpaid","partial"].map(ps=>{const pc=PC[ps];const sel=f.payStatus===ps;return(
                <button key={ps} onClick={()=>up("payStatus",ps)} style={{flex:1,padding:"6px 2px",borderRadius:6,border:sel?`2px solid ${pc.br}`:"1px solid var(--border)",background:sel?pc.bg:"#fff",color:sel?pc.tx:"#9090b0",fontWeight:sel?700:400,fontSize:10,cursor:"pointer"}}>{ps==="paid"?"Paid ✓":ps==="unpaid"?"Unpaid":"Partial"}</button>
              );})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:7}}>
              <div><label style={lbl}>Method</label>
                <select value={f.payMethod} onChange={e=>up("payMethod",e.target.value)} style={inp}>
                  <option value="">Select...</option>
                  {PAY_METHODS.map(k=><option key={k} value={k}>{PAY_ICONS[k]} {k.toUpperCase()}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Amount Paid (RM)</label>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"var(--text-muted)",fontWeight:600,pointerEvents:"none"}}>RM</span>
                  <input type="number" min={0} max={price} value={f.amtPaid} onChange={e=>up("amtPaid",e.target.value===""?"":Number(e.target.value))} style={{...inp,paddingLeft:40}}/>
                </div>
              </div>
            </div>
            <div style={{marginBottom:7}}>
              <label style={lbl}>Additional Payment (RM) — tips, etc.</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"var(--text-muted)",fontWeight:600,pointerEvents:"none"}}>RM</span>
                <input type="number" min={0} value={f.tip} onChange={e=>up("tip",e.target.value===""?"":Number(e.target.value))} placeholder="0" style={{...inp,paddingLeft:40}}/>
              </div>
            </div>
            {price>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 9px",background:"var(--surface)",borderRadius:6,border:"1px solid var(--border)",fontSize:11,marginBottom:7}}>
              <span>Total: <strong>RM {price}</strong>{Number(f.tip)>0&&<span style={{color:"#7e22ce"}}> + RM{Number(f.tip)} tip</span>}</span>
              <span style={{color:(Number(f.amtPaid)||0)>=price?"#15803d":"#991b1b",fontWeight:600}}>Balance: RM {Math.max(0,price-(Number(f.amtPaid)||0))}</span>
            </div>}
            <div><label style={lbl}>Transaction No.</label><input value={f.txnId} onChange={e=>up("txnId",e.target.value)} placeholder="TXN..." style={inp}/></div>
          </div>
          <button onClick={()=>{if(!f.customer||!f.phone)return;onAdd({...f,amtPaid:Number(f.amtPaid)||0,tip:Number(f.tip)||0});}} style={pBtn({padding:"11px 0",fontSize:13,width:"100%",marginTop:2})}>Add Booking</button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL / EDIT MODAL ─────────────────────────────────────────────────────
function DetailModal({booking,onClose,onAccept,onCancel,onSave,onReschedule,leaveRecords,staffList,services,autoEdit}){
  const [edit,setEdit]=useState(false);
  const [draft,setDraft]=useState(null);
  const [reschedMode,setReschedMode]=useState(false);
  const [reschedDraft,setReschedDraft]=useState({date:"",time:""});
  if(!booking) return null;
  const b=booking;
  const sc=BC[b.status]||BC.confirmed;
  const pc=PC[b.payStatus]||PC.unpaid;
  const sv=services.find(s=>s.id===b.service);
  const st=staffList.find(s=>s.id===b.staff);
  const price=sv?.price||0;
  const balance=Math.max(0,price-(b.amtPaid||0));
  const isOL=(sid,date)=>leaveRecords.some(r=>r.dates.includes(date)&&r.staffId===sid);
  const avail=draft?staffList.filter(s=>!isOL(s.id,draft.date)||s.id===b.staff):staffList;
  const nowDraft=draft||{};
  const dPrice=services.find(s=>s.id===nowDraft.service)?.price||0;
  const dBal=Math.max(0,dPrice-(nowDraft.amtPaid||0));

  const openEdit=()=>{setDraft({date:b.date,time:b.time,service:b.service,staff:b.staff,remark:b.remark||"",payStatus:b.payStatus,payMethod:b.payMethod||"",amtPaid:b.amtPaid||0,tip:b.tip||0,txnId:b.txnId||"",seat:b.seat||""});setEdit(true);};
  const saveEdit=()=>{onSave(b,{...draft,amtPaid:Number(draft.amtPaid)||0,tip:Number(draft.tip)||0});setEdit(false);};
  // If triggered from notification, open edit mode immediately
  if(autoEdit&&!edit&&!draft&&b.status!=="cancelled"){openEdit();}

  return(
    <div onClick={()=>{onClose();setEdit(false);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:16,width:460,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{padding:"16px 20px 12px",borderBottom:"1px solid #f0ebff",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"var(--surface)",zIndex:1,borderRadius:"16px 16px 0 0"}}>
          <div><div style={{fontWeight:700,fontSize:18,color:"var(--text)"}}>Booking Details</div><div style={{fontSize:11,color:"var(--text-muted)"}}>#{String(b.id).padStart(5,"0")}</div></div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {!edit&&b.status!=="cancelled"&&!reschedMode&&<button onClick={()=>{setReschedDraft({date:b.date,time:b.time});setReschedMode(true);}} style={gBtn({fontSize:12,padding:"6px 11px",display:"flex",alignItems:"center",gap:5})}>📅 Reschedule</button>}
            {!edit&&b.status!=="cancelled"&&!reschedMode&&<button onClick={openEdit} style={gBtn({fontSize:12,padding:"6px 11px",display:"flex",alignItems:"center",gap:5})}><Icon path={ICONS.edit} size={13}/>Edit</button>}
            <button onClick={()=>{onClose();setEdit(false);}} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"var(--text-muted)",padding:"0 4px"}}>×</button>
          </div>
        </div>
        <div style={{padding:"16px 20px"}}>
          {/* Customer pill */}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"var(--bg)",borderRadius:12,marginBottom:14}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:"linear-gradient(135deg,#9333ea,#c084fc)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:17,flexShrink:0}}>{b.customer[0]}</div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:16,color:"var(--text)"}}>{b.customer}</div><div style={{fontSize:12,color:"var(--text-muted)"}}>{b.phone}</div></div>
            <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:sc.bg,color:sc.tx,border:`1px solid ${sc.br}`}}>{b.status}</span>
          </div>
          {/* Pay banner */}
          <div style={{padding:"12px 14px",background:pc.bg,border:`1px solid ${pc.br}`,borderRadius:12,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
              <span style={{fontSize:18}}>{b.payStatus==="paid"?"✅":b.payStatus==="partial"?"⚠️":"❌"}</span>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:pc.tx}}>{b.payStatus==="paid"?"Payment Successful":"Payment Pending"} — {b.payStatus}</div>{b.payMethod&&<div style={{fontSize:12,color:pc.tx,opacity:.8}}>{PAY_ICONS[b.payMethod]} {b.payMethod.toUpperCase()}</div>}{b.txnId&&<div style={{fontSize:11,color:pc.tx,opacity:.7,fontFamily:"monospace"}}>{b.txnId}</div>}</div>
              <div style={{fontWeight:700,fontSize:16,color:pc.tx}}>RM {price}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
              <div style={{background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"7px 10px"}}><div style={{fontSize:10,color:pc.tx,opacity:.7}}>Amount Paid</div><div style={{fontSize:16,fontWeight:700,color:"#15803d"}}>RM {b.amtPaid||0}</div></div>
              <div style={{background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"7px 10px"}}><div style={{fontSize:10,color:pc.tx,opacity:.7}}>{balance===0?"Fully Paid":"Remaining Balance"}</div><div style={{fontSize:16,fontWeight:700,color:balance===0?"#15803d":"#991b1b"}}>{balance===0?"✓ Paid":`RM ${balance}`}</div></div>
            </div>
            {b.tip>0&&<div style={{marginTop:7,background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"7px 10px"}}><div style={{fontSize:10,color:pc.tx,opacity:.7}}>Additional Payment (tips)</div><div style={{fontSize:16,fontWeight:700,color:"#7e22ce"}}>RM {b.tip}</div></div>}
          </div>

          {/* Reschedule inline form */}
          {reschedMode&&<div style={{marginBottom:14,padding:"14px 16px",background:"#f3e8ff",borderRadius:12,border:"1px solid #c4b5fd"}}>
            <div style={{fontWeight:700,fontSize:13,color:"#6d28d9",marginBottom:10}}>📅 Reschedule Appointment</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div><label style={lbl}>New Date</label><input type="date" value={reschedDraft.date} onChange={e=>setReschedDraft(p=>({...p,date:e.target.value}))} style={inp}/></div>
              <div><label style={lbl}>New Time</label><select value={reschedDraft.time} onChange={e=>setReschedDraft(p=>({...p,time:e.target.value}))} style={inp}>{HOURS.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
            </div>
            <div style={{fontSize:11,color:"#7e22ce",marginBottom:8}}>Currently: {fmtD(b.date)}, {b.time}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{onReschedule(b,reschedDraft);setReschedMode(false);}} style={pBtn({flex:1,fontSize:12,padding:"9px 0"})}>Confirm Reschedule</button>
              <button onClick={()=>setReschedMode(false)} style={gBtn({flex:1,fontSize:12,padding:"9px 0"})}>Cancel</button>
            </div>
          </div>}

          {!edit&&<>
            {[[sv?.name,"Service","✂️"],[`${sv?.duration} min`,"Duration","⏱️"],[`${fmtD(b.date)}, ${b.time}`,"Date & Time","📅"],[st?.name||"—","Staff","👩"],[b.seat||"—","Seat / Room","🪑"],[b.payMethod?`${PAY_ICONS[b.payMethod]} ${b.payMethod.toUpperCase()}`:"-","Payment Method","💳"],[b.txnId||"—","Transaction No.","🔖"]].map(([v,l,ic])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:"1px solid #f5f3ff"}}>
                <span style={{fontSize:14,width:20,textAlign:"center",flexShrink:0}}>{ic}</span>
                <span style={{fontSize:12,color:"var(--text-muted)",width:110,flexShrink:0}}>{l}</span>
                <span style={{fontSize:14,fontWeight:500,color:"var(--text)",fontFamily:l==="Transaction No."?"monospace":"inherit"}}>{v}</span>
              </div>
            ))}
            {b.remark&&<div style={{marginTop:10,padding:"9px 11px",background:"#f3e8ff",borderRadius:9,fontSize:13,color:"#7e22ce"}}>💬 <strong>Remark:</strong> {b.remark}</div>}
            {b.note&&<div style={{marginTop:6,padding:"8px 11px",background:"#fffbeb",borderRadius:9,fontSize:13,color:"#92400e"}}>📝 {b.note}</div>}
            {b.status==="unassigned"&&<div style={{marginTop:9,padding:"9px 12px",background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:9,fontSize:13,color:"#7e22ce",fontWeight:600}}>⚠️ Staff on leave — please reassign</div>}
            {/* Call / WhatsApp */}
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <a href={`tel:${b.phone}`} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 0",borderRadius:9,background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",textDecoration:"none",fontSize:13,fontWeight:600}}>📞 Call</a>
              <a href={`https://wa.me/6${b.phone.replace(/-/g,"")}`} target="_blank" rel="noreferrer" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 0",borderRadius:9,background:"#f0fdf4",border:"1px solid #86efac",color:"#15803d",textDecoration:"none",fontSize:13,fontWeight:600}}>💬 WhatsApp</a>
            </div>
            {b.status==="pending"&&<div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>onAccept(b.id)} style={pBtn({flex:1,background:"linear-gradient(135deg,#16a34a,#22c55e)",padding:"10px 0",fontSize:13})}>✓ Confirm</button><button onClick={()=>onCancel(b.id)} style={{flex:1,background:"#fef2f2",border:"1px solid #fca5a5",color:"#991b1b",borderRadius:9,padding:"10px 0",cursor:"pointer",fontWeight:700,fontSize:13}}>✕ Cancel</button></div>}
            {(b.status==="confirmed"||b.status==="unassigned")&&<button onClick={()=>onCancel(b.id)} style={{width:"100%",marginTop:10,background:"#fef2f2",border:"1px solid #fca5a5",color:"#991b1b",borderRadius:9,padding:"9px 0",cursor:"pointer",fontWeight:600,fontSize:12}}>Cancel Booking</button>}
          </>}

          {edit&&draft&&<div style={{display:"flex",flexDirection:"column",gap:9}}>
            <div style={{fontWeight:600,fontSize:10,color:"#7e22ce",padding:"5px 9px",background:"#f3e8ff",borderRadius:6}}>✏️ Edit Booking</div>
            <div style={{background:"var(--bg)",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#7e22ce",marginBottom:6}}>📅 Reschedule</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                <div><label style={lbl}>Date</label><input type="date" value={draft.date} onChange={e=>setDraft(p=>({...p,date:e.target.value}))} style={inp}/></div>
                <div><label style={lbl}>Time</label><select value={draft.time} onChange={e=>setDraft(p=>({...p,time:e.target.value}))} style={inp}>{HOURS.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
              </div>
            </div>
            <div style={{background:"var(--bg)",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#7e22ce",marginBottom:6}}>✂️ Service & Staff</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                <div><label style={lbl}>Service</label><select value={draft.service} onChange={e=>setDraft(p=>({...p,service:Number(e.target.value)}))} style={inp}>{services.map(s=><option key={s.id} value={s.id}>{s.name} — RM{s.price}</option>)}</select></div>
                <div><label style={lbl}>Staff</label><select value={draft.staff} onChange={e=>setDraft(p=>({...p,staff:Number(e.target.value)}))} style={inp}>{avail.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                <div><label style={lbl}>🪑 Seat / Room</label><select value={draft.seat||""} onChange={e=>setDraft(p=>({...p,seat:e.target.value}))} style={inp}><option value="">— Not assigned —</option>{SEATS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              </div>
            </div>
            <div><label style={lbl}>💬 Remark</label><input value={draft.remark} onChange={e=>setDraft(p=>({...p,remark:e.target.value}))} placeholder="Special request..." style={inp}/></div>
            <div style={{background:"var(--bg)",borderRadius:8,padding:"9px 11px"}}>
              <div style={{fontSize:9,fontWeight:700,color:"#7e22ce",marginBottom:6}}>💳 Payment</div>
              <div style={{display:"flex",gap:4,marginBottom:7}}>{["paid","unpaid","partial"].map(ps=>{const pc2=PC[ps];const sel=draft.payStatus===ps;return <button key={ps} onClick={()=>setDraft(p=>({...p,payStatus:ps}))} style={{flex:1,padding:"5px 2px",borderRadius:5,border:sel?`2px solid ${pc2.br}`:"1px solid var(--border)",background:sel?pc2.bg:"#fff",color:sel?pc2.tx:"#9090b0",fontWeight:sel?700:400,fontSize:9,cursor:"pointer"}}>{ps}</button>;})}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:6}}>
                <div><label style={lbl}>Method</label><select value={draft.payMethod} onChange={e=>setDraft(p=>({...p,payMethod:e.target.value}))} style={inp}><option value="">Select...</option>{PAY_METHODS.map(k=><option key={k} value={k}>{PAY_ICONS[k]} {k}</option>)}</select></div>
                <div><label style={lbl}>Amt Paid (RM)</label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"var(--text-muted)",fontWeight:600,pointerEvents:"none"}}>RM</span>
                    <input type="number" min={0} value={draft.amtPaid} onChange={e=>setDraft(p=>({...p,amtPaid:e.target.value===""?"":Number(e.target.value)}))} style={{...inp,paddingLeft:38}}/>
                  </div>
                </div>
              </div>
              <div style={{marginBottom:6}}>
                <label style={lbl}>Additional Payment (RM) — tips, etc.</label>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"var(--text-muted)",fontWeight:600,pointerEvents:"none"}}>RM</span>
                  <input type="number" min={0} value={draft.tip} onChange={e=>setDraft(p=>({...p,tip:e.target.value===""?"":Number(e.target.value)}))} placeholder="0" style={{...inp,paddingLeft:38}}/>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",padding:"5px 8px",background:"var(--surface)",borderRadius:5,border:"1px solid var(--border)",fontSize:11,marginBottom:6}}>
                <span>Total: <strong>RM {dPrice}</strong>{Number(draft.tip)>0&&<span style={{color:"#7e22ce"}}> + RM{Number(draft.tip)} tip</span>}</span>
                <span style={{color:dBal===0?"#15803d":"#991b1b",fontWeight:600}}>Balance: RM {dBal}</span>
              </div>
              <div><label style={lbl}>TXN No.</label><input value={draft.txnId} onChange={e=>setDraft(p=>({...p,txnId:e.target.value}))} placeholder="TXN..." style={inp}/></div>
            </div>
            <div style={{display:"flex",gap:6}}><button onClick={saveEdit} style={pBtn({flex:1,padding:"9px 0",fontSize:11})}>Save Changes</button><button onClick={()=>setEdit(false)} style={gBtn({flex:1,padding:"9px 0",fontSize:11})}>Cancel</button></div>
          </div>}

          {!edit&&b.history?.length>0&&<div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #f0ebff"}}><div style={{fontSize:11,fontWeight:700,color:"#7e22ce",marginBottom:6}}>🕓 Change History</div>{b.history.map((h,i)=>{const isRs=h.field==="Rescheduled";return(<div key={i} style={{fontSize:11,color:"#64648a",padding:"4px 6px",borderBottom:"1px solid #f8f6ff",borderRadius:4,background:isRs?"#f3e8ff":"transparent"}}>
            {isRs&&<span style={{fontSize:10,fontWeight:700,color:"#7e22ce",marginRight:5}}>📅 RESCHEDULED</span>}<strong>{h.field}</strong>: <span style={{color:"#ef4444"}}>{h.from}</span> → <span style={{color:"#16a34a"}}>{h.to}</span> <span style={{color:"#b0b0c8"}}>@ {h.at}</span>
          </div>);})}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── LEAVE MODAL ─────────────────────────────────────────────────────────────
function LeaveModal({staffMember,bookings,staffList,services,onClose,onConfirm}){
  const [lt,setLt]=useState("mc");
  const [from,setFrom]=useState(TODAY);
  const [to,setTo]=useState(TODAY);
  const [reason,setReason]=useState("");
  const [reassign,setReassign]=useState(0);
  if(!staffMember) return null;
  const dates=dateRange(from,to);
  const affected=bookings.filter(b=>b.staff===staffMember.id&&dates.includes(b.date)&&b.status!=="cancelled");
  const others=staffList.filter(s=>s.id!==staffMember.id);
  const ltLabels={mc:"Medical Leave 🏥",al:"Annual Leave 🌴",absent:"Absent ⚠️"};
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:16,padding:20,width:430,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>Mark Leave — {staffMember.name}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"var(--text-muted)",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={lbl}>Leave Type</label>
            <div style={{display:"flex",gap:5}}>{Object.entries(ltLabels).map(([k,v])=><button key={k} onClick={()=>setLt(k)} style={{flex:1,padding:"7px 3px",borderRadius:7,border:lt===k?"2px solid #9333ea":"1px solid var(--border)",background:lt===k?"#f3e8ff":"#fff",color:lt===k?"#7e22ce":"#9090b0",fontWeight:lt===k?700:400,fontSize:9,cursor:"pointer"}}>{v}</button>)}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>From Date</label><input type="date" value={from} onChange={e=>{setFrom(e.target.value);if(e.target.value>to)setTo(e.target.value);}} style={inp}/></div>
            <div><label style={lbl}>To Date</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} min={from} style={inp}/></div>
          </div>
          {dates.length>1&&<div style={{padding:"5px 9px",background:"#f3e8ff",borderRadius:6,fontSize:10,color:"#7e22ce",fontWeight:500}}>{dates.length} days: {fmtD(from)} – {fmtD(to)}</div>}
          <div><label style={lbl}>Reason / Remark</label><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. hospitalised, personal matter" style={inp}/></div>
          {affected.length>0?(
            <div style={{background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:9,padding:"10px 12px"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#7e22ce",marginBottom:7}}>⚠️ {affected.length} Affected Booking(s)</div>
              <div style={{maxHeight:110,overflowY:"auto",marginBottom:8}}>
                {affected.map(b=>{const sv=services.find(s=>s.id===b.service);return<div key={b.id} style={{fontSize:9,color:"var(--text-muted)",padding:"2px 0",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between"}}><span>{fmtD(b.date)} {b.time} — {b.customer}</span><span style={{color:"var(--text-muted)"}}>{sv?.name}</span></div>;})}
              </div>
              <div><label style={lbl}>Reassign all to</label>
                <select value={reassign} onChange={e=>setReassign(Number(e.target.value))} style={inp}>
                  <option value={0}>— Mark as Unassigned —</option>
                  {others.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          ):<div style={{padding:"8px 11px",background:"#f0fdf4",borderRadius:7,fontSize:10,color:"#15803d"}}>✓ No bookings during this leave period.</div>}
          <div style={{display:"flex",gap:7,marginTop:2}}>
            <button onClick={()=>onConfirm(staffMember.id,dates,lt,reason,affected,reassign)} style={pBtn({flex:1,padding:"9px 0",fontSize:11})}>Confirm Leave</button>
            <button onClick={onClose} style={gBtn({flex:1,padding:"9px 0",fontSize:11})}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCHEDULE MODAL ──────────────────────────────────────────────────────────
function ScheduleModal({staffMember,schedule,onClose,onSave}){
  const defSched={0:{s:"09:00",e:"17:00",off:true},1:{s:"09:00",e:"19:00",off:false},2:{s:"09:00",e:"19:00",off:false},3:{s:"09:00",e:"19:00",off:false},4:{s:"09:00",e:"19:00",off:false},5:{s:"09:00",e:"19:00",off:false},6:{s:"09:00",e:"17:00",off:false}};
  const [sc,setSc]=useState(schedule||defSched);
  if(!staffMember) return null;
  const up=(d,f,v)=>setSc(p=>({...p,[d]:{...p[d],[f]:v}}));
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:16,padding:20,width:400,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>Edit Schedule — {staffMember.name}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"var(--text-muted)",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {[0,1,2,3,4,5,6].map(d=>{const row=sc[d]||{s:"09:00",e:"19:00",off:false};return(
            <div key={d} style={{display:"grid",gridTemplateColumns:"44px 1fr 1fr 58px",gap:6,alignItems:"center",padding:"7px 9px",background:row.off?"#f8f8f8":"var(--bg)",borderRadius:7,border:"1px solid var(--border)"}}>
              <div style={{fontSize:11,fontWeight:600,color:row.off?"#b0b0c8":"#1a1a2e"}}>{DAY_NAMES[d]}</div>
              {row.off?<div style={{gridColumn:"2/4",fontSize:10,color:"#b0b0c8",fontStyle:"italic"}}>Day Off</div>:<>
                <div><select value={row.s} onChange={e=>up(d,"s",e.target.value)} style={{...inp,padding:"4px 6px",fontSize:10}}>{HOURS.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
                <div><select value={row.e} onChange={e=>up(d,"e",e.target.value)} style={{...inp,padding:"4px 6px",fontSize:10}}>{HOURS.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
              </>}
              <button onClick={()=>up(d,"off",!row.off)} style={{padding:"4px 5px",borderRadius:5,border:`1px solid ${row.off?"#86efac":"#fca5a5"}`,background:row.off?"#f0fdf4":"#fef2f2",color:row.off?"#15803d":"#991b1b",cursor:"pointer",fontSize:9,fontWeight:600}}>{row.off?"✓ Work":"✕ Off"}</button>
            </div>
          );})}
        </div>
        <div style={{display:"flex",gap:7,marginTop:12}}>
          <button onClick={()=>onSave(staffMember.id,sc)} style={pBtn({flex:1,padding:"9px 0",fontSize:11})}>Save Schedule</button>
          <button onClick={onClose} style={gBtn({flex:1,padding:"9px 0",fontSize:11})}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── MARK MERCHANT CLOSED MODAL ──────────────────────────────────────────────
function CloseDayModal({show,onClose,initialDate,closedDates,closedWeekdays,onMark,onUnmark,onMarkWeekday,onUnmarkWeekday}){
  const [mode,setMode]=useState("date");
  const [date,setDate]=useState(initialDate);
  const [reason,setReason]=useState("");
  const [wdReason,setWdReason]=useState("");
  useEffect(()=>{if(show)setDate(initialDate);},[show,initialDate]);
  if(!show) return null;
  const upcoming=closedDates.filter(c=>c.date>=TODAY).sort((a,b)=>a.date.localeCompare(b.date));
  const isWdClosed=d=>closedWeekdays.find(c=>c.weekday===d);
  const toggleWeekday=d=>{const existing=isWdClosed(d);if(existing)onUnmarkWeekday(d);else onMarkWeekday(d,wdReason);};
  const selectGroup=days=>days.forEach(d=>{if(!isWdClosed(d))onMarkWeekday(d,wdReason);});
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:16,padding:20,width:440,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:16,color:"var(--text)"}}>Mark Merchant Closed</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"var(--text-muted)",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",gap:2,background:"#f3e8ff",borderRadius:9,padding:3,marginBottom:14}}>
          {[["date","Specific Date"],["weekday","Recurring Weekday"]].map(([k,l])=>(
            <button key={k} onClick={()=>setMode(k)} style={{flex:1,padding:"7px 9px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:mode===k?"#6d28d9":"transparent",color:mode===k?"#fff":"#7e22ce"}}>{l}</button>
          ))}
        </div>
        {mode==="date"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={lbl}>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Reason</label><input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. renovation, public holiday closure" style={inp}/></div>
          <button onClick={()=>{onMark(date,reason);setReason("");}} style={pBtn({padding:"10px 0",fontSize:13})}>Mark Closed</button>
          {upcoming.length>0&&<div style={{marginTop:6}}>
            <div style={{...sectionLbl,marginBottom:7}}>Upcoming Closed Dates</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {upcoming.map(c=>(
                <div key={c.date} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:9}}>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:"#991b1b"}}>{fmtDFull(c.date)}</div>{c.reason&&<div style={{fontSize:12,color:"#991b1b",opacity:.8}}>{c.reason}</div>}</div>
                  <button onClick={()=>onUnmark(c.date)} style={{background:"none",border:"none",cursor:"pointer",color:"#991b1b",fontSize:18,padding:"0 4px"}}>×</button>
                </div>
              ))}
            </div>
          </div>}
        </div>}
        {mode==="weekday"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={lbl}>Reason</label><input value={wdReason} onChange={e=>setWdReason(e.target.value)} placeholder="e.g. always closed on rest day" style={inp}/></div>
          <div style={{display:"flex",gap:5}}>
            {DAY_NAMES.map((dn,d)=>{const active=!!isWdClosed(d);return(
              <button key={d} onClick={()=>toggleWeekday(d)} style={{flex:1,padding:"10px 2px",borderRadius:9,border:active?"2px solid #ef4444":"1px solid var(--border)",background:active?"#fef2f2":"#fff",color:active?"#991b1b":"#64648a",fontWeight:active?700:500,fontSize:12,cursor:"pointer"}}>{dn}</button>
            );})}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>selectGroup([0,6])} style={gBtn({flex:1,fontSize:12,padding:"7px 0"})}>Select Weekend</button>
            <button onClick={()=>selectGroup([1,2,3,4,5])} style={gBtn({flex:1,fontSize:12,padding:"7px 0"})}>Select Weekdays</button>
          </div>
          {closedWeekdays.length>0&&<div style={{marginTop:6}}>
            <div style={{...sectionLbl,marginBottom:7}}>Currently Recurring Closed</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[...closedWeekdays].sort((a,b)=>a.weekday-b.weekday).map(c=>(
                <div key={c.weekday} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 11px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:9}}>
                  <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,color:"#991b1b"}}>Every {DAY_NAMES[c.weekday]}</div>{c.reason&&<div style={{fontSize:12,color:"#991b1b",opacity:.8}}>{c.reason}</div>}</div>
                  <button onClick={()=>onUnmarkWeekday(c.weekday)} style={{background:"none",border:"none",cursor:"pointer",color:"#991b1b",fontSize:18,padding:"0 4px"}}>×</button>
                </div>
              ))}
            </div>
          </div>}
        </div>}
      </div>
    </div>
  );
}

// ─── ADD SERVICE MODAL ───────────────────────────────────────────────────────
function ServiceModal({onClose,onSave}){
  const [form,setForm]=useState({name:"",price:"",duration:30});
  const up=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:16,padding:20,width:400,maxWidth:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:16,color:"var(--text)"}}>Add Service</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:"var(--text-muted)",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div><label style={lbl}>Service Name</label><input value={form.name} onChange={e=>up("name",e.target.value)} placeholder="e.g. Hot Oil Massage" style={inp}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Price (RM)</label><input type="number" min={0} value={form.price} onChange={e=>up("price",Number(e.target.value))} style={inp}/></div>
            <div><label style={lbl}>Duration</label>
              <select value={form.duration} onChange={e=>up("duration",Number(e.target.value))} style={inp}>
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
          </div>
          <button onClick={()=>{if(!form.name||!form.price)return;onSave(form);}} style={pBtn({padding:"10px 0",fontSize:13})}>Add Service</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD / EDIT STAFF MODAL ───────────────────────────────────────────────────
function StaffModal({staffMember,onClose,onSave,isNew}){
  const blank={id:Date.now(),name:"",avatar:"",color:"#a855f7",photo:null,phone:"",emergencyName:"",emergencyPhone:"",position:"Junior Beautician",skills:[],ic:""};
  const [form,setForm]=useState(staffMember||blank);
  const fileRef=useRef();
  const up=(k,v)=>setForm(p=>({...p,[k]:v}));
  const toggleSkill=(s)=>setForm(p=>({...p,skills:p.skills.includes(s)?p.skills.filter(x=>x!==s):[...p.skills,s]}));
  const handlePhoto=(e)=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>up("photo",ev.target.result);reader.readAsDataURL(file);};
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:16,padding:20,width:460,maxWidth:"100%",maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>{isNew?"➕ Add Staff":"✏️ Edit Staff"}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"var(--text-muted)",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {/* Photo */}
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div onClick={()=>fileRef.current?.click()} style={{width:64,height:64,borderRadius:"50%",background:form.photo?"transparent":form.color||"#a855f7",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",border:"2px dashed #d8b4fe",flexShrink:0}}>
              {form.photo?<img src={form.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{color:"#fff",fontWeight:700,fontSize:22}}>{form.name?form.name[0]:"+"}</span>}
            </div>
            <div>
              <button onClick={()=>fileRef.current?.click()} style={gBtn({fontSize:11,padding:"6px 12px"})}>📷 Upload Photo</button>
              <div style={{fontSize:9,color:"var(--text-muted)",marginTop:4}}>Click avatar to upload</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Full Name</label><input value={form.name} onChange={e=>{up("name",e.target.value);up("avatar",e.target.value[0]?.toUpperCase()||"");}} placeholder="e.g. Siti Rahimah" style={inp}/></div>
            <div><label style={lbl}>IC Number</label><input value={form.ic} onChange={e=>up("ic",e.target.value)} placeholder="900101-14-1234" style={inp}/></div>
          </div>
          <div><label style={lbl}>Current Position / Level</label>
            <select value={form.position} onChange={e=>up("position",e.target.value)} style={inp}>
              {POSITIONS.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Contact Number</label><input value={form.phone} onChange={e=>up("phone",e.target.value)} placeholder="012-3456789" style={inp}/></div>
            <div><label style={lbl}>Avatar Colour</label>
              <div style={{display:"flex",gap:5,paddingTop:4}}>
                {["#a855f7","#ec4899","#06b6d4","#f59e0b","#10b981","#ef4444","#6366f1"].map(c=>(
                  <button key={c} onClick={()=>up("color",c)} style={{width:24,height:24,borderRadius:"50%",background:c,border:form.color===c?"3px solid #1a1a2e":"2px solid transparent",cursor:"pointer",flexShrink:0}}/>
                ))}
              </div>
            </div>
          </div>
          <div style={{background:"var(--bg)",borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#7e22ce",marginBottom:7}}>🚨 Emergency Contact</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
              <div><label style={lbl}>Name (Relationship)</label><input value={form.emergencyName} onChange={e=>up("emergencyName",e.target.value)} placeholder="e.g. Ahmad (Husband)" style={inp}/></div>
              <div><label style={lbl}>Phone</label><input value={form.emergencyPhone} onChange={e=>up("emergencyPhone",e.target.value)} placeholder="017-9988776" style={inp}/></div>
            </div>
          </div>
          <div>
            <label style={lbl}>🎯 Skills / Services Available</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {SKILL_OPTIONS.map(s=>{const sel=form.skills.includes(s);return(
                <button key={s} onClick={()=>toggleSkill(s)} style={{padding:"4px 10px",borderRadius:20,border:sel?"2px solid #9333ea":"1px solid var(--border)",background:sel?"#f3e8ff":"#fff",color:sel?"#7e22ce":"#9090b0",fontSize:10,fontWeight:sel?600:400,cursor:"pointer"}}>{s}</button>
              );})}
            </div>
          </div>
          <button onClick={()=>{if(!form.name)return;onSave(form,isNew);}} style={pBtn({padding:"10px 0",fontSize:12,width:"100%",marginTop:2})}>{isNew?"Add Staff":"Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT CUSTOMER MODAL ─────────────────────────────────────────────────────
function CustomerEditModal({customer,extraData,onClose,onSave}){
  const [form,setForm]=useState({name:customer.name,phone:customer.phone,...(extraData||{ic:"",email:"",gender:"",birthday:""})});
  const up=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"var(--surface)",borderRadius:16,padding:20,width:400,maxWidth:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.25)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>✏️ Edit Customer</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"var(--text-muted)",padding:"0 4px"}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Full Name</label><input value={form.name} onChange={e=>up("name",e.target.value)} style={inp}/></div>
            <div><label style={lbl}>IC Number</label><input value={form.ic} onChange={e=>up("ic",e.target.value)} placeholder="900101-14-1234" style={inp}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Phone</label><input value={form.phone} onChange={e=>up("phone",e.target.value)} style={inp}/></div>
            <div><label style={lbl}>Email</label><input value={form.email} onChange={e=>up("email",e.target.value)} placeholder="email@example.com" style={inp}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            <div><label style={lbl}>Gender</label>
              <select value={form.gender} onChange={e=>up("gender",e.target.value)} style={inp}>
                <option value="">Select...</option>
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
            <div><label style={lbl}>Birthday</label><input type="date" value={form.birthday} onChange={e=>up("birthday",e.target.value)} style={inp}/></div>
          </div>
          <button onClick={()=>onSave(form)} style={pBtn({padding:"9px 0",fontSize:12,width:"100%",marginTop:2})}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS PANEL ─────────────────────────────────────────────────────
function NotifPanel({show,onClose,bookings,services,onSelectBooking}){
  if(!show) return null;
  const pending=bookings.filter(b=>b.status==="pending");
  const unassigned=bookings.filter(b=>b.status==="unassigned");
  const all=[...unassigned.map(b=>({...b,_type:"unassigned"})),...pending.map(b=>({...b,_type:"pending"}))];
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:350}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:64,right:18,width:330,background:"var(--surface)",borderRadius:16,border:"1px solid var(--border)",boxShadow:"0 8px 32px rgba(124,58,237,0.15)",overflow:"hidden"}}>
        <div style={{padding:"13px 16px",borderBottom:"1px solid #f0ebff",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontWeight:700,fontSize:14,color:"var(--text)",display:"flex",alignItems:"center",gap:7}}><Icon path={ICONS.bell} size={16}/>Notifications {all.length>0&&<span style={{background:"#ef4444",color:"#fff",borderRadius:10,fontSize:10,fontWeight:700,padding:"1px 6px"}}>{all.length}</span>}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"var(--text-muted)"}}>×</button>
        </div>
        {all.length===0?<div style={{padding:"24px 16px",textAlign:"center",color:"var(--text-muted)",fontSize:13}}>All caught up! No pending actions.</div>:(
          <div style={{maxHeight:360,overflowY:"auto"}}>
            {all.map(b=>{const s=services.find(sv=>sv.id===b.service);return(
              <div key={b.id} onClick={()=>{onSelectBooking(b);onClose();}} style={{padding:"12px 16px",borderBottom:"1px solid #f5f3ff",display:"flex",gap:11,alignItems:"flex-start",cursor:"pointer",transition:"background 0.1s"}} onMouseEnter={e=>e.currentTarget.style.background="var(--bg)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <div style={{width:34,height:34,borderRadius:"50%",background:b._type==="unassigned"?"linear-gradient(135deg,#7e22ce,#a855f7)":"linear-gradient(135deg,#d97706,#fbbf24)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}><Icon path={b._type==="unassigned"?ICONS.alert:ICONS.clock} size={15}/></div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--text)"}}>{b.customer}</div>
                  <div style={{fontSize:11,color:"var(--text-muted)"}}>{s?.name} · {fmtD(b.date)} {b.time}</div>
                  <div style={{marginTop:3,padding:"2px 8px",borderRadius:20,display:"inline-block",fontSize:10,fontWeight:600,...(b._type==="unassigned"?{background:"#fdf4ff",color:"#7e22ce"}:{background:"#fffbeb",color:"#92400e"})}}>{b._type==="unassigned"?"Unassigned — needs staff":"Pending confirmation"}</div>
                </div>
                <Icon path={ICONS.chevRight} size={13} color="#c084fc"/>
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({onSuccess}){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const submit=()=>{
    if(!email.trim()){setError("Please enter your email.");return;}
    setLoading(true);setError("");
    fetch("/api/settings/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})})
      .then(r=>{if(!r.ok)return r.json().then(d=>{throw new Error(d.error||"fail");});return r.json();})
      .then(()=>{sessionStorage.setItem("beaubook_authed","1");onSuccess();})
      .catch(e=>setError(e.message==="fail"?"Incorrect email or password.":e.message||"Login failed."))
      .finally(()=>setLoading(false));
  };

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#f5f3ff 0%,#ede9fe 50%,#ddd6fe 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{background:"#fff",borderRadius:24,padding:36,width:400,maxWidth:"100%",boxShadow:"0 32px 80px rgba(109,40,217,0.18)",border:"1px solid #ede9fe"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28}}>
          <div style={{width:62,height:62,borderRadius:18,background:"linear-gradient(135deg,#6d28d9,#9333ea)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 10px 28px rgba(109,40,217,0.40)"}}><span style={{color:"#fff",fontWeight:800,fontSize:28}}>B</span></div>
          <div style={{fontWeight:800,fontSize:22,color:"#1e1b4b",letterSpacing:"-0.5px"}}>Beaubook</div>
          <div style={{fontSize:13,color:"#8b7fb0",marginTop:3,fontWeight:500}}>Merchant Dashboard</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:"#7c3aed",display:"block",marginBottom:6,letterSpacing:"0.08em",textTransform:"uppercase"}}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="your@email.com" style={{...inp,padding:"12px 14px",fontSize:15}} autoFocus/>
          </div>
          <div>
            <label style={{fontSize:11,fontWeight:700,color:"#7c3aed",display:"block",marginBottom:6,letterSpacing:"0.08em",textTransform:"uppercase"}}>Password</label>
            <div style={{position:"relative"}}>
              <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Enter password" style={{...inp,padding:"12px 14px",paddingRight:46,fontSize:15}}/>
              <button onClick={()=>setShowPw(p=>!p)} tabIndex={-1} style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9090b0",fontSize:19,lineHeight:1,padding:0}}>
                {showPw?"🙈":"👁️"}
              </button>
            </div>
          </div>
          {error&&<div style={{fontSize:13,color:"#991b1b",background:"#fef2f2",padding:"10px 14px",borderRadius:10,border:"1px solid #fca5a5",fontWeight:500}}>{error}</div>}
          <button onClick={submit} disabled={loading} style={pBtn({width:"100%",marginTop:4,padding:"14px 0",fontSize:15,fontWeight:700,background:"linear-gradient(135deg,#6d28d9,#9333ea)",boxShadow:"0 6px 18px rgba(109,40,217,0.35)",opacity:loading?0.7:1})}>{loading?"Logging in…":"Log In"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function BeaubookDashboard(){
  const [tab,setTab]=useState("calendar");
  const [bookings,setBookings]=useState([]);
  const [staffList,setStaffList]=useState([]);
  const [leaveRecords,setLeaveRecords]=useState([]);
  const [schedules,setSchedules]=useState({});
  const [customerExtra,setCustomerExtra]=useState({});
  const [custNotes,setCustNotes]=useState({});
  const [selectedDate,setSelectedDate]=useState(TODAY);
  const [calView,setCalView]=useState("week");
  const [monthYear,setMonthYear]=useState({y:new Date().getFullYear(),m:new Date().getMonth()});
  const [weekBase,setWeekBase]=useState(TODAY);
  const [filterStaff,setFilterStaff]=useState(0);
  const [selBooking,setSelBooking]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [addDate,setAddDate]=useState(TODAY);
  const [addTime,setAddTime]=useState("09:00");
  const [showNotif,setShowNotif]=useState(false);
  const [toast,setToast]=useState(null);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [selCustomer,setSelCustomer]=useState(null);
  const [editCustomer,setEditCustomer]=useState(null);
  const [custSearch,setCustSearch]=useState("");
  const [custSort,setCustSort]=useState("recent");
  const [custFilter,setCustFilter]=useState("all");
  const [custNoteEdit,setCustNoteEdit]=useState("");
  const [leaveStaff,setLeaveStaff]=useState(null);
  const [schedStaff,setSchedStaff]=useState(null);
  const [editStaff,setEditStaff]=useState(null);
  const [addStaff,setAddStaff]=useState(false);
  const [notifTriggered,setNotifTriggered]=useState(false);
  const [staffMonth,setStaffMonth]=useState({m:new Date().getMonth(),y:new Date().getFullYear()});
  const [closedDates,setClosedDates]=useState([]);
  const [showCloseDay,setShowCloseDay]=useState(false);
  const [closedWeekdays,setClosedWeekdays]=useState([]);
  const [services,setServices]=useState([]);
  const [addService,setAddService]=useState(false);
  const [authed,setAuthed]=useState(()=>sessionStorage.getItem("beaubook_authed")==="1");
  const [theme,setTheme]=useState(()=>localStorage.getItem("beaubook_theme")||"light");
  const [language,setLanguage]=useState(()=>localStorage.getItem("beaubook_language")||"en");
  const [settings,setSettings]=useState({companyName:"Glam Lab",location:"Kuala Lumpur",notifyOnPending:true,notifyBefore:30,email:null,emailVerified:false});
  const [profileForm,setProfileForm]=useState({companyName:"",location:"",contactPhone:"",address:"",personInCharge:"",facebook:"",instagram:"",tiktok:"",xhs:"",youtube:"",twitter:"",whatsapp:""});
  const [nowTime,setNowTime]=useState(new Date());
  const [apptToasts,setApptToasts]=useState([]);
  const shownNotifsRef=useRef(new Set());
  const [emailForm,setEmailForm]=useState({email:"",token:"",verifyUrl:"",sent:false});
  const [pwForm,setPwForm]=useState({current:"",next:"",confirm:""});
  const [pwMsg,setPwMsg]=useState(null);
  const [bookingSearch,setBookingSearch]=useState("");
  const [bookingGroupBy,setBookingGroupBy]=useState("date");
  const [bookingMonth,setBookingMonth]=useState({y:Number(TODAY.slice(0,4)),m:Number(TODAY.slice(5,7))-1});
  const [showMonthPicker,setShowMonthPicker]=useState(false);
  const [pickerYear,setPickerYear]=useState(Number(TODAY.slice(0,4)));
  const pendingSectionRef=useRef(null);

  const t=key=>TRANSLATIONS[language]?.[key]??TRANSLATIONS.en[key]??key;
  function showToast(msg,type="success"){setToast({msg,type});setTimeout(()=>setToast(null),3000);}
  const svc=id=>services.find(s=>s.id===id);
  const stf=id=>staffList.find(s=>s.id===id);
  const isOL=(staffId,date)=>leaveRecords.some(r=>r.staffId===staffId&&r.dates.includes(date));

  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("beaubook_theme",theme);},[theme]);
  useEffect(()=>{localStorage.setItem("beaubook_language",language);},[language]);

  useEffect(()=>{
    fetch("/api/bookings").then(r=>r.json()).then(setBookings);
    fetch("/api/staff").then(r=>r.json()).then(setStaffList);
    fetch("/api/leave").then(r=>r.json()).then(setLeaveRecords);
    fetch("/api/schedules").then(r=>r.json()).then(setSchedules);
    fetch("/api/customers").then(r=>r.json()).then(({extra,notes})=>{setCustomerExtra(extra);setCustNotes(notes);});
    fetch("/api/closed-dates").then(r=>r.json()).then(setClosedDates);
    fetch("/api/closed-weekdays").then(r=>r.json()).then(setClosedWeekdays);
    fetch("/api/services").then(r=>r.json()).then(setServices);
    fetch("/api/settings").then(r=>r.json()).then(s=>{
      setSettings(s);
      setProfileForm({companyName:s.companyName||"",location:s.location||"",contactPhone:s.contactPhone||"",address:s.address||"",personInCharge:s.personInCharge||"",facebook:s.facebook||"",instagram:s.instagram||"",tiktok:s.tiktok||"",xhs:s.xhs||"",youtube:s.youtube||"",twitter:s.twitter||"",whatsapp:s.whatsapp||""});
    });
  },[]);

  // Live clock — ticks every second
  useEffect(()=>{const t=setInterval(()=>setNowTime(new Date()),1000);return()=>clearInterval(t);},[]);

  // Upcoming appointment notifications — checks every 60s
  useEffect(()=>{
    if(!settings.notifyOnPending)return;
    const check=()=>{
      const now=new Date();
      const todayDate=now.toISOString().split("T")[0];
      const nowMin=now.getHours()*60+now.getMinutes();
      const nb=settings.notifyBefore||30;
      bookings.filter(b=>b.status!=="cancelled"&&b.date===todayDate).forEach(b=>{
        const bMin=timeToMin(b.time);
        const diff=bMin-nowMin;
        if(diff>=0&&diff<=nb&&!shownNotifsRef.current.has(b.id)){
          shownNotifsRef.current.add(b.id);
          const tid=Date.now()+b.id;
          setApptToasts(p=>[...p,{id:tid,booking:b}]);
          setTimeout(()=>setApptToasts(p=>p.filter(t=>t.id!==tid)),9000);
        }
      });
    };
    check();
    const t=setInterval(check,60000);
    return()=>clearInterval(t);
  },[bookings,settings.notifyOnPending,settings.notifyBefore]);

  function handleSaveSettings(updates){
    const payload={companyName:profileForm.companyName,location:profileForm.location,contactPhone:profileForm.contactPhone,address:profileForm.address,personInCharge:profileForm.personInCharge,facebook:profileForm.facebook,instagram:profileForm.instagram,tiktok:profileForm.tiktok,xhs:profileForm.xhs,youtube:profileForm.youtube,twitter:profileForm.twitter,whatsapp:profileForm.whatsapp,notifyOnPending:settings.notifyOnPending,notifyBefore:settings.notifyBefore,...updates};
    fetch("/api/settings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).then(r=>r.json()).then(saved=>{setSettings(s=>({...s,...saved}));showToast("Settings saved!");});
  }
  function handleReschedule(b,{date,time}){
    const now=nowStr();
    const history=[...(b.history||[]),{field:"Rescheduled",from:`${b.date} ${b.time}`,to:`${date} ${time}`,at:now}];
    patchBooking(b.id,{date,time,history}).then(updated=>{setBookings(p=>p.map(bk=>bk.id===b.id?updated:bk));setSelBooking(updated);showToast("Appointment rescheduled!");});
  }
  function handleChangePassword(currentPassword,newPassword){
    return fetch("/api/settings/password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword,newPassword})}).then(r=>r.json().then(data=>({ok:r.ok,...data})));
  }

  function exportReport(period){
    const today=new Date(TODAY+"T00:00:00");
    let from=new Date(today);
    if(period==="weekly")from.setDate(today.getDate()-7);
    else if(period==="monthly")from.setMonth(today.getMonth()-1);
    else if(period==="yearly")from.setFullYear(today.getFullYear()-1);
    const fromStr=from.toISOString().split("T")[0];
    const rows=bookings.filter(b=>b.date>=fromStr&&b.date<=TODAY&&b.status!=="cancelled").sort((a,b2)=>a.date.localeCompare(b2.date));
    const header=["Date","Time","Customer","Phone","Service","Staff","Status","Payment Status","Amount Paid (RM)"];
    const lines=[header.join(",")];
    rows.forEach(b=>{
      const s=svc(b.service),st=stf(b.staff);
      const cells=[b.date,b.time,b.customer,b.phone,s?.name||"",st?.name||"",b.status,b.payStatus,b.amtPaid||0];
      lines.push(cells.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(","));
    });
    const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8;"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`beaubook-${period}-report-${TODAY}.csv`;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`${period[0].toUpperCase()}${period.slice(1)} report exported!`);
  }

  function patchBooking(id,data){return fetch(`/api/bookings/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(r=>r.json());}
  const getClosed=date=>{
    const specific=closedDates.find(c=>c.date===date);
    if(specific)return specific;
    const weekday=new Date(date+"T00:00:00").getDay();
    const recurring=closedWeekdays.find(c=>c.weekday===weekday);
    return recurring?{date,reason:recurring.reason,recurring:true}:null;
  };
  function handleMarkClosed(date,reason){
    fetch("/api/closed-dates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({date,reason})}).then(r=>r.json()).then(saved=>{
      setClosedDates(p=>[...p.filter(c=>c.date!==date),saved].sort((a,b2)=>a.date.localeCompare(b2.date)));
      showToast("Marked as closed!");
    });
  }
  function handleUnmarkClosed(date){
    fetch(`/api/closed-dates/${date}`,{method:"DELETE"}).then(()=>{setClosedDates(p=>p.filter(c=>c.date!==date));showToast("Closed date removed.");});
  }
  function handleMarkClosedWeekday(weekday,reason){
    fetch("/api/closed-weekdays",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({weekday,reason})}).then(r=>r.json()).then(saved=>{
      setClosedWeekdays(p=>[...p.filter(c=>c.weekday!==weekday),saved].sort((a,b2)=>a.weekday-b2.weekday));
    });
  }
  function handleUnmarkClosedWeekday(weekday){
    fetch(`/api/closed-weekdays/${weekday}`,{method:"DELETE"}).then(()=>{setClosedWeekdays(p=>p.filter(c=>c.weekday!==weekday));});
  }
  function handleAddService(form){
    fetch("/api/services",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}).then(r=>r.json()).then(created=>{setServices(p=>[...p,created]);setAddService(false);showToast("Service added!");});
  }

  function handleAccept(id){patchBooking(id,{status:"confirmed"}).then(updated=>{setBookings(p=>p.map(b=>b.id===id?updated:b));setSelBooking(p=>p?.id===id?updated:p);showToast("Booking confirmed!");});}
  function handleCancel(id){patchBooking(id,{status:"cancelled"}).then(updated=>{setBookings(p=>p.map(b=>b.id===id?updated:b));setSelBooking(null);showToast("Booking cancelled.","error");});}
  function handleSaveEdit(b,draft){
    const now=nowStr();const ch=[];
    const chk=(f,o,n)=>{if(String(o)!==String(n))ch.push({field:f,from:String(o||"—"),to:String(n||"—"),at:now});};
    chk("Date",b.date,draft.date);chk("Time",b.time,draft.time);chk("Service",svc(b.service)?.name,svc(draft.service)?.name);chk("Staff",stf(b.staff)?.name,stf(draft.staff)?.name);chk("Seat",b.seat||"—",draft.seat||"—");chk("Remark",b.remark||"",draft.remark||"");chk("PayStatus",b.payStatus,draft.payStatus);chk("PayMethod",b.payMethod||"—",draft.payMethod||"—");chk("AmtPaid",b.amtPaid||0,draft.amtPaid||0);chk("TXN",b.txnId||"—",draft.txnId||"—");
    const history=[...(b.history||[]),...ch];
    patchBooking(b.id,{...draft,history}).then(updated=>{setBookings(p=>p.map(bk=>bk.id===b.id?updated:bk));setSelBooking(updated);showToast("Changes saved!");});
  }
  function handleAddBooking(form){
    fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}).then(r=>r.json()).then(created=>{setBookings(p=>[...p,created]);setShowAdd(false);showToast("Booking added!");});
  }
  function handleLeave(staffId,dates,lt,reason,affected,reassign){
    const now=nowStr();
    fetch("/api/leave",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({staffId,dates,leaveType:lt,reason,affected,reassign,now})}).then(r=>r.json()).then(({leaveRecord,updatedBookings})=>{
      setLeaveRecords(p=>[...p,leaveRecord]);
      setBookings(prev=>prev.map(b=>updatedBookings.find(u=>u.id===b.id)||b));
      setLeaveStaff(null);showToast("Leave recorded!");
    });
  }
  function handleSaveSched(staffId,sc){
    fetch(`/api/schedules/${staffId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(sc)}).then(r=>r.json()).then(()=>{setSchedules(p=>({...p,[staffId]:sc}));setSchedStaff(null);showToast("Schedule saved!");});
  }
  function handleSaveStaff(form,isNew){
    const req=isNew
      ?fetch("/api/staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)})
      :fetch(`/api/staff/${form.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    req.then(r=>r.json()).then(saved=>{
      if(isNew){setStaffList(p=>[...p,saved]);}
      else{setStaffList(p=>p.map(s=>s.id===saved.id?saved:s));}
      setEditStaff(null);setAddStaff(false);showToast(isNew?"Staff added!":"Staff updated!");
    });
  }
  function handleSaveCustomer(form){
    fetch(`/api/customers/${editCustomer.phone}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}).then(r=>r.json()).then(({extra,updatedBookings})=>{
      setCustomerExtra(p=>({...p,[form.phone]:{ic:extra.ic,email:extra.email,gender:extra.gender,birthday:extra.birthday}}));
      setBookings(p=>p.map(b=>updatedBookings.find(u=>u.id===b.id)||b));
      setEditCustomer(null);showToast("Customer info saved!");
    });
  }

  function getSlotBks(date,hour,staffId){return bookings.filter(b=>{if(b.date!==date||b.staff!==staffId||b.status==="cancelled")return false;const bm=timeToMin(b.time),sm=timeToMin(hour),dur=svc(b.service)?.duration||60;return bm<=sm&&sm<bm+dur;});}

  const allCustomers=useMemo(()=>{
    const map={};
    bookings.forEach(b=>{if(b.status==="cancelled")return;const k=b.phone;if(!map[k])map[k]={name:b.customer,phone:b.phone,visits:[]};map[k].visits.push(b);});
    return Object.values(map).map(c=>{
      const sorted=[...c.visits].sort((a,b2)=>b2.date.localeCompare(a.date));
      const spend=c.visits.reduce((s,v)=>s+(svc(v.service)?.price||0),0);
      const hasUnpaid=c.visits.some(v=>v.payStatus==="unpaid"||v.payStatus==="partial");
      const isNew=c.visits.length===1;const isVip=c.visits.length>=4||spend>=400;
      const sc2={};c.visits.forEach(v=>{sc2[v.service]=(sc2[v.service]||0)+1;});
      const favSvcId=Number(Object.entries(sc2).sort((a,b2)=>b2[1]-a[1])[0]?.[0]);
      return{...c,spend,hasUnpaid,isNew,isVip,lastVisit:sorted[0]?.date||"",firstVisit:sorted[sorted.length-1]?.date||"",avg:Math.round(spend/c.visits.length),favSvcId,count:c.visits.length,sorted};
    });
  },[bookings]);

  const pendingAll=bookings.filter(b=>b.status==="pending");
  const unassignedAll=bookings.filter(b=>b.status==="unassigned");
  const notifCount=pendingAll.length+unassignedAll.length;
  const wkDates=getWkDates(weekBase);
  const selHoliday=getHoliday(selectedDate);
  const selClosed=getClosed(selectedDate);
  const todayStats={
    total:bookings.filter(b=>b.date===selectedDate&&b.status!=="cancelled").length,
    confirmed:bookings.filter(b=>b.date===selectedDate&&b.status==="confirmed").length,
    pending:bookings.filter(b=>b.date===selectedDate&&b.status==="pending").length,
    revenue:bookings.filter(b=>b.date===selectedDate&&b.status==="confirmed").reduce((s,b)=>s+(svc(b.service)?.price||0),0),
  };
  const monthDays=useMemo(()=>{const{y,m}=monthYear;const dim=getDIM(y,m);const fd=getFD(y,m);const days=[];for(let i=0;i<fd;i++)days.push(null);for(let d=1;d<=dim;d++)days.push(`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);return days;},[monthYear]);

  // Bookings for the month currently being viewed on the Bookings tab
  const tomorrowStr=(()=>{const d=new Date(TODAY+"T00:00:00");d.setDate(d.getDate()+1);return d.toISOString().split("T")[0];})();
  const bookingMonthStr=`${bookingMonth.y}-${String(bookingMonth.m+1).padStart(2,"0")}`;
  const isCurrentBookingMonth=bookingMonth.y===Number(TODAY.slice(0,4))&&bookingMonth.m===Number(TODAY.slice(5,7))-1;
  const monthTotalCount=bookings.filter(b=>b.status!=="cancelled"&&b.date.startsWith(bookingMonthStr)).length;
  const monthBks=bookings.filter(b=>b.status!=="cancelled"&&b.status!=="pending"&&b.date.startsWith(bookingMonthStr)).sort((a,b2)=>a.date.localeCompare(b2.date)||a.time.localeCompare(b2.time));
  const filteredUpcoming=monthBks.filter(b=>{
    const q=bookingSearch.trim().toLowerCase();
    if(!q)return true;
    const s=svc(b.service);
    return b.customer.toLowerCase().includes(q)||b.phone.includes(q)||(s?.name||"").toLowerCase().includes(q);
  });
  const upcomingGroups=bookingGroupBy==="service"
    ?Object.entries(filteredUpcoming.reduce((acc,b)=>{const name=svc(b.service)?.name||"Other";(acc[name]=acc[name]||[]).push(b);return acc;},{})).sort((a,b2)=>b2[1].length-a[1].length)
    :isCurrentBookingMonth
      ?[["Today",filteredUpcoming.filter(b=>b.date===TODAY)],["Tomorrow",filteredUpcoming.filter(b=>b.date===tomorrowStr)],["Upcoming",filteredUpcoming.filter(b=>b.date>tomorrowStr)],["Earlier This Month",filteredUpcoming.filter(b=>b.date<TODAY)]].filter(([,list])=>list.length>0)
      :Object.entries(filteredUpcoming.reduce((acc,b)=>{const label=fmtDFull(b.date);(acc[label]=acc[label]||[]).push(b);return acc;},{}));

  function renderBookingCard(b){
    const sc=BC[b.status]||BC.confirmed;const pc=PC[b.payStatus]||PC.unpaid;const s=svc(b.service);const st=stf(b.staff);
    const price=s?.price||0;const balance=Math.max(0,price-(b.amtPaid||0));
    return(
      <div key={b.id} style={card({padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14,borderLeft:b.status==="pending"?"4px solid #f59e0b":b.status==="unassigned"?"4px solid #c084fc":"1px solid var(--border)"})}>
        <div onClick={()=>setSelBooking(b)} style={{flex:1,display:"flex",alignItems:"center",gap:14}}>
          <div style={{textAlign:"center",minWidth:56,flexShrink:0}}>
            <div style={{fontSize:10,color:"var(--text-muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>{fmtD(b.date)}</div>
            <div style={{fontSize:16,fontWeight:800,color:"#7c3aed",letterSpacing:"-0.5px"}}>{b.time}</div>
          </div>
          <div style={{width:1,height:40,background:"var(--border)",flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:3}}>{b.customer}</div>
            <div style={{fontSize:12,color:"var(--text-muted)",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              {s?.name&&<span>{s.name}</span>}
              {st&&<><span style={{color:"var(--border-2,#e5e1f8)"}}>·</span><span>{st.name}</span></>}
              {b.seat&&<><span style={{color:"var(--border-2,#e5e1f8)"}}>·</span><span style={{background:"#f3e8ff",color:"#7c3aed",padding:"1px 7px",borderRadius:6,fontSize:11,fontWeight:600}}>{b.seat}</span></>}
            </div>
            {b.remark&&<div style={{display:"inline-block",marginTop:5,padding:"3px 10px",borderRadius:20,background:"#f3e8ff",fontSize:11,color:"#7c3aed",fontWeight:500,border:"1px solid #e9d5ff"}}>&ldquo;{b.remark}&rdquo;</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
            <span style={{padding:"3px 11px",borderRadius:99,fontSize:11,fontWeight:700,background:sc.bg,color:sc.tx,border:`1px solid ${sc.br}`,letterSpacing:"0.01em"}}>{b.status}</span>
            <span style={{padding:"3px 11px",borderRadius:99,fontSize:11,fontWeight:700,background:pc.bg,color:pc.tx,border:`1px solid ${pc.br}`}}>{b.payStatus}</span>
            {balance>0&&<span style={{fontSize:11,color:"#dc2626",fontWeight:700}}>Balance RM{balance}</span>}
          </div>
        </div>
        {/* Call / WA buttons */}
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <a href={`tel:${b.phone}`} onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:10,background:"var(--bg)",border:"1px solid var(--border)",color:"#7c3aed",textDecoration:"none"}}><Icon path={ICONS.phone} size={15}/></a>
          <a href={`https://wa.me/6${b.phone.replace(/-/g,"")}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:10,background:"var(--bg)",border:"1px solid var(--border)",color:"#7c3aed",textDecoration:"none"}}><Icon path={ICONS.message} size={15}/></a>
        </div>
        {b.status==="pending"&&<div style={{display:"flex",gap:6,flexShrink:0}}>
          <button onClick={e=>{e.stopPropagation();handleAccept(b.id);}} style={{background:"#16a34a",border:"none",color:"#fff",borderRadius:10,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon path={ICONS.check} size={16}/></button>
          <button onClick={e=>{e.stopPropagation();handleCancel(b.id);}} style={{background:"var(--bg)",border:"1px solid #fca5a5",color:"#991b1b",borderRadius:10,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon path={ICONS.x} size={16}/></button>
        </div>}
      </div>
    );
  }

  if(!authed) return <LoginScreen onSuccess={()=>setAuthed(true)}/>;

  return(
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>

      {/* NAV */}
      <nav style={{background:"var(--surface)",borderBottom:"1px solid var(--border)",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200,boxShadow:"var(--shadow-sm)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:10,padding:8,cursor:"pointer",color:"#7c3aed",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div style={{width:36,height:36,borderRadius:11,background:"linear-gradient(135deg,#7c3aed,#9333ea)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13,flexShrink:0}}>{settings.companyName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
          <div>
            <div style={{fontWeight:700,fontSize:15,color:"var(--text)",letterSpacing:"-0.3px",lineHeight:1.2}}>{settings.companyName}</div>
            <div style={{fontSize:11,color:"var(--text-muted)",fontWeight:500,marginTop:1}}>{settings.location}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* Live clock */}
          <div style={{display:"flex",alignItems:"center",gap:7,fontSize:13,fontWeight:700,color:"#7c3aed",background:"var(--primary-bg,#f3e8ff)",padding:"7px 14px",borderRadius:10,border:"1px solid var(--border)",letterSpacing:"0.01em"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:"#10b981",display:"inline-block",flexShrink:0}}/>
            {nowTime.toLocaleTimeString("en-MY",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}
          </div>
          {/* Notification bell */}
          <button onClick={()=>setShowNotif(p=>!p)} style={{position:"relative",background:"var(--bg)",border:"1px solid var(--border)",borderRadius:10,width:40,height:40,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Icon path={ICONS.bell} size={18} color={notifCount>0?"#7c3aed":"var(--text-muted)"} strokeWidth={1.8}/>
            {notifCount>0&&<span style={{position:"absolute",top:-5,right:-5,background:"#ef4444",color:"#fff",borderRadius:99,fontSize:10,fontWeight:700,minWidth:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px",border:"2px solid var(--surface)"}}>{notifCount}</span>}
          </button>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",background:"var(--bg)",borderRadius:10,border:"1px solid var(--border)"}}>
            <div style={{width:26,height:26,borderRadius:8,background:"linear-gradient(135deg,#6d28d9,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:800,fontSize:11}}>B</span></div>
            <span style={{fontSize:13,color:"var(--text)",fontWeight:600}}>Beaubook</span>
          </div>
        </div>
      </nav>

      <div style={{display:"flex",flex:1}}>
        {/* SIDEBAR */}
        {sidebarOpen&&<aside style={{width:224,background:"var(--surface)",borderRight:"1px solid var(--border)",padding:"20px 14px",display:"flex",flexDirection:"column",gap:2,flexShrink:0}}>
          <div style={{...sectionLbl,padding:"0 10px",marginBottom:12}}>Menu</div>
          {[{id:"calendar",icon:ICONS.calendar,label:t("nav.calendar")},{id:"bookings",icon:ICONS.list,label:t("nav.bookings"),badge:pendingAll.length+unassignedAll.length},{id:"customers",icon:ICONS.user,label:t("nav.customers")},{id:"staff",icon:ICONS.users,label:t("nav.staff")},{id:"services",icon:ICONS.scissors,label:t("nav.services")},{id:"analytics",icon:ICONS.chart,label:t("nav.analytics")},{id:"settings",icon:ICONS.settings,label:t("nav.settings")}].map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",cursor:"pointer",textAlign:"left",width:"100%",background:tab===item.id?"var(--primary-bg,#f3e8ff)":"transparent",color:tab===item.id?"#7c3aed":"var(--text-muted)",fontWeight:tab===item.id?700:500,fontSize:13.5}}>
              <Icon path={item.icon} size={17} color={tab===item.id?"#7c3aed":"var(--text-muted)"} strokeWidth={tab===item.id?2.2:1.8}/><span style={{flex:1}}>{item.label}</span>
              {item.badge>0&&<span style={{background:"#ef4444",color:"#fff",borderRadius:99,fontSize:10,fontWeight:700,padding:"2px 7px",lineHeight:1.5}}>{item.badge}</span>}
            </button>
          ))}
        </aside>}

        <main style={{flex:1,padding:20,overflowY:"auto"}}>
          {/* Status toast */}
          {toast&&<div style={{position:"fixed",top:68,right:16,zIndex:9999,padding:"8px 14px",borderRadius:9,background:toast.type==="success"?"#f0fdf4":"#fef2f2",border:`1px solid ${toast.type==="success"?"#86efac":"#fca5a5"}`,color:toast.type==="success"?"#15803d":"#991b1b",fontWeight:600,fontSize:11,boxShadow:"0 4px 20px rgba(0,0,0,0.1)",display:"flex",alignItems:"center",gap:6}}>
            {toast.type==="success"?"✓":"✕"} {toast.msg}
          </div>}
          {/* Appointment reminder toasts */}
          {apptToasts.map(({id,booking:b},idx)=>{const s=svc(b.service);return(
            <div key={id} onClick={()=>{setSelBooking(b);setApptToasts(p=>p.filter(t=>t.id!==id));}} style={{position:"fixed",bottom:20+(idx*96),right:16,zIndex:9998,padding:"14px 16px",borderRadius:14,background:"linear-gradient(135deg,#6d28d9,#9333ea)",color:"#fff",boxShadow:"0 8px 32px rgba(109,40,217,0.45)",display:"flex",alignItems:"center",gap:12,width:300,cursor:"pointer",animation:"slideIn 0.3s ease"}}>
              <div style={{fontSize:24,flexShrink:0}}>🔔</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:2}}>Upcoming: {b.customer}</div>
                <div style={{fontSize:11,opacity:.88}}>{s?.name} · {b.time}</div>
                <div style={{fontSize:10,opacity:.7,marginTop:2}}>{settings.notifyBefore} min reminder</div>
              </div>
              <button onClick={e=>{e.stopPropagation();setApptToasts(p=>p.filter(t=>t.id!==id));}} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",borderRadius:6,width:22,height:22,cursor:"pointer",fontSize:16,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
            </div>
          );})}
          <style>{`@keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

          {/* ═══ CALENDAR ═══ */}
          {tab==="calendar"&&<div>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
              <div>
                <h1 style={{margin:0,fontSize:22,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>{t("nav.calendar")}</h1>
                <p style={{margin:"3px 0 0",fontSize:13,color:"var(--text-muted)"}}>{new Date(selectedDate+"T00:00:00").toLocaleDateString("en-MY",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {staffList.length} stylists on shift{selHoliday&&<span style={{color:"#dc2626",fontWeight:600}}> · Public Holiday: {selHoliday}</span>}{selClosed&&<span style={{color:"#dc2626",fontWeight:600}}> · Closed{selClosed.reason?`: ${selClosed.reason}`:""}</span>}</p>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowCloseDay(true)} style={gBtn({display:"flex",alignItems:"center",gap:6})}><Icon path={ICONS.lock} size={15}/>Mark Closed</button>
                <button onClick={()=>{setAddDate(selectedDate);setAddTime("09:00");setShowAdd(true);}} style={pBtn({display:"flex",alignItems:"center",gap:6})}><Icon path={ICONS.plus} size={16}/>Add booking</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:10}}>
              {[{l:"Today",v:todayStats.total,ic:ICONS.calendar,c:"#7c3aed"},{l:"Confirmed",v:todayStats.confirmed,ic:ICONS.check,c:"#16a34a"},{l:"Pending",v:todayStats.pending,ic:ICONS.clock,c:"#d97706"}].map(s=>(
                <div key={s.l} style={statCard(s.c,{padding:"12px 16px"})}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                    <div style={{width:24,height:24,borderRadius:7,background:`${s.c}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon path={s.ic} size={13} color={s.c}/></div>
                    <div style={{fontSize:11,fontWeight:600,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:"0.04em"}}>{s.l}</div>
                  </div>
                  <div style={{fontSize:28,fontWeight:800,color:"var(--text)",lineHeight:1,letterSpacing:"-1px"}}>{s.v}</div>
                </div>
              ))}
            </div>
            {unassignedAll.length>0&&<div style={{background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:9}}>
              <Icon path={ICONS.alert} size={16} color="#9333ea"/><div style={{flex:1,fontWeight:600,color:"#7e22ce",fontSize:13}}>{unassignedAll.length} unassigned — staff on leave</div>
              <button onClick={()=>setTab("bookings")} style={gBtn({fontSize:11,padding:"5px 11px"})}>Assign</button>
            </div>}

            <div style={card({marginBottom:12,overflow:"hidden"})}>
              <div style={{display:"flex",alignItems:"center",padding:"8px 12px",borderBottom:"1px solid var(--border)",gap:8,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:2,background:"#f3e8ff",borderRadius:9,padding:3}}>
                  {["week","month"].map(v=><button key={v} onClick={()=>setCalView(v)} style={{padding:"5px 13px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:calView===v?"#6d28d9":"transparent",color:calView===v?"#fff":"#7e22ce"}}>{v==="week"?"Week":"Month"}</button>)}
                </div>
                {calView==="week"&&<>
                  <button onClick={()=>{const d=new Date(weekBase);d.setDate(d.getDate()-7);setWeekBase(d.toISOString().split("T")[0]);}} style={gBtn({padding:"5px 10px",fontSize:12})}>←</button>
                  <div style={{display:"flex",flex:1,gap:3}}>
                    {wkDates.map((date,i)=>{const isSel=date===selectedDate;const cnt=bookings.filter(b=>b.date===date&&b.status!=="cancelled").length;return(
                      <button key={date} onClick={()=>setSelectedDate(date)} style={{flex:1,padding:"5px 1px",borderRadius:8,border:isSel?"2px solid #9333ea":"1px solid var(--border)",background:isSel?"#f3e8ff":"#fff",cursor:"pointer"}}>
                        <div style={{fontSize:10,color:isSel?"#7e22ce":"#9090b0",fontWeight:600}}>{DAY_NAMES[i]}</div>
                        <div style={{fontSize:14,fontWeight:700,color:isSel?"#7e22ce":"#1a1a2e"}}>{parseInt(date.split("-")[2])}</div>
                        {cnt>0&&<div style={{width:4,height:4,borderRadius:"50%",background:isSel?"#9333ea":"#c084fc",margin:"2px auto 0"}}/>}
                      </button>
                    );})}
                  </div>
                  <button onClick={()=>{const d=new Date(weekBase);d.setDate(d.getDate()+7);setWeekBase(d.toISOString().split("T")[0]);}} style={gBtn({padding:"5px 10px",fontSize:12})}>→</button>
                </>}
                {calView==="month"&&<>
                  <button onClick={()=>setMonthYear(p=>{const m=p.m-1<0?11:p.m-1;return{y:p.m-1<0?p.y-1:p.y,m};})} style={gBtn({padding:"5px 10px",fontSize:12})}>←</button>
                  <div style={{flex:1,textAlign:"center",fontWeight:700,fontSize:14,color:"var(--text)"}}>{MONTHS_EN[monthYear.m]} {monthYear.y}</div>
                  <button onClick={()=>setMonthYear(p=>{const m=p.m+1>11?0:p.m+1;return{y:p.m+1>11?p.y+1:p.y,m};})} style={gBtn({padding:"5px 10px",fontSize:12})}>→</button>
                </>}
              </div>

              {calView==="week"&&<>
                <div style={{padding:"6px 12px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{...sectionLbl,marginRight:2}}>Staff</span>
                  {[{id:0,name:"All"},...staffList].map(s=>(
                    <button key={s.id} onClick={()=>setFilterStaff(s.id)} style={{padding:"4px 11px",borderRadius:20,border:filterStaff===s.id?"2px solid #9333ea":"1px solid var(--border)",background:filterStaff===s.id?"#f3e8ff":"#fff",cursor:"pointer",fontSize:12,fontWeight:filterStaff===s.id?700:500,color:filterStaff===s.id?"#7e22ce":"#64648a",display:"flex",alignItems:"center",gap:4}}>
                      {s.name}{s.id>0&&isOL(s.id,selectedDate)&&<span style={{fontSize:9,background:"#fef2f2",color:"#991b1b",padding:"0 4px",borderRadius:4}}>Off</span>}
                    </button>
                  ))}
                </div>
                <div style={{overflowX:"auto"}}>
                  <div style={{minWidth:560}}>
                    <div style={{display:"grid",gridTemplateColumns:`60px repeat(${filterStaff===0?staffList.length:1},1fr)`,borderBottom:"1px solid var(--border)",position:"sticky",top:0,background:"var(--surface)",zIndex:10}}>
                      <div style={{padding:"6px 8px",fontSize:11,color:"var(--text-muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>Time</div>
                      {staffList.filter(s=>filterStaff===0||s.id===filterStaff).map(s=>(
                        <div key={s.id} style={{padding:"6px 10px",fontSize:12,fontWeight:600,color:"var(--text-muted)",borderLeft:"1px solid var(--border)",display:"flex",alignItems:"center",gap:6}}>
                          {s.photo?<img src={s.photo} alt="" style={{width:18,height:18,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>:<div style={{width:18,height:18,borderRadius:"50%",background:isOL(s.id,selectedDate)?"#d1d5db":s.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:8,fontWeight:700,flexShrink:0}}>{s.avatar}</div>}
                          {s.name}{isOL(s.id,selectedDate)&&<span style={{fontSize:9,color:"#991b1b",background:"#fef2f2",padding:"0 4px",borderRadius:4}}>Off</span>}
                        </div>
                      ))}
                    </div>
                    <div style={{maxHeight:"calc(100vh - 400px)",overflowY:"auto"}}>
                    {HOURS.map(hour=>(
                      <div key={hour} style={{display:"grid",gridTemplateColumns:`60px repeat(${filterStaff===0?staffList.length:1},1fr)`,borderBottom:`1px solid ${hour.endsWith(":00")?"var(--border)":"var(--bg)"}`,minHeight:28}}>
                        <div style={{padding:"3px 8px",fontSize:11,color:hour.endsWith(":00")?"#7c3aed":"#d0c8f0",fontWeight:hour.endsWith(":00")?700:400,borderRight:"1px solid var(--border)",lineHeight:"22px"}}>{hour}</div>
                        {staffList.filter(s=>filterStaff===0||s.id===filterStaff).map(s=>{
                          const covering=getSlotBks(selectedDate,hour,s.id);
                          const onLeave=isOL(s.id,selectedDate);
                          return(
                            <div key={s.id} onClick={()=>{if(!onLeave){setAddDate(selectedDate);setAddTime(hour);setShowAdd(true);}}} style={{borderLeft:"1px solid var(--bg)",padding:"3px 5px",minHeight:28,cursor:onLeave?"not-allowed":"pointer",background:onLeave?"repeating-linear-gradient(45deg,#fef2f2,#fef2f2 3px,#fff 3px,#fff 6px)":"transparent"}}>
                              {covering.map(b=>{
                                const sc=BC[b.status]||BC.confirmed;const pc2=PC[b.payStatus]||PC.unpaid;
                                const isStart=b.time===hour;
                                if(!isStart)return<div key={b.id} onClick={e=>{e.stopPropagation();setSelBooking(b);}} style={{background:sc.bg,borderLeft:`3px solid ${sc.br}`,minHeight:36,cursor:"pointer"}}/>;
                                return(
                                  <div key={b.id} onClick={e=>{e.stopPropagation();setSelBooking(b);}} style={{background:sc.bg,border:`1px solid ${sc.br}`,borderRadius:7,padding:"4px 7px",cursor:"pointer",marginBottom:2}}>
                                    <div style={{fontSize:13,fontWeight:700,color:sc.tx,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.customer}</div>
                                    <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
                                      <span style={{fontSize:11,color:"var(--text-muted)",overflow:"hidden",textOverflow:"ellipsis",maxWidth:80}}>{svc(b.service)?.name}</span>
                                      {b.seat&&<span style={{fontSize:10,background:"#f3e8ff",color:"#7e22ce",padding:"0 4px",borderRadius:4,flexShrink:0}}>{b.seat.replace("Seat ","").replace("Room ","R")}</span>}
                                      <span style={{fontSize:10,padding:"0 4px",borderRadius:4,background:pc2.bg,color:pc2.tx,border:`1px solid ${pc2.br}`,fontWeight:600,flexShrink:0}}>{b.payStatus}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
              </>}

              {calView==="month"&&<div style={{padding:"10px 12px"}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
                  {DAY_NAMES.map(d=><div key={d} style={{textAlign:"center",fontSize:12,fontWeight:600,color:"var(--text-muted)",padding:"4px 0"}}>{d}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                  {monthDays.map((date,i)=>{
                    if(!date)return<div key={`e${i}`}/>;
                    const cnt=bookings.filter(b=>b.date===date&&b.status!=="cancelled").length;
                    const pendCnt=bookings.filter(b=>b.date===date&&b.status==="pending").length;
                    const unaCnt=bookings.filter(b=>b.date===date&&b.status==="unassigned").length;
                    const holiday=getHoliday(date);const closed=getClosed(date);
                    const isToday=date===TODAY;const isSel=date===selectedDate;
                    return(
                      <div key={date} onClick={()=>{setSelectedDate(date);setCalView("week");const d=new Date(date);const dy=d.getDay();const base=new Date(d);base.setDate(d.getDate()-dy);setWeekBase(base.toISOString().split("T")[0]);}} style={{minHeight:72,borderRadius:8,border:closed?"2px solid #fca5a5":isSel?"2px solid #9333ea":isToday?"2px solid #c084fc":"1px solid var(--border)",background:closed?"#fef2f2":isSel?"#f3e8ff":isToday?"#fdf4ff":"var(--surface)",cursor:"pointer",padding:"5px 6px"}}>
                        <div style={{fontSize:14,fontWeight:isSel||isToday?700:500,color:isSel?"#7e22ce":isToday?"#9333ea":"var(--text)"}}>{parseInt(date.split("-")[2])}</div>
                        {holiday&&<div style={{fontSize:10,color:"#dc2626",fontWeight:600,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{holiday}</div>}
                        {closed&&<div style={{marginTop:2,padding:"1px 6px",borderRadius:20,display:"inline-block",fontSize:10,fontWeight:700,background:"#ef4444",color:"#fff"}}>Closed</div>}
                        {cnt>0&&<div style={{marginTop:2}}>
                          <div style={{fontSize:11,color:"#7c3aed",fontWeight:700}}>{cnt} appt{cnt>1?"s":""}</div>
                          {pendCnt>0&&<div style={{fontSize:10,color:"#d97706",fontWeight:600}}>{pendCnt} pending</div>}
                          {unaCnt>0&&<div style={{fontSize:10,color:"#9333ea",fontWeight:600}}>{unaCnt} unassigned</div>}
                        </div>}
                        {cnt===0&&!holiday&&!closed&&<div style={{fontSize:10,color:"#d8b4fe",marginTop:2}}>Free</div>}
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:14,marginTop:11,justifyContent:"center",flexWrap:"wrap"}}>
                  {[["#86efac","Confirmed"],["#fbbf24","Pending"],["#a855f7","Unassigned"],["#fca5a5","Closed"],["#dc2626","Public Holiday"]].map(([c,l])=>(
                    <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#64648a"}}><span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}</div>
                  ))}
                </div>
              </div>}
            </div>
          </div>}

          {/* ═══ BOOKINGS ═══ */}
          {tab==="bookings"&&<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div><h1 style={{margin:0,fontSize:26,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>{t("nav.bookings")}</h1><p style={{margin:"3px 0 0",fontSize:13,color:"var(--text-muted)"}}>{bookings.filter(b=>b.status!=="cancelled").length} active bookings</p></div>
              <button onClick={()=>{setAddDate(selectedDate);setShowAdd(true);}} style={pBtn({display:"flex",alignItems:"center",gap:6})}><Icon path={ICONS.plus} size={16}/>New booking</button>
            </div>
            {pendingAll.length>0&&<div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:12,padding:"11px 16px",marginBottom:10,display:"flex",gap:10,alignItems:"center"}}>
              <Icon path={ICONS.clock} size={17} color="#d97706"/>
              <div style={{flex:1,fontWeight:600,color:"#92400e",fontSize:13}}>{pendingAll.length} booking{pendingAll.length>1?"s are":" is"} waiting for your confirmation.</div>
              <span onClick={()=>pendingSectionRef.current?.scrollIntoView({behavior:"smooth",block:"start"})} style={{fontSize:13,fontWeight:700,color:"#b45309",textDecoration:"underline",cursor:"pointer"}}>Review now</span>
            </div>}
            {unassignedAll.length>0&&<div style={{background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:12,padding:"11px 16px",marginBottom:10,display:"flex",gap:10,alignItems:"center"}}>
              <Icon path={ICONS.alert} size={17} color="#9333ea"/><div style={{fontWeight:600,color:"#7e22ce",fontSize:13}}>{unassignedAll.length} unassigned — staff on leave</div>
            </div>}

            {/* Month navigator */}
            <div style={card({padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",position:"relative"})}>
              <button onClick={()=>setBookingMonth(p=>{const m=p.m-1<0?11:p.m-1;return{y:p.m-1<0?p.y-1:p.y,m};})} style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:9,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6d28d9"}}><Icon path={ICONS.chevLeft} size={16}/></button>
              <div onClick={()=>{setPickerYear(bookingMonth.y);setShowMonthPicker(p=>!p);}} style={{minWidth:150,textAlign:"center",cursor:"pointer",borderRadius:8,padding:"4px 10px"}}>
                <div style={{fontSize:17,fontWeight:700,color:"var(--text)"}}>{MONTHS_EN[bookingMonth.m]} {bookingMonth.y}</div>
                <div style={{fontSize:12,color:"var(--text-muted)",marginTop:1}}>{monthTotalCount} booking{monthTotalCount!==1?"s":""} this month</div>
              </div>
              <button onClick={()=>setBookingMonth(p=>{const m=p.m+1>11?0:p.m+1;return{y:p.m+1>11?p.y+1:p.y,m};})} style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:9,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6d28d9"}}><Icon path={ICONS.chevRight} size={16}/></button>
              {!isCurrentBookingMonth&&<button onClick={()=>setBookingMonth({y:Number(TODAY.slice(0,4)),m:Number(TODAY.slice(5,7))-1})} style={gBtn({fontSize:12,padding:"6px 13px",marginLeft:"auto"})}>Back to current month</button>}

              {showMonthPicker&&<>
                <div onClick={()=>setShowMonthPicker(false)} style={{position:"fixed",inset:0,zIndex:399}}/>
                <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"100%",left:0,marginTop:6,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,boxShadow:"0 8px 32px rgba(124,58,237,0.15)",padding:14,width:260,zIndex:400}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <button onClick={()=>setPickerYear(y=>y-1)} style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6d28d9"}}><Icon path={ICONS.chevLeft} size={14}/></button>
                    <span style={{fontSize:14,fontWeight:700,color:"var(--text)"}}>{pickerYear}</span>
                    <button onClick={()=>setPickerYear(y=>y+1)} style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:7,width:28,height:28,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#6d28d9"}}><Icon path={ICONS.chevRight} size={14}/></button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                    {MONTHS_EN.map((mn,mi)=>{const sel=bookingMonth.y===pickerYear&&bookingMonth.m===mi;return(
                      <button key={mn} onClick={()=>{setBookingMonth({y:pickerYear,m:mi});setShowMonthPicker(false);}} style={{padding:"8px 4px",borderRadius:8,border:sel?"2px solid #9333ea":"1px solid var(--border)",background:sel?"#f3e8ff":"var(--bg)",color:sel?"#7e22ce":"var(--text)",fontWeight:sel?700:500,fontSize:12,cursor:"pointer"}}>{mn.slice(0,3)}</button>
                    );})}
                  </div>
                </div>
              </>}
            </div>

            <div style={{display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center"}}>
              <div style={{position:"relative",flex:1,minWidth:200}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",display:"flex",color:"var(--text-muted)"}}><Icon path={ICONS.search} size={15}/></span>
                <input value={bookingSearch} onChange={e=>setBookingSearch(e.target.value)} placeholder="Search customer, phone, or service..." style={{...inp,paddingLeft:36}}/>
                {bookingSearch&&<button onClick={()=>setBookingSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--text-muted)"}}>×</button>}
              </div>
              <div style={{display:"flex",gap:2,background:"var(--bg)",borderRadius:9,padding:3}}>
                {[["date","By Date"],["service","By Service"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setBookingGroupBy(k)} style={{padding:"7px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:bookingGroupBy===k?"#6d28d9":"transparent",color:bookingGroupBy===k?"#fff":"#7e22ce"}}>{l}</button>
                ))}
              </div>
            </div>

            {/* Awaiting Confirmation — always visible regardless of month/search filters */}
            {pendingAll.length>0&&<div ref={pendingSectionRef} style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <Icon path={ICONS.clock} size={20} color="#d97706"/>
                <span style={{fontSize:18,fontWeight:700,color:"var(--text)"}}>Awaiting Confirmation</span>
                <span style={{background:"#fef3c7",color:"#92400e",borderRadius:20,fontSize:12,fontWeight:700,padding:"2px 10px"}}>{pendingAll.length}</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {pendingAll.map(b=>renderBookingCard(b))}
              </div>
            </div>}

            {upcomingGroups.length===0&&<div style={{padding:"30px 0",textAlign:"center",color:"var(--text-muted)",fontSize:13}}>No bookings match your search for {MONTHS_EN[bookingMonth.m]} {bookingMonth.y}.</div>}
            {upcomingGroups.map(([groupName,list])=>(
              <div key={groupName} style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <Icon path={bookingGroupBy==="service"?ICONS.scissors:ICONS.calendar} size={18} color="#7e22ce"/>
                  <span style={{fontSize:18,fontWeight:700,color:"var(--text)"}}>{groupName}</span>
                  <span style={{background:"#f3e8ff",color:"#7e22ce",borderRadius:20,fontSize:12,fontWeight:700,padding:"2px 10px"}}>{list.length}</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {list.map(b=>renderBookingCard(b))}
                </div>
              </div>
            ))}
          </div>}

          {/* ═══ CUSTOMERS ═══ */}
          {tab==="customers"&&(()=>{
            const filtered=allCustomers.filter(c=>{const q=custSearch.toLowerCase();return(!q||c.name.toLowerCase().includes(q)||c.phone.includes(q))&&(custFilter==="all"||(custFilter==="vip"&&c.isVip)||(custFilter==="new"&&c.isNew)||(custFilter==="unpaid"&&c.hasUnpaid));}).sort((a,b2)=>custSort==="name"?a.name.localeCompare(b2.name):custSort==="visits"?b2.count-a.count:custSort==="spend"?b2.spend-a.spend:b2.lastVisit.localeCompare(a.lastVisit));
            if(selCustomer){const c=selCustomer;const extra=customerExtra[c.phone]||{};return(
              <div>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <button onClick={()=>setSelCustomer(null)} style={gBtn({fontSize:12,display:"flex",alignItems:"center",gap:5})}><Icon path={ICONS.chevLeft} size={14}/>Customers</button>
                  <button onClick={()=>setEditCustomer(c)} style={gBtn({fontSize:12,display:"flex",alignItems:"center",gap:5})}><Icon path={ICONS.edit} size={13}/>Edit Info</button>
                </div>
                <div style={card({padding:18,marginBottom:12})}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
                    <div style={{width:50,height:50,borderRadius:"50%",background:"linear-gradient(135deg,#9333ea,#c084fc)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:20,flexShrink:0}}>{c.name[0]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:18,color:"var(--text)",marginBottom:2}}>{c.name}</div>
                      <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:7}}>{c.phone}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {c.isVip&&<span style={{padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#fef9c3",color:"#854d0e",border:"1px solid #fde68a"}}>⭐ VIP</span>}
                        {c.isNew&&<span style={{padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac"}}>New</span>}
                        {!c.isNew&&!c.isVip&&<span style={{padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#f3e8ff",color:"#7e22ce",border:"1px solid #d8b4fe"}}>Regular</span>}
                        {c.hasUnpaid&&<span style={{padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5"}}>Unpaid</span>}
                      </div>
                    </div>
                    <button onClick={()=>{setAddDate(selectedDate);setShowAdd(true);}} style={pBtn({fontSize:12,padding:"7px 13px",display:"flex",alignItems:"center",gap:5})}><Icon path={ICONS.plus} size={13}/>Book</button>
                  </div>
                  {/* Extra info */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
                    {[["IC",extra.ic||"—"],["Email",extra.email||"—"],["Gender",extra.gender==="F"?"Female":extra.gender==="M"?"Male":"—"],["Birthday",extra.birthday?fmtD(extra.birthday):"—"]].map(([l,v])=>(
                      <div key={l} style={{background:"var(--bg)",borderRadius:10,padding:"8px 11px"}}><div style={{fontSize:10,color:"var(--text-muted)"}}>{l}</div><div style={{fontSize:13,fontWeight:500,color:"var(--text)",marginTop:1}}>{v}</div></div>
                    ))}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                    {[{l:"Visits",v:c.count},{l:"Total",v:`RM${c.spend}`},{l:"Avg",v:`RM${c.avg}`},{l:"Fav",v:svc(c.favSvcId)?.name||"—",sm:true}].map(s=>(
                      <div key={s.l} style={{background:"var(--bg)",borderRadius:10,padding:"9px 8px",textAlign:"center"}}><div style={{fontSize:s.sm?11:16,fontWeight:700,color:"#7e22ce",lineHeight:1.2}}>{s.v}</div><div style={{fontSize:10,color:"var(--text-muted)",marginTop:2}}>{s.l}</div></div>
                    ))}
                  </div>
                </div>
                <div style={card({padding:16,marginBottom:12})}>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--text)",marginBottom:8}}>Merchant Note</div>
                  <textarea value={custNoteEdit} onChange={e=>setCustNoteEdit(e.target.value)} onFocus={()=>setCustNoteEdit(custNotes[c.phone]||"")} placeholder="e.g. Allergic to ammonia..." style={{...inp,height:58,resize:"vertical",lineHeight:1.5}}/>
                  <button onClick={()=>{fetch(`/api/customers/${c.phone}/note`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({note:custNoteEdit})}).then(()=>{setCustNotes(p=>({...p,[c.phone]:custNoteEdit}));showToast("Note saved!");});}} style={pBtn({marginTop:8,padding:"7px 14px",fontSize:12})}>Save Note</button>
                </div>
                <div style={card({padding:16})}>
                  <div style={{fontWeight:700,fontSize:13,color:"var(--text)",marginBottom:10}}>Visit History ({c.count})</div>
                  {c.sorted.map((v,i)=>{const sv2=svc(v.service);const st2=stf(v.staff);const pc2=PC[v.payStatus]||PC.unpaid;return(
                    <div key={v.id} style={{display:"flex",gap:10,paddingBottom:10,marginBottom:10,borderBottom:i<c.sorted.length-1?"1px solid #f5f3ff":"none"}}>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}><div style={{width:8,height:8,borderRadius:"50%",background:"#a855f7",flexShrink:0,marginTop:4}}/>{i<c.sorted.length-1&&<div style={{width:1,flex:1,background:"var(--border)",minHeight:14}}/>}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                          <div><div style={{fontWeight:600,fontSize:13,color:"var(--text)"}}>{sv2?.name}</div><div style={{fontSize:11,color:"var(--text-muted)"}}>{fmtD(v.date)}, {v.time}{st2?` · ${st2.name}`:""}{v.seat&&` · ${v.seat}`}</div>{v.txnId&&<div style={{fontSize:10,color:"#b0b0c8",fontFamily:"monospace"}}>#{v.txnId}</div>}</div>
                          <div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:700,fontSize:13,color:"#7e22ce"}}>RM{sv2?.price}</div><span style={{padding:"1px 7px",borderRadius:20,fontSize:10,fontWeight:600,background:pc2.bg,color:pc2.tx,border:`1px solid ${pc2.br}`}}>{v.payStatus}</span></div>
                        </div>
                        {v.remark&&<div style={{marginTop:4,padding:"3px 8px",background:"#f3e8ff",borderRadius:6,fontSize:11,color:"#7e22ce",display:"inline-block"}}>&ldquo;{v.remark}&rdquo;</div>}
                      </div>
                    </div>
                  );})}
                </div>
              </div>
            );}
            return<div>
              <h1 style={{margin:"0 0 16px",fontSize:26,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>{t("nav.customers")}</h1>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:14}}>
                {[{l:"Total",v:allCustomers.length,c:"#7c3aed"},{l:"Returning",v:allCustomers.filter(c=>c.count>1).length,c:"#0891b2"},{l:"New",v:allCustomers.filter(c=>c.isNew).length,c:"#16a34a"},{l:"Revenue",v:`RM${allCustomers.reduce((s,c)=>s+c.spend,0)}`,c:"#d97706"}].map(s=>(
                  <div key={s.l} style={statCard(s.c)}><div style={{fontSize:11,fontWeight:600,color:"var(--text-muted)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.04em"}}>{s.l}</div><div style={{fontSize:26,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>{s.v}</div></div>
                ))}
              </div>
              <div style={{position:"relative",marginBottom:10}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",display:"flex",color:"#c0c0d0"}}><Icon path={ICONS.search} size={15}/></span>
                <input value={custSearch} onChange={e=>setCustSearch(e.target.value)} placeholder="Search name or phone..." style={{...inp,paddingLeft:36}}/>
                {custSearch&&<button onClick={()=>setCustSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#c0c0d0"}}>×</button>}
              </div>
              <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{display:"flex",gap:4}}>
                  {[["all","All"],["vip","VIP"],["new","New"],["unpaid","Unpaid"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setCustFilter(k)} style={{padding:"4px 11px",borderRadius:20,border:custFilter===k?"2px solid #9333ea":"1px solid var(--border)",background:custFilter===k?"#f3e8ff":"#fff",color:custFilter===k?"#7e22ce":"#9090b0",fontSize:12,fontWeight:custFilter===k?700:500,cursor:"pointer"}}>{l}</button>
                  ))}
                </div>
                <select value={custSort} onChange={e=>setCustSort(e.target.value)} style={{marginLeft:"auto",padding:"5px 9px",border:"1px solid var(--border)",borderRadius:8,fontSize:12,outline:"none",color:"var(--text-muted)"}}>
                  {[["recent","Recent"],["name","Name"],["visits","Most Visits"],["spend","Highest Spend"]].map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {filtered.map(c=>(
                  <div key={c.phone} onClick={()=>{setSelCustomer(c);setCustNoteEdit(custNotes[c.phone]||"");}} style={card({padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14})}>
                    <div style={{width:44,height:44,borderRadius:13,background:`linear-gradient(135deg,${c.isVip?"#f59e0b,#fbbf24":"#7c3aed,#c084fc"})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:17,flexShrink:0}}>{c.name[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <span style={{fontWeight:700,fontSize:14,color:"var(--text)"}}>{c.name}</span>
                        {c.isVip&&<span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:"#fef9c3",color:"#854d0e",border:"1px solid #fde68a"}}>⭐ VIP</span>}
                        {c.isNew&&<span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac"}}>New</span>}
                        {c.hasUnpaid&&<span style={{padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5"}}>Unpaid</span>}
                      </div>
                      <div style={{fontSize:12,color:"var(--text-muted)"}}>{c.phone} · Last: <span style={{color:"#7c3aed",fontWeight:600}}>{fmtD(c.lastVisit)}</span></div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontWeight:700,fontSize:15,color:"#7c3aed"}}>RM {c.spend}</div>
                      <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{c.count} visits</div>
                    </div>
                    <Icon path={ICONS.chevRight} size={15} color="var(--text-muted)"/>
                  </div>
                ))}
              </div>
            </div>;
          })()}

          {/* ═══ STAFF ═══ */}
          {tab==="staff"&&<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <div>
                <h1 style={{margin:0,fontSize:26,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>{t("nav.staff")}</h1>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                  <span style={{fontSize:13,color:"var(--text-muted)"}}>Stats for</span>
                  <button onClick={()=>setStaffMonth(p=>{const m=p.m-1<0?11:p.m-1;return{y:p.m-1<0?p.y-1:p.y,m};})} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",padding:0,display:"flex"}}><Icon path={<polyline points="15 18 9 12 15 6"/>} size={15}/></button>
                  <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{MONTHS_EN[staffMonth.m]} {staffMonth.y}</span>
                  <button onClick={()=>setStaffMonth(p=>{const m=p.m+1>11?0:p.m+1;return{y:p.m+1>11?p.y+1:p.y,m};})} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)",padding:0,display:"flex"}}><Icon path={<polyline points="9 18 15 12 9 6"/>} size={15}/></button>
                </div>
              </div>
              <button onClick={()=>setAddStaff(true)} style={pBtn({display:"flex",alignItems:"center",gap:6})}><Icon path={ICONS.plus} size={16}/>Add staff</button>
            </div>
            {unassignedAll.length>0&&<div style={{background:"#fdf4ff",border:"1px solid #e9d5ff",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",gap:9,alignItems:"center"}}><Icon path={ICONS.alert} size={16} color="#9333ea"/><div style={{fontWeight:600,color:"#7e22ce",fontSize:13,flex:1}}>{unassignedAll.length} unassigned</div><button onClick={()=>setTab("bookings")} style={gBtn({fontSize:11,padding:"5px 11px"})}>Assign</button></div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
              {staffList.map(s=>{
                const smStr=`${staffMonth.y}-${String(staffMonth.m+1).padStart(2,"0")}`;
                const monthBks=bookings.filter(b=>b.staff===s.id&&b.status!=="cancelled"&&b.date.startsWith(smStr));
                const monthRev=monthBks.reduce((sum,b)=>sum+(svc(b.service)?.price||0),0);
                const todayLeave=leaveRecords.find(r=>r.staffId===s.id&&r.dates.includes(selectedDate));
                const myLeaves=leaveRecords.filter(r=>r.staffId===s.id);
                return(
                  <div key={s.id} style={card({padding:20})}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
                      <div style={{width:52,height:52,borderRadius:14,background:s.photo?"transparent":(todayLeave?"#d1d5db":s.color),overflow:"hidden",flexShrink:0}}>
                        {s.photo?<img src={s.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:20}}>{s.avatar}</div>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:2}}>{s.name}</div>
                        <div style={{fontSize:12,color:"var(--text-muted)"}}>{s.position}</div>
                        <div style={{fontSize:12,color:"var(--text-muted)"}}>{s.phone}</div>
                      </div>
                      <button onClick={()=>setEditStaff(s)} style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:9,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#7c3aed",flexShrink:0}}><Icon path={ICONS.edit} size={14}/></button>
                    </div>
                    <span style={{padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,marginBottom:14,display:"inline-flex",alignItems:"center",gap:6,...(todayLeave?{background:"#fef2f2",color:"#991b1b",border:"1px solid #fca5a5"}:{background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac"})}}><span style={{width:6,height:6,borderRadius:"50%",background:todayLeave?"#ef4444":"#22c55e",display:"inline-block"}}/>{todayLeave?"On Leave":"Active"}</span>
                    {/* Monthly stats */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14,marginTop:4}}>
                      <div style={{background:"var(--bg)",borderRadius:10,padding:"11px 13px",border:"1px solid var(--border)"}}><div style={{fontSize:10,color:"var(--text-muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Bookings</div><div style={{fontSize:20,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>{monthBks.length}</div></div>
                      <div style={{background:"var(--bg)",borderRadius:10,padding:"11px 13px",border:"1px solid var(--border)"}}><div style={{fontSize:10,color:"var(--text-muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Revenue</div><div style={{fontSize:20,fontWeight:800,color:"#7c3aed",letterSpacing:"-0.5px"}}>RM {monthRev}</div></div>
                    </div>
                    {/* Skills */}
                    {s.skills?.length>0&&<div style={{marginBottom:12}}>
                      <div style={{...sectionLbl,marginBottom:6}}>Skills</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {s.skills.map(sk=><span key={sk} style={{padding:"3px 10px",borderRadius:99,background:"var(--primary-bg,#f3e8ff)",color:"#7c3aed",fontSize:11,fontWeight:600}}>{sk}</span>)}
                      </div>
                    </div>}
                    {/* Emergency contact */}
                    {s.emergencyName&&<div style={{marginBottom:10,padding:"9px 11px",background:"#fef9c3",borderRadius:10,display:"flex",gap:8,alignItems:"flex-start"}}>
                      <Icon path={ICONS.alert} size={15} color="#92400e" strokeWidth={2}/>
                      <div><div style={{fontSize:12,fontWeight:700,color:"#92400e"}}>Emergency contact</div><div style={{fontSize:12,color:"#92400e"}}>{s.emergencyName} · {s.emergencyPhone}</div></div>
                    </div>}
                    {/* Leave records */}
                    {myLeaves.length>0&&<div style={{marginBottom:10,padding:"8px 11px",background:"#fdf4ff",borderRadius:10}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#7e22ce",marginBottom:3}}>Leave Records</div>
                      {myLeaves.slice(-2).map((r,i)=><div key={i} style={{fontSize:11,color:"#7e22ce"}}>{r.dates.length===1?fmtD(r.dates[0]):`${fmtD(r.dates[0])}–${fmtD(r.dates[r.dates.length-1])}`} · {r.leaveType.toUpperCase()}{r.reason&&` · ${r.reason}`}</div>)}
                    </div>}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>setLeaveStaff(s)} style={gBtn({flex:1,padding:"8px 0",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:5})}><Icon path={ICONS.calendar} size={14}/>Mark leave</button>
                      <button onClick={()=>setSchedStaff(s)} style={gBtn({flex:1,padding:"8px 0",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:5})}><Icon path={ICONS.clock} size={14}/>Schedule</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>}

          {/* ═══ SERVICES ═══ */}
          {tab==="services"&&<div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <h1 style={{margin:0,fontSize:26,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>{t("nav.services")}</h1>
              <button onClick={()=>setAddService(true)} style={pBtn({display:"flex",alignItems:"center",gap:6})}><Icon path={ICONS.plus} size={16}/>Add service</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {services.map(s=>(
                <div key={s.id} style={card({padding:"16px 20px",display:"flex",alignItems:"center",gap:14})}>
                  <div style={{width:44,height:44,borderRadius:12,background:"var(--primary-bg,#f3e8ff)",display:"flex",alignItems:"center",justifyContent:"center",color:"#7c3aed",flexShrink:0}}><Icon path={ICONS.scissors} size={20}/></div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:3}}>{s.name}</div>
                    <div style={{fontSize:12,color:"var(--text-muted)",display:"flex",alignItems:"center",gap:4}}><Icon path={ICONS.clock} size={12} color="var(--text-muted)"/>{s.duration} min</div>
                  </div>
                  <div style={{textAlign:"right",marginRight:8}}>
                    <div style={{fontWeight:800,fontSize:18,color:"#7c3aed",letterSpacing:"-0.5px"}}>RM {s.price}</div>
                    <div style={{fontSize:11,color:"var(--text-muted)",marginTop:1}}>per session</div>
                  </div>
                  <button style={gBtn({fontSize:12,padding:"7px 14px"})}>Edit</button>
                </div>
              ))}
            </div>
          </div>}

          {/* ═══ ANALYTICS ═══ */}
          {tab==="analytics"&&<div>
            <h1 style={{margin:"0 0 18px",fontSize:26,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>{t("nav.analytics")}</h1>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:16}}>
              {[{l:"This Month Revenue",v:"RM 1,840",c:"+18%",acc:"#7c3aed"},{l:"Total Bookings",v:"38",c:"+12%",acc:"#0891b2"},{l:"Avg per Booking",v:"RM 120",c:"+5%",acc:"#16a34a"}].map(s=>(
                <div key={s.l} style={statCard(s.acc,{padding:"20px 22px"})}>
                  <div style={{fontSize:11,color:"var(--text-muted)",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em",fontWeight:600}}>{s.l}</div>
                  <div style={{fontSize:28,fontWeight:800,color:"var(--text)",letterSpacing:"-1px",lineHeight:1,marginBottom:6}}>{s.v}</div>
                  <div style={{fontSize:12,color:"#16a34a",fontWeight:700,display:"flex",alignItems:"center",gap:4}}><span>↑</span> {s.c} vs last month</div>
                </div>
              ))}
            </div>
            <div style={card({padding:18,marginBottom:14})}>
              <div style={{fontWeight:700,fontSize:14,color:"var(--text)",marginBottom:12}}>Payment Overview</div>
              <div style={{display:"flex",gap:10}}>
                {Object.entries(PC).map(([k,c])=>{const cnt=bookings.filter(b=>b.payStatus===k).length;const paid=bookings.filter(b=>b.payStatus===k).reduce((s,b)=>s+(b.amtPaid||0),0);const total=bookings.filter(b=>b.payStatus===k).reduce((s,b)=>s+(svc(b.service)?.price||0),0);return(
                  <div key={k} style={{flex:1,padding:"12px 10px",background:c.bg,border:`1px solid ${c.br}`,borderRadius:12,textAlign:"center"}}>
                    <div style={{fontSize:22,fontWeight:700,color:c.tx}}>{cnt}</div>
                    <div style={{fontSize:11,color:c.tx,fontWeight:600,marginBottom:4,textTransform:"capitalize"}}>{k}</div>
                    <div style={{fontSize:10,color:c.tx,opacity:.7}}>Paid: RM{paid}</div>
                    <div style={{fontSize:10,color:c.tx,opacity:.7}}>Total: RM{total}</div>
                  </div>
                );})}
              </div>
            </div>
            <div style={card({padding:18})}>
              <div style={{fontWeight:700,fontSize:14,color:"var(--text)",marginBottom:12}}>Top Services</div>
              {services.map(s=>{const cnt=bookings.filter(b=>b.service===s.id&&b.status!=="cancelled").length;const mx=Math.max(...services.map(sv=>bookings.filter(b=>b.service===sv.id&&b.status!=="cancelled").length),1);return(
                <div key={s.id} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text-muted)",marginBottom:4}}><span>{s.name}</span><span style={{fontWeight:600,color:"#7e22ce"}}>{cnt} · RM{cnt*s.price}</span></div><div style={{height:6,background:"#f3e8ff",borderRadius:3}}><div style={{height:"100%",width:`${(cnt/mx)*100}%`,background:"linear-gradient(90deg,#a855f7,#7e22ce)",borderRadius:3}}/></div></div>
              );})}
            </div>
          </div>}

          {/* ═══ SETTINGS ═══ */}
          {tab==="settings"&&<div>
            <h1 style={{margin:"0 0 20px",fontSize:26,fontWeight:800,color:"var(--text)",letterSpacing:"-0.5px"}}>{t("nav.settings")}</h1>
            <div style={{display:"flex",flexDirection:"column",gap:16,maxWidth:560}}>

              {/* Company Profile */}
              <div style={card({padding:22})}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:16,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>{t("settings.companyProfile")}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div><label style={lbl}>{t("settings.companyName")}</label><input value={profileForm.companyName} onChange={e=>setProfileForm(p=>({...p,companyName:e.target.value}))} style={inp}/></div>
                    <div><label style={lbl}>{t("settings.location")}</label><input value={profileForm.location} onChange={e=>setProfileForm(p=>({...p,location:e.target.value}))} style={inp}/></div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div><label style={lbl}>{t("settings.contactPhone")}</label><input value={profileForm.contactPhone} onChange={e=>setProfileForm(p=>({...p,contactPhone:e.target.value}))} placeholder="+60-12-345 6789" style={inp}/></div>
                    <div><label style={lbl}>{t("settings.personInCharge")}</label><input value={profileForm.personInCharge} onChange={e=>setProfileForm(p=>({...p,personInCharge:e.target.value}))} placeholder="Manager name" style={inp}/></div>
                  </div>
                  <div><label style={lbl}>{t("settings.address")}</label><input value={profileForm.address} onChange={e=>setProfileForm(p=>({...p,address:e.target.value}))} placeholder="Full business address" style={inp}/></div>
                  {/* Social media */}
                  <div style={{marginTop:4}}><div style={{fontSize:11,fontWeight:700,color:"#7e22ce",marginBottom:8,letterSpacing:0.4,textTransform:"uppercase"}}>{t("settings.socialMedia")}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[["facebook","📘 Facebook"],["instagram","📸 Instagram"],["tiktok","🎵 TikTok"],["xhs","🌸 XHS / 小红书"],["youtube","▶️ YouTube"],["twitter","🐦 Twitter / X"],["whatsapp","💬 WhatsApp Business"]].map(([k,pl])=>(
                        <div key={k} style={k==="whatsapp"?{gridColumn:"1/-1"}:{}}><label style={lbl}>{pl}</label><input value={profileForm[k]} onChange={e=>setProfileForm(p=>({...p,[k]:e.target.value}))} placeholder={`${pl} URL or handle`} style={inp}/></div>
                      ))}
                    </div>
                  </div>
                  <button onClick={()=>handleSaveSettings(profileForm)} style={pBtn({padding:"9px 0",fontSize:13,alignSelf:"flex-start",paddingLeft:18,paddingRight:18})}>{t("settings.save")}</button>
                </div>
              </div>

              {/* Appearance */}
              <div style={card({padding:22})}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:14,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>{t("settings.appearance")}</div>
                <div style={{display:"flex",gap:2,background:"var(--bg)",borderRadius:9,padding:3,width:"fit-content"}}>
                  {[["light",t("settings.light")],["dark",t("settings.dark")]].map(([k,l])=>(
                    <button key={k} onClick={()=>setTheme(k)} style={{padding:"7px 16px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:theme===k?"#6d28d9":"transparent",color:theme===k?"#fff":"#7e22ce"}}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div style={card({padding:22})}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:14,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>{t("settings.language")}</div>
                <div style={{display:"flex",gap:2,background:"var(--bg)",borderRadius:9,padding:3,width:"fit-content"}}>
                  {[["en","English"],["zh","中文"],["ms","Bahasa Melayu"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setLanguage(k)} style={{padding:"7px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:language===k?"#6d28d9":"transparent",color:language===k?"#fff":"#7e22ce"}}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div style={card({padding:22})}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:14,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>{t("settings.notifications")}</div>
                <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",fontSize:13,color:"var(--text)",marginBottom:12}}>
                  <input type="checkbox" checked={settings.notifyOnPending} onChange={e=>handleSaveSettings({notifyOnPending:e.target.checked})} style={{width:16,height:16,cursor:"pointer"}}/>
                  {t("settings.notifyOnPending")}
                </label>
                <div><label style={lbl}>{t("settings.notifyTiming")}</label>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {[[10,"10 min"],[30,"30 min"],[60,"1 hour"],[120,"2 hours"],[1440,"1 day"]].map(([v,l])=>(
                      <button key={v} onClick={()=>handleSaveSettings({notifyBefore:v})} style={{padding:"6px 14px",borderRadius:8,border:settings.notifyBefore===v?"2px solid #7e22ce":"1px solid var(--border)",background:settings.notifyBefore===v?"#f3e8ff":"var(--surface)",color:settings.notifyBefore===v?"#7e22ce":"var(--text-muted)",fontWeight:settings.notifyBefore===v?700:400,fontSize:12,cursor:"pointer"}}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Account & Email */}
              <div style={card({padding:22})}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:14,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>{t("settings.account")}</div>
                {settings.email?(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",background:settings.emailVerified?"#f0fdf4":"#fffbeb",borderRadius:10,border:`1px solid ${settings.emailVerified?"#86efac":"#fcd34d"}`}}>
                      <span style={{fontSize:18}}>{settings.emailVerified?"✅":"⏳"}</span>
                      <div><div style={{fontWeight:600,fontSize:13,color:"var(--text)"}}>{settings.email}</div><div style={{fontSize:11,color:settings.emailVerified?"#15803d":"#92400e"}}>{settings.emailVerified?t("settings.verified"):t("settings.verifyPending")}</div></div>
                    </div>
                    {!settings.emailVerified&&emailForm.verifyUrl&&<div style={{padding:"8px 12px",background:"#f3e8ff",borderRadius:8,fontSize:11,color:"#7e22ce"}}>Dev mode — <a href={emailForm.verifyUrl} target="_blank" rel="noreferrer" style={{color:"#7e22ce",fontWeight:700}}>click here to verify</a></div>}
                    <button onClick={()=>setSettings(s=>({...s,email:null,emailVerified:false}))&&fetch("/api/settings/register-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:""})}).catch(()=>{})} style={gBtn({fontSize:12,padding:"7px 14px",alignSelf:"flex-start",color:"#991b1b",borderColor:"#fca5a5"})}>Change Email</button>
                  </div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <p style={{margin:0,fontSize:13,color:"var(--text-muted)"}}>Register an email to enable email-based login and account recovery.</p>
                    <div><label style={lbl}>{t("settings.registerEmail")}</label><input type="email" value={emailForm.email} onChange={e=>setEmailForm(p=>({...p,email:e.target.value}))} placeholder={t("settings.emailPlaceholder")} style={inp}/></div>
                    <button onClick={()=>{
                      if(!emailForm.email||!emailForm.email.includes("@")){return;}
                      fetch("/api/settings/register-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:emailForm.email})})
                        .then(r=>r.json()).then(d=>{
                          if(d.ok){
                            setSettings(s=>({...s,email:emailForm.email,emailVerified:false}));
                            setEmailForm(p=>({...p,token:d.token,verifyUrl:d.verifyUrl,sent:true}));
                            showToast("Verification email sent!");
                          }
                        });
                    }} style={pBtn({padding:"9px 0",fontSize:13,alignSelf:"flex-start",paddingLeft:18,paddingRight:18})}>Register Email</button>
                    {emailForm.sent&&emailForm.verifyUrl&&<div style={{padding:"8px 12px",background:"#f3e8ff",borderRadius:8,fontSize:11,color:"#7e22ce"}}>Dev mode — <a href={`http://localhost:4000${emailForm.verifyUrl}`} target="_blank" rel="noreferrer" style={{color:"#7e22ce",fontWeight:700}}>click here to verify your email</a></div>}
                  </div>
                )}
              </div>

              {/* Update Password */}
              <div style={card({padding:22})}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:14,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>{t("settings.updatePassword")}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div><label style={lbl}>{t("settings.currentPassword")}</label><input type="password" value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))} style={inp}/></div>
                  <div><label style={lbl}>{t("settings.newPassword")}</label><input type="password" value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))} style={inp}/></div>
                  <div><label style={lbl}>{t("settings.confirmPassword")}</label><input type="password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} style={inp}/></div>
                  {pwMsg&&<div style={{fontSize:12,color:pwMsg.ok?"#15803d":"#991b1b"}}>{pwMsg.text}</div>}
                  <button onClick={()=>{
                    if(!pwForm.next||pwForm.next!==pwForm.confirm){setPwMsg({ok:false,text:"New password and confirmation do not match."});return;}
                    handleChangePassword(pwForm.current,pwForm.next).then(res=>{
                      if(res.ok){setPwMsg({ok:true,text:"Password updated!"});setPwForm({current:"",next:"",confirm:""});}
                      else setPwMsg({ok:false,text:res.error||"Current password is incorrect."});
                    });
                  }} style={pBtn({padding:"9px 0",fontSize:13,alignSelf:"flex-start",paddingLeft:18,paddingRight:18})}>{t("settings.changePassword")}</button>
                </div>
              </div>

              {/* Export Report */}
              <div style={card({padding:22})}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:14,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>{t("settings.exportReport")}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <button onClick={()=>exportReport("weekly")} style={gBtn({fontSize:12,padding:"8px 14px"})}>{t("settings.exportWeekly")}</button>
                  <button onClick={()=>exportReport("monthly")} style={gBtn({fontSize:12,padding:"8px 14px"})}>{t("settings.exportMonthly")}</button>
                  <button onClick={()=>exportReport("yearly")} style={gBtn({fontSize:12,padding:"8px 14px"})}>{t("settings.exportYearly")}</button>
                </div>
              </div>

              {/* Sign Out */}
              <div style={card({padding:22})}>
                <div style={{fontWeight:700,fontSize:15,color:"var(--text)",marginBottom:4,paddingBottom:12,borderBottom:"1px solid var(--border)"}}>Sign Out</div>
                <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:12}}>You will be returned to the login screen.</div>
                <button onClick={()=>{sessionStorage.removeItem("beaubook_authed");setAuthed(false);}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:10,border:"1px solid #fca5a5",background:"#fef2f2",color:"#991b1b",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>

            </div>
          </div>}
        </main>
      </div>

      {/* ─── MODALS ─── */}
      <AddModal show={showAdd} onClose={()=>setShowAdd(false)} onAdd={handleAddBooking} initialDate={addDate} initialTime={addTime} leaveRecords={leaveRecords} staffList={staffList} services={services}/>
      <DetailModal booking={selBooking} onClose={()=>{setSelBooking(null);setNotifTriggered(false);}} onAccept={handleAccept} onCancel={handleCancel} onSave={handleSaveEdit} onReschedule={handleReschedule} leaveRecords={leaveRecords} staffList={staffList} services={services} autoEdit={notifTriggered}/>
      <LeaveModal staffMember={leaveStaff} bookings={bookings} staffList={staffList} services={services} onClose={()=>setLeaveStaff(null)} onConfirm={handleLeave}/>
      <ScheduleModal staffMember={schedStaff} schedule={schedStaff?schedules[schedStaff.id]:null} onClose={()=>setSchedStaff(null)} onSave={handleSaveSched}/>
      {editStaff&&<StaffModal staffMember={editStaff} onClose={()=>setEditStaff(null)} onSave={handleSaveStaff} isNew={false}/>}
      {addStaff&&<StaffModal staffMember={null} onClose={()=>setAddStaff(false)} onSave={handleSaveStaff} isNew={true}/>}
      {editCustomer&&<CustomerEditModal customer={editCustomer} extraData={customerExtra[editCustomer.phone]} onClose={()=>setEditCustomer(null)} onSave={handleSaveCustomer}/>}
      <CloseDayModal show={showCloseDay} onClose={()=>setShowCloseDay(false)} initialDate={selectedDate} closedDates={closedDates} closedWeekdays={closedWeekdays} onMark={handleMarkClosed} onUnmark={handleUnmarkClosed} onMarkWeekday={handleMarkClosedWeekday} onUnmarkWeekday={handleUnmarkClosedWeekday}/>
      {addService&&<ServiceModal onClose={()=>setAddService(false)} onSave={handleAddService}/>}
      <NotifPanel show={showNotif} onClose={()=>setShowNotif(false)} bookings={bookings} services={services} onSelectBooking={(b)=>{setSelBooking(b);setNotifTriggered(true);setShowNotif(false);setTab("bookings");}}/>
    </div>
  );
}
