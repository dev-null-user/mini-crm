'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { type Employee, type Shift, type ShiftTemplate } from '@/components/schedule/data';
import { addDays, countShiftsByDate, dateKey, getDays, shiftKey, validTime, type SelectionMode, type ViewMode } from '@/lib/schedule-utils';

type ApiEmployee={id:string;fullName:string;role:string;weeklyTargetMinutes:number};
type ApiTemplate={id:string;name:string;startTime:string;endTime:string;breakMinutes:number};
type ApiShift={employeeId:string;shiftDate:string;startTime:string;endTime:string;templateId:string|null};
type ApiSchedule={shifts:ApiShift[];published:boolean};
function scheduleShifts(items:ApiShift[]):Record<string,Shift> {
  return Object.fromEntries(items.map(item=>[shiftKey(item.employeeId,item.shiftDate),{
    employeeId:item.employeeId,date:item.shiftDate,start:item.startTime.slice(0,5),end:item.endTime.slice(0,5),templateId:item.templateId??'custom',
  }]));
}
const palette=[
  {color:'bg-[#e9eefc] text-[#3b5fcf]',marker:'border-[#b8c8fe]'},
  {color:'bg-[#ebdefe] text-[#7750bb]',marker:'border-[#d7aff8]'},
  {color:'bg-[#dcf7f4] text-[#208f87]',marker:'border-[#8de8de]'},
];

async function apiRequest<T>(path:string,options?:RequestInit):Promise<T> {
  const baseUrl=(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/,'');
  const response=await fetch(`${baseUrl}/api/v1${path}`,options);
  if(!response.ok){
    const result=await response.json().catch(()=>null) as {error?:{message?:string}}|null;
    throw new Error(result?.error?.message||'Не удалось выполнить запрос к API.');
  }
  return (await response.json() as {data:T}).data;
}

async function searchEmployees(query:string,signal:AbortSignal):Promise<Employee[]> {
  const params=new URLSearchParams({fullName:query.trim()});
  const data=await apiRequest<ApiEmployee[]>(`/employees/search?${params}`,{signal});
  return data.map(employee=>({
    id:employee.id,
    name:employee.fullName,
    title:`${employee.role==='agent'?'агент':employee.role} · ${employee.weeklyTargetMinutes/60} ч`,
  }));
}

export function useScheduleEditor() {
  const [view, setView]=useState<ViewMode>('week');
  const [focusDate,setFocusDate]=useState(()=>new Date());
  const [ready,setReady]=useState(false);
  const [query,setQuery]=useState('');
  const [allEmployees,setAllEmployees]=useState<Employee[]>([]);
  const [searchResults,setSearchResults]=useState<Employee[]>([]);
  const [allEmployeesLoading,setAllEmployeesLoading]=useState(true);
  const [allEmployeesError,setAllEmployeesError]=useState(false);
  const [searchLoading,setSearchLoading]=useState(false);
  const [searchError,setSearchError]=useState(false);
  const [selected,setSelected]=useState<Set<string>>(()=>new Set());
  const [shifts,setShifts]=useState<Record<string,Shift>>({});
  const [templates,setTemplates]=useState<ShiftTemplate[]>([]);
  const [templatesLoading,setTemplatesLoading]=useState(true);
  const [templatesError,setTemplatesError]=useState(false);
  const [templatesReload,setTemplatesReload]=useState(0);
  const [scheduleLoading,setScheduleLoading]=useState(true);
  const [scheduleError,setScheduleError]=useState(false);
  const [reload,setReload]=useState(0);
  const [busy,setBusy]=useState(false);
  const busyRef=useRef(false);
  const [startTime,setStartTime]=useState('09:00');
  const [endTime,setEndTime]=useState('17:00');
  const [notice,setNotice]=useState('');
  const [published,setPublished]=useState(false);
  const dragActive=useRef(false);
  const dragStart=useRef('');
  const didDrag=useRef(false);
  const selectionBeforeDrag=useRef<Set<string>>(new Set());
  const dragMode=useRef<SelectionMode>('add');

  const days=useMemo(()=>getDays(focusDate,view),[focusDate,view]);
  const firstDay=days[0],lastDay=days[days.length-1];
  const startDate=dateKey(firstDay),endDate=dateKey(lastDay);
  const searching=Boolean(query.trim());
  const filteredEmployees=searching?searchResults:allEmployees;
  const employeesLoading=searching?searchLoading:allEmployeesLoading;
  const employeesError=searching?searchError:allEmployeesError;
  const selectedEmployeesCount=new Set([...selected].map(x=>x.split('|')[0])).size;
  const selectedDatesCount=new Set([...selected].map(x=>x.split('|')[1])).size;

  useEffect(()=>{setReady(true);},[]);

  useEffect(()=>{
    const controller=new AbortController();
    searchEmployees('',controller.signal).then(employees=>{
      if(!controller.signal.aborted){setAllEmployees(employees);setAllEmployeesLoading(false);}
    }).catch(()=>{
      if(!controller.signal.aborted){setAllEmployeesError(true);setAllEmployeesLoading(false);}
    });
    return ()=>controller.abort();
  },[]);

  useEffect(()=>{
    if(!query.trim()) return;
    const controller=new AbortController();
    setSearchLoading(true);
    setSearchError(false);
    const timer=window.setTimeout(async()=>{
      try {
        const employees=await searchEmployees(query,controller.signal);
        if(controller.signal.aborted) return;
        setSearchResults(employees);
        setSearchLoading(false);
      } catch {
        if(controller.signal.aborted) return;
        setSearchResults([]);
        setSearchError(true);
        setSearchLoading(false);
      }
    },300);
    return ()=>{window.clearTimeout(timer);controller.abort();};
  },[query]);

  useEffect(()=>{
    const controller=new AbortController();
    setTemplatesLoading(true);setTemplatesError(false);
    apiRequest<ApiTemplate[]>('/schedules/templates',{signal:controller.signal}).then(items=>{
      if(controller.signal.aborted)return;
      setTemplates(items.map((item,index)=>{
        const start=item.startTime.slice(0,5),end=item.endTime.slice(0,5);
        const [startHour,startMinute]=start.split(':').map(Number),[endHour,endMinute]=end.split(':').map(Number);
        const minutes=(endHour*60+endMinute-startHour*60-startMinute+1440)%1440;
        const hours=Math.round((minutes-item.breakMinutes)/6)/10;
        return {id:item.id,title:item.name,start,end,hoursLabel:`${hours} ч`,...palette[index%palette.length]};
      }));
      setTemplatesLoading(false);
    }).catch(()=>{if(!controller.signal.aborted){setTemplatesError(true);setTemplatesLoading(false);}});
    return ()=>controller.abort();
  },[templatesReload]);

  useEffect(()=>{
    if(!ready)return;
    const controller=new AbortController();
    setScheduleLoading(true);setScheduleError(false);setShifts({});setPublished(false);
    const params=new URLSearchParams({startDate,endDate});
    apiRequest<ApiSchedule>(`/schedules?${params}`,{signal:controller.signal}).then(data=>{
      if(controller.signal.aborted)return;
      setShifts(scheduleShifts(data.shifts));
      setPublished(data.published);setScheduleLoading(false);
    }).catch(()=>{if(!controller.signal.aborted){setScheduleError(true);setScheduleLoading(false);}});
    return ()=>controller.abort();
  },[startDate,endDate,reload,ready]);

  useEffect(()=>{
    const finish=()=>{dragActive.current=false;};
    window.addEventListener('pointerup',finish);
    window.addEventListener('pointercancel',finish);
    window.addEventListener('blur',finish);
    return ()=>{ window.removeEventListener('pointerup',finish); window.removeEventListener('pointercancel',finish); window.removeEventListener('blur',finish); };
  },[]);

  const setCellSelection=useCallback((key:string,mode:SelectionMode)=>{
    setSelected(prev=>{const next=new Set(prev); mode==='add'?next.add(key):next.delete(key); return next;});
  },[]);
  const beginSelection=(key:string,event:PointerEvent<HTMLButtonElement>)=>{
    if(event.button!==0) return;
    if(!shifts[key])event.preventDefault();
    selectionBeforeDrag.current=selected;
    dragMode.current=selected.has(key)?'remove':'add';
    dragActive.current=true;
    dragStart.current=key;
    didDrag.current=false;
    setCellSelection(key,dragMode.current);
  };
  const hoverSelection=(key:string)=>{if(dragActive.current){if(key!==dragStart.current) didDrag.current=true;setCellSelection(key,dragMode.current);}};
  const startShiftDrag=()=>{dragActive.current=false;didDrag.current=true;setSelected(selectionBeforeDrag.current);};
  const shouldOpenCell=(key:string,keyboard:boolean)=>{
    if(keyboard){setCellSelection(key,selected.has(key)?'remove':'add');return true;}
    return !didDrag.current;
  };
  const changePeriod=(direction:-1|1)=>{
    setScheduleLoading(true);
    setFocusDate(prev=>view==='week'?addDays(prev,direction*7):new Date(prev.getFullYear(),prev.getMonth()+direction,1));
    setSelected(new Set());
  };
  const setViewMode=(next:ViewMode)=>{if(next!==view)setScheduleLoading(true);setView(next);setSelected(new Set());};
  const reset=()=>{setFocusDate(new Date());setSelected(new Set());};
  const applyToCells=async(keys:string[],templateId:string,start:string,end:string,onlyIfEmpty=false):Promise<boolean>=>{
    if(!keys.length){setNotice('Сначала выделите одну или несколько ячеек календаря.');return false;}
    if(!validTime(start)||!validTime(end)||start===end){setNotice('Проверьте время смены.');return false;}
    if(busyRef.current)return false;
    busyRef.current=true;setBusy(true);
    try {
      const assignments=keys.map(key=>{const [employeeId,date]=key.split('|');return {employeeId,date,templateId:templateId==='custom'?null:templateId,startTime:start,endTime:end,onlyIfEmpty};});
      await apiRequest('/schedules/shifts',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({assignments,removals:[]})});
      setShifts(prev=>{const next={...prev};for(const item of assignments)next[shiftKey(item.employeeId,item.date)]={employeeId:item.employeeId,date:item.date,start,end,templateId};return next;});
      setPublished(false);setNotice(`Смены назначены: ${keys.length} ячеек.`);
      setSelected(prev=>{const next=new Set(prev);for(const key of keys)next.delete(key);return next;});
      return true;
    } catch(error){setNotice(error instanceof Error?error.message:'Не удалось сохранить смены.');return false;}
    finally {busyRef.current=false;setBusy(false);}
  };
  const applyShift=(templateId:string,start:string,end:string)=>applyToCells([...selected],templateId,start,end);
  const moveShift=async(sourceKey:string,targetKey:string)=>{
    if(sourceKey===targetKey||busyRef.current)return;
    const shift=shifts[sourceKey];
    if(!shift){setNotice('Исходная смена не найдена.');return;}
    if(shifts[targetKey]){setNotice('В выбранной ячейке уже есть смена.');return;}
    const [employeeId,date]=targetKey.split('|');
    busyRef.current=true;setBusy(true);
    try {
      await apiRequest('/schedules/shifts',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        assignments:[{employeeId,date,templateId:shift.templateId==='custom'?null:shift.templateId,startTime:shift.start,endTime:shift.end,onlyIfEmpty:true}],
        removals:[{employeeId:shift.employeeId,date:shift.date,expected:{templateId:shift.templateId==='custom'?null:shift.templateId,startTime:shift.start,endTime:shift.end}}],
      })});
      setShifts(prev=>{const next={...prev};delete next[sourceKey];next[targetKey]={...shift,employeeId,date};return next;});
      setSelected(prev=>{const next=new Set(prev);next.delete(sourceKey);next.delete(targetKey);return next;});
      setPublished(false);setNotice('Смена перенесена.');
    } catch(error){setNotice(error instanceof Error?error.message:'Не удалось перенести смену.');}
    finally {busyRef.current=false;setBusy(false);}
  };
  const clearCells=async(keys:string[]):Promise<boolean>=>{
    if(!keys.length||busyRef.current)return false;
    busyRef.current=true;setBusy(true);
    try {
      const removals=keys.map(key=>{const [employeeId,date]=key.split('|');return {employeeId,date};});
      const result=await apiRequest<{updated:number}>('/schedules/shifts',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({assignments:[],removals})});
      setShifts(prev=>{const next={...prev};for(const key of keys)delete next[key];return next;});
      setSelected(prev=>{const next=new Set(prev);for(const key of keys)next.delete(key);return next;});
      if(result.updated)setPublished(false);setNotice('Выбранные смены очищены.');return true;
    } catch(error){setNotice(error instanceof Error?error.message:'Не удалось удалить смены.');return false;}
    finally {busyRef.current=false;setBusy(false);}
  };
  const clearSelected=()=>clearCells([...selected]);
  const save=async(publish=false)=>{
    if(busyRef.current)return;
    busyRef.current=true;setBusy(true);
    try {
      if(publish){await apiRequest('/schedules/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({startDate,endDate})});setPublished(true);setNotice('График опубликован.');}
      else {
        const params=new URLSearchParams({startDate,endDate});
        const data=await apiRequest<ApiSchedule>(`/schedules?${params}`);
        setShifts(scheduleShifts(data.shifts));setPublished(data.published);setSelected(new Set());
        setNotice('График сохранён на сервере.');
      }
    } catch(error){setNotice(error instanceof Error?error.message:'Не удалось сохранить график.');}
    finally {busyRef.current=false;setBusy(false);}
  };

  const monthLabel=(d:Date)=>new Intl.DateTimeFormat('ru-RU',{month:'long'}).format(d);
  const periodText=view==='week'?`${firstDay.getDate()} ${monthLabel(firstDay)} — ${lastDay.getDate()} ${monthLabel(lastDay)}`:new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(focusDate);
  const gridColumns=view==='week'?'160px repeat(7, minmax(59px, 1fr))':`160px repeat(${days.length}, 41px)`;
  const minGridWidth=view==='week'?597:160+days.length*41;
  const coverage=useMemo(()=>countShiftsByDate(days,Object.values(shifts)),[days,shifts]);

  return {
    ready,view,days,query,setQuery,selected,shifts,startTime,setStartTime,endTime,setEndTime,
    notice,setNotice,hasChanges:false,published,filteredEmployees,employeesLoading,employeesError,selectedEmployeesCount,selectedDatesCount,
    templates,templatesLoading,templatesError,retryTemplates:()=>setTemplatesReload(value=>value+1),scheduleLoading,scheduleError,busy,retrySchedule:()=>setReload(value=>value+1),
    beginSelection,hoverSelection,startShiftDrag,shouldOpenCell,changePeriod,setViewMode,reset,applyShift,applyToCells,moveShift,clearCells,
    clearSelected,clearSelection:()=>setSelected(new Set()),save,
    periodText,gridColumns,minGridWidth,coverage:scheduleLoading||scheduleError?null:coverage,
  };
}
export type ScheduleEditor=ReturnType<typeof useScheduleEditor>;
