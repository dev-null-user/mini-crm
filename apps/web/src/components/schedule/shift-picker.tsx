'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { shiftKey, validTime } from '@/lib/schedule-utils';
import { type Employee, type Shift, type ShiftTemplate } from './data';

export type ShiftPickerTarget =
  | { kind:'date'; date:string }
  | { kind:'cell'; date:string; employeeId:string }
  | { kind:'selection' };

type Props={
  target:ShiftPickerTarget;
  employees:Employee[];
  shifts:Record<string,Shift>;
  templates:ShiftTemplate[];
  templatesLoading:boolean;
  templatesError:boolean;
  busy:boolean;
  scheduleUnavailable:boolean;
  selectedCount:number;
  onApply:(keys:string[]|null,templateId:string,start:string,end:string)=>Promise<boolean>;
  onClear:(keys:string[])=>Promise<boolean>;
  onClose:()=>void;
};

export function ShiftPicker(p:Props){
  const dialogRef=useRef<HTMLDialogElement>(null);
  const [employeeId,setEmployeeId]=useState(p.target.kind==='cell'?p.target.employeeId:'');
  const date=p.target.kind==='selection'?'':p.target.date;
  const key=employeeId&&date?shiftKey(employeeId,date):'';
  const shift=key?p.shifts[key]:undefined;
  const [start,setStart]=useState(shift?.start??'09:00');
  const [end,setEnd]=useState(shift?.end??'17:00');
  const [error,setError]=useState('');

  useEffect(()=>{dialogRef.current?.showModal();},[]);

  const chooseEmployee=(id:string)=>{
    setEmployeeId(id);
    const current=p.shifts[shiftKey(id,date)];
    setStart(current?.start??'09:00');
    setEnd(current?.end??'17:00');
    setError('');
  };
  const apply=async(templateId:string,from:string,to:string)=>{
    if(p.target.kind!=='selection'&&!key){setError('Выберите сотрудника.');return;}
    if(!validTime(from)||!validTime(to)||from===to){setError('Проверьте время смены.');return;}
    if(await p.onApply(p.target.kind==='selection'?null:[key],templateId,from,to)) p.onClose();
    else setError('Не удалось сохранить смену. Повторите попытку.');
  };
  const employee=p.employees.find(item=>item.id===employeeId);
  const dateLabel=date?new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${date}T12:00:00`)):'';

  return <dialog ref={dialogRef} onCancel={e=>{if(p.busy)e.preventDefault();}} onClose={p.onClose} aria-labelledby="shift-picker-title" className="m-auto w-[min(360px,calc(100%-32px))] rounded-xl border-0 bg-white p-4 text-[#25252c] shadow-xl backdrop:bg-black/35">
    <div className="flex items-start justify-between gap-3">
      <div><h2 id="shift-picker-title" className="text-sm font-medium">{shift?'Изменить смену':'Назначить смену'}</h2>
        <p className="mt-1 text-xs text-[#858993]">{p.target.kind==='selection'?`Выбрано ячеек: ${p.selectedCount}`:dateLabel}</p></div>
      <button type="button" disabled={p.busy} onClick={p.onClose} aria-label="Закрыть" className="rounded p-1 hover:bg-[#f1f2f6]"><X className="size-4"/></button>
    </div>
    {p.scheduleUnavailable&&<p role="status" className="mt-2 text-xs text-[#858993]">Обновление графика. При ошибке закройте окно и повторите загрузку.</p>}
    <fieldset disabled={p.busy||p.scheduleUnavailable}>
    {p.target.kind==='date'?<label className="mt-4 block text-xs">Сотрудник
      <select value={employeeId} onChange={e=>chooseEmployee(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-[#e2e4e9] bg-white px-2 text-xs">
        <option value="">Выберите сотрудника</option>
        {p.employees.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}
      </select>
      {p.employees.length===0&&<span className="mt-1 block text-[#858993]">Нет доступных сотрудников.</span>}
    </label>:p.target.kind==='cell'&&<p className="mt-4 text-xs">{employee?.name??'Сотрудник'}</p>}
    {shift&&<p className="mt-2 text-xs text-[#858993]">Текущая смена: {shift.start}–{shift.end}</p>}
    <h3 className="mb-2 mt-4 text-xs font-medium">Выберите шаблон</h3>
    <div className="grid gap-1.5">
      {p.templatesLoading?<p className="text-xs text-[#858993]">Загрузка шаблонов…</p>:p.templatesError?<p className="text-xs text-[#c43b42]">Не удалось загрузить шаблоны.</p>:p.templates.length===0?<p className="text-xs text-[#858993]">Нет доступных шаблонов.</p>:null}
      {p.templates.map(template=><button key={template.id} type="button" onClick={()=>apply(template.id,template.start,template.end)} className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-xs hover:brightness-95 ${template.color}`}><span>{template.title}</span><span>{template.start}–{template.end}</span></button>)}
    </div>
    <h3 className="mb-2 mt-4 text-xs font-medium">Своё время</h3>
    <div className="grid grid-cols-2 gap-2">
      <label className="text-xs text-[#858993]">Начало<Input type="time" value={start} onChange={e=>setStart(e.target.value)} className="mt-1 h-9 text-xs"/></label>
      <label className="text-xs text-[#858993]">Конец<Input type="time" value={end} onChange={e=>setEnd(e.target.value)} className="mt-1 h-9 text-xs"/></label>
    </div>
    {error&&<p role="alert" className="mt-2 text-xs text-[#c43b42]">{error}</p>}
    <div className="mt-4 flex items-center justify-between gap-2">
      {shift?<button type="button" onClick={async()=>{if(await p.onClear([key]))p.onClose();else setError('Не удалось удалить смену. Повторите попытку.');}} className="rounded px-2 py-2 text-xs text-[#c43b42] hover:bg-[#fae7e8]">Удалить смену</button>:<span/>}
      <button type="button" onClick={()=>apply('custom',start,end)} className="rounded-md bg-[#383940] px-3 py-2 text-xs text-white hover:bg-[#50515a]">Применить время</button>
    </div>
    {p.busy&&<p role="status" className="mt-2 text-xs text-[#858993]">Сохранение…</p>}
    </fieldset>
  </dialog>;
}
