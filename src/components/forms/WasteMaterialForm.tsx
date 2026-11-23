"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { mockEmployees } from "@/data/mockEmployees";

const materialTypes = [
  "Karung bekas 25 kg",
  "Karung bekas 50 kg",
  "Kardus bekas",
  "Plastik daun bekas",
  "Plastik PE bekas",
] as const;

type MaterialType = (typeof materialTypes)[number];
type Row={id:number; material:MaterialType; weight:string; quantity:string; quantityUnit:"kg"|"bal"};

export default function WasteMaterialForm({ onSuccess }: { onSuccess:()=>void }) {
  const [rows,setRows]=useState<Row[]>([{id:1,material:materialTypes[0],weight:"",quantity:"",quantityUnit:"kg"}]);
  const [date,setDate]=useState("2026-11-23");
  const [employee,setEmployee]=useState("");
  const [department,setDepartment]=useState("Operasional");
  const [notes,setNotes]=useState("");
  const [errors,setErrors]=useState<string[]>([]);
  const [toast,setToast]=useState("");
  const total=rows.reduce((sum,r)=>sum+(Number(r.weight)||0),0);

  const submit=(draft=false)=>{
    const next=[];
    if(!date) next.push("Tanggal laporan wajib diisi");
    if(!employee) next.push("Pegawai pelapor wajib dipilih");
    if(!department) next.push("Departemen wajib dipilih");
    if(rows.some(r=>!r.weight||Number(r.weight)<=0||!r.quantity||Number(r.quantity)<=0)) next.push("Lengkapi berat dan jumlah barang setiap material");
    setErrors(next);
    if(next.length) return;
    setToast(draft ? "Draft berhasil disimpan." : "Laporan berhasil disubmit.");
    setTimeout(()=>setToast(""),3500);
    if(!draft) onSuccess();
  };

  return <div className="mx-auto max-w-5xl">
    {toast && <div className="fixed right-4 top-20 z-[70] rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg">{toast}</div>}
    {errors.length>0 && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="font-semibold">Periksa kembali isian berikut:</p><ul className="mt-1 list-disc pl-5">{errors.map(e=><li key={e}>{e}</li>)}</ul></div>}
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b px-5 py-4"><h2 className="font-bold">Informasi Laporan</h2></div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <label className="text-sm font-medium">Tanggal laporan *<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#2e9e6b]"/></label>
        <label className="text-sm font-medium">Pegawai pelapor *<select value={employee} onChange={e=>setEmployee(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#2e9e6b]"><option value="">Pilih pegawai</option>{mockEmployees.map(e=><option key={e}>{e}</option>)}</select></label>
        <label className="text-sm font-medium">Departemen *<select value={department} onChange={e=>setDepartment(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-[#2e9e6b]"><option>Operasional</option><option>Gudang</option><option>Produksi</option></select></label>
      </div>
      <div className="border-t px-5 py-4"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Daftar Material</h2><button onClick={()=>setRows(v=>[...v,{id:Date.now(),material:materialTypes[0],weight:"",quantity:"",quantityUnit:"kg"}])} className="flex items-center gap-1.5 rounded-lg border border-[#2e9e6b] px-3 py-2 text-sm font-semibold text-[#217a54] hover:bg-emerald-50"><Plus size={16}/>Tambah Baris</button></div>
        <div className="space-y-3">{rows.map((r,index)=><div key={r.id} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_1fr_40px]">
          <label className="text-xs font-medium text-slate-600">Nama barang<select value={r.material} onChange={e=>{const material=materialTypes.find(type=>type===e.target.value);if(material)setRows(v=>v.map(x=>x.id===r.id?{...x,material}:x));}} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5">{materialTypes.map(material=><option key={material}>{material}</option>)}</select></label>
          <label className="text-xs font-medium text-slate-600">Berat (kg)<input type="number" min="0" step="0.1" value={r.weight} onChange={e=>setRows(v=>v.map(x=>x.id===r.id?{...x,weight:e.target.value}:x))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5" placeholder="0"/></label>
          <label className="text-xs font-medium text-slate-600">Jumlah barang<div className="mt-1 flex"><input type="number" min="0" step={r.quantityUnit==="kg"?"0.1":"1"} value={r.quantity} onChange={e=>setRows(v=>v.map(x=>x.id===r.id?{...x,quantity:e.target.value}:x))} className="min-w-0 flex-1 rounded-l-lg border border-slate-300 px-3 py-2.5" placeholder="0"/><select aria-label="Satuan jumlah barang" value={r.quantityUnit} onChange={e=>setRows(v=>v.map(x=>x.id===r.id?{...x,quantityUnit:e.target.value as "kg"|"bal"}:x))} className="rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 px-3 py-2.5"><option value="kg">kg</option><option value="bal">bal</option></select></div></label>
          <button disabled={rows.length===1} onClick={()=>setRows(v=>v.filter(x=>x.id!==r.id))} className="mt-5 grid h-10 w-10 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30" aria-label={`Hapus baris ${index+1}`}><Trash2 size={17}/></button>
        </div>)}</div>
        <div className="mt-4 flex justify-end rounded-lg bg-slate-50 px-4 py-3"><span className="mr-3 text-sm text-slate-500">Total Berat</span><strong>{total.toLocaleString("id-ID")} kg</strong></div>
      </div>
      <div className="border-t px-5 py-4"><label className="text-sm font-medium">Catatan<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" placeholder="Tambahkan catatan operasional..."/></label></div>
      <div className="flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end"><button onClick={()=>submit(true)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">Simpan Draft</button><button onClick={()=>submit(false)} className="rounded-lg bg-[#247f58] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d6d4b]">Submit Laporan</button></div>
    </div>
  </div>;
}
