'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { employees, templates, type Shift } from '@/components/schedule/data';
import { addDays, dateKey, getDays, REFERENCE_DATE, shiftKey, validTime, type SelectionMode, type ViewMode } from '@/lib/schedule-utils';

const STORAGE_KEY='mini-crm:schedule-demo:v1';

export function useScheduleEditor() {
  const [view, setView]=useState<ViewMode>('week');
  const [focusDate,setFocusDate]=useState(REFERENCE_DATE);
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState<Set<string>>(()=>new Set());
  const [shifts,setShifts]=useState<Record<string,Shift>>({});
  const [startTime,setStartTime]=useState('09:00');
  const [endTime,setEndTime]=useState('17:00');
  const [notice,setNotice]=useState('');
  const [hasChanges,setHasChanges]=useState(false);
  const [published,setPublished]=useState(false);
  const dragActive=useRef(false);
  const dragMode=useRef<SelectionMode>('add');

  const days=useMemo(()=>getDays(focusDate,view),[focusDate,view]);
  const filteredEmployees=useMemo(()=>employees.filter(e=>e.name.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'))),[query]);
  const selectedEmployeesCount=new Set([...selected].map(x=>x.split('|')[0])).size;
  const selectedDatesCount=new Set([...selected].map(x=>x.split('|')[1])).size;

  useEffect(()=>{
    try {
      const raw=localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved=JSON.parse(raw) as {shifts?: Record<string,Shift>,published?:boolean};
      if(saved.shifts && typeof saved.shifts==='object' && !Array.isArray(saved.shifts)) setShifts(saved.shifts);
      setPublished(Boolean(saved.published));
    } catch { /* ignore invalid demo storage */ }
  },[]);

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
    event.preventDefault();
    dragMode.current=selected.has(key)?'remove':'add';
    dragActive.current=true;
    setCellSelection(key,dragMode.current);
  };
  const hoverSelection=(key:string)=>{if(dragActive.current) setCellSelection(key,dragMode.current);};
  const changePeriod=(direction:-1|1)=>{
    setFocusDate(prev=>view==='week'?addDays(prev,direction*7):new Date(prev.getFullYear(),prev.getMonth()+direction,1));
    setSelected(new Set());
  };
  const setViewMode=(next:ViewMode)=>{setView(next);setSelected(new Set());};
  const reset=()=>{setView('week');setFocusDate(REFERENCE_DATE);setSelected(new Set());};
  const applyShift=(templateId:string,start:string,end:string)=>{
    if(!selected.size){setNotice('Сначала выделите одну или несколько ячеек календаря.');return;}
    if(!validTime(start)||!validTime(end)||start===end){setNotice('Проверьте время смены.');return;}
    setShifts(prev=>{
      const next={...prev};
      for(const key of selected){const [employeeId,date]=key.split('|');next[key]={employeeId,date,start,end,templateId};}
      return next;
    });
    setPublished(false);setHasChanges(true);setNotice(`Смены назначены: ${selected.size} ячеек.`);setSelected(new Set());
  };
  const applyFirstTemplate=()=>{const t=templates[0];applyShift(t.id,t.start,t.end);};
  const clearSelected=()=>{
    if(!selected.size)return;
    setShifts(prev=>{const next={...prev};for(const key of selected)delete next[key];return next;});
    setSelected(new Set());setPublished(false);setHasChanges(true);setNotice('Выбранные смены очищены.');
  };
  const save=(publish=false)=>{
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify({shifts,published:publish}));setHasChanges(false);setPublished(publish);setNotice(publish?'График опубликован локально.':'График сохранён в браузере.');}
    catch {setNotice('Не удалось сохранить данные браузера.');}
  };

  const firstDay=days[0],lastDay=days[days.length-1];
  const monthLabel=(d:Date)=>new Intl.DateTimeFormat('ru-RU',{month:'long'}).format(d);
  const periodText=view==='week'?`${firstDay.getDate()} ${monthLabel(firstDay)} — ${lastDay.getDate()} ${monthLabel(lastDay)}`:new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'}).format(focusDate);
  const gridColumns=view==='week'?'128px repeat(7, minmax(59px, 1fr))':`128px repeat(${days.length}, 41px)`;
  const minGridWidth=view==='week'?565:128+days.length*41;
  const coverage=days.map(day=>{
    const d=dateKey(day);return employees.reduce((n,e)=>n+(shifts[shiftKey(e.id,d)]?1:0),0);
  });

  return {
    view,days,query,setQuery,selected,shifts,startTime,setStartTime,endTime,setEndTime,
    notice,setNotice,hasChanges,published,filteredEmployees,selectedEmployeesCount,selectedDatesCount,
    beginSelection,hoverSelection,setCellSelection,changePeriod,setViewMode,reset,applyShift,
    applyFirstTemplate,clearSelected,clearSelection:()=>setSelected(new Set()),save,
    periodText,gridColumns,minGridWidth,coverage,
  };
}
export type ScheduleEditor=ReturnType<typeof useScheduleEditor>;
