"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Eye, Plus, Search } from "lucide-react";
import { mockReports } from "@/data/mockReports";
import ReportStatusBadge from "@/components/reports/ReportStatusBadge";
import ReportDetail from "@/components/reports/ReportDetail";
import WasteMaterialForm from "@/components/forms/WasteMaterialForm";
import ThreadUsageForm, { ThreadUsageFormData } from "@/components/forms/ThreadUsageForm";
import { Report } from "@/types/report";
import { ThreadUsageReport } from "@/types/threadUsage";

const titles:Record<string,{title:string;department:Report["department"]}>={
 "laporan-produksi-maizena":{title:"Laporan Produksi Maizena",department:"Produksi"},
 "laporan-produksi-maizena-rk":{title:"Laporan Produksi Maizena RK",department:"Produksi"},
 "laporan-produksi-sagu":{title:"Laporan Produksi Sagu",department:"Produksi"},
 "produksi-tapioka-1kg":{title:"Produksi Tapioka 1 kg",department:"Produksi"},
 "produksi-tapioka-200gr":{title:"Produksi Tapioka 200 gr",department:"Produksi"},
 "produksi-tapioka-500gr":{title:"Produksi Tapioka 500 gr",department:"Produksi"},
 "produksi-tapioka-2kg":{title:"Produksi Tapioka 2 kg",department:"Produksi"},
 "timbangan-hasil-produksi":{title:"Timbangan Hasil Produksi",department:"Produksi"},
 "pemakaian-bahan-baku-produksi":{title:"Pemakaian Bahan Baku Produksi",department:"Produksi"},
 "pemakaian-benang":{title:"Pemakaian Benang",department:"Gudang"},
 "pemakaian-karung":{title:"Pemakaian Karung",department:"Gudang"},
 "serah-terima-hasil-produksi":{title:"Serah Terima Hasil Produksi",department:"Gudang"},
 "laporan-plastik-kardus-bekas":{title:"Laporan Harian Plastik/Kardus Bekas",department:"Operasional"},
 "laporan-staff-gudang":{title:"Laporan Staff Gudang",department:"Absensi"},
 "laporan-penanggung-jawab":{title:"Laporan Penanggung Jawab",department:"Absensi"},
 "laporan-petugas-kebersihan":{title:"Laporan Petugas Kebersihan",department:"Absensi"},
};

export default function ReportCategoryPage(){
 const params=useParams<{slug:string}>(); const slug=params.slug;
 const meta=titles[slug]??{title:"Daftar Laporan",department:"Operasional"};
 const [search,setSearch]=useState(""); const [status,setStatus]=useState("all"); const [date,setDate]=useState("");
 const [selected,setSelected]=useState<Report|ThreadUsageReport|null>(null); const [form,setForm]=useState(false);
 const [localReports,setLocalReports]=useState<ThreadUsageReport[]>([]);
 const [notice,setNotice]=useState("");
 const rows=[...localReports,...mockReports].filter(r=>(!search||r.reportName.toLowerCase().includes(search.toLowerCase())||r.reportNumber.toLowerCase().includes(search.toLowerCase()))&&(status==="all"||r.status===status)&&(!date||r.reportDate===date)&&(r.department===meta.department||(slug==="laporan-plastik-kardus-bekas"&&r.department==="Operasional")));
 const saveThreadReport=(data:ThreadUsageFormData)=>{
   const id=Date.now().toString();
   const report:ThreadUsageReport={
     id,
     reportNumber:`GDG-${data.reportDate.replace(/-/g,"")}-${id.slice(-4)}`,
     reportName:meta.title,
     department:"Gudang",
     reportDate:data.reportDate,
     submittedBy:data.submittedBy,
     status:data.status,
     createdAt:new Date().toISOString(),
     machineUsage:data.machineUsage,
   };
   setLocalReports(current=>[report,...current]);
   setNotice(data.status==="draft"?"Draft Pemakaian Benang tersimpan sementara di sesi ini.":"Laporan Pemakaian Benang berhasil disubmit.");
   setForm(false);
 };
 if(form&&slug==="pemakaian-benang") return <div><button onClick={()=>setForm(false)} className="mb-4 text-sm font-semibold text-[#217a54]">← Kembali ke daftar</button><ThreadUsageForm onSave={saveThreadReport}/></div>;
 if(form&&slug==="laporan-plastik-kardus-bekas") return <div><button onClick={()=>setForm(false)} className="mb-4 text-sm font-semibold text-[#217a54]">← Kembali ke daftar</button><WasteMaterialForm onSuccess={()=>setForm(false)}/></div>;
 return <div className="space-y-5">
   <div><p className="text-sm text-slate-500">{meta.department} / Daftar Laporan</p><h2 className="mt-1 text-xl font-bold">{meta.title}</h2><p className="mt-1 text-sm text-slate-500">Kelola, cari, dan tinjau laporan {meta.title.toLowerCase()}.</p></div>
   <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-col gap-3 md:flex-row">
     <div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm" placeholder="Cari nomor atau nama laporan"/></div>
     <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"/>
     <select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="all">Semua status</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="under_review">Under Review</option><option value="revision_requested">Revision Requested</option><option value="approved">Approved</option><option value="collected">Collected</option></select>
      {slug==="laporan-plastik-kardus-bekas"||slug==="pemakaian-benang" ? <button onClick={()=>setForm(true)} className="flex items-center justify-center gap-2 rounded-lg bg-[#247f58] px-4 py-2 text-sm font-semibold text-white"><Plus size={17}/>Tambah Laporan</button> : <button onClick={()=>{setNotice("Form laporan detail untuk kategori ini akan disiapkan pada fase berikutnya.");setTimeout(()=>setNotice(""),3500)}} className="flex items-center justify-center gap-2 rounded-lg bg-[#247f58] px-4 py-2 text-sm font-semibold text-white"><Plus size={17}/>Tambah Laporan</button>}
   </div></div>
    {notice&&<div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{notice}</div>}
   <div className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Nomor</th><th className="px-5 py-3">Nama Laporan</th><th className="px-5 py-3">Pengirim</th><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y">{rows.length?rows.map(r=><tr key={r.id} className="hover:bg-slate-50"><td className="px-5 py-3 font-medium">{r.reportNumber}</td><td className="px-5 py-3">{r.reportName}</td><td className="px-5 py-3">{r.submittedBy}</td><td className="px-5 py-3">{r.reportDate}</td><td className="px-5 py-3"><ReportStatusBadge status={r.status}/></td><td className="px-5 py-3"><button onClick={()=>setSelected(r)} className="rounded p-1.5 hover:bg-slate-100"><Eye size={17}/></button></td></tr>):<tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Tidak ada laporan yang cocok.</td></tr>}</tbody></table></div></div>
   <ReportDetail report={selected} onClose={()=>setSelected(null)} />
 </div>;
}
