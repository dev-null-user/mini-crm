import { Plus } from 'lucide-react';
import type { PointerEvent } from 'react';
import { templates, type Shift } from './data';
import { cn } from '../../lib/utils';
import { durationHours,labelForTime,type ViewMode } from '@/lib/schedule-utils';

type Props={ cellKey:string; employeeName:string;date:string; shift?:Shift;selected:boolean;view:ViewMode;
 onPointerDown:(key:string,e:PointerEvent<HTMLButtonElement>)=>void;onPointerEnter:(key:string)=>void;onToggle:(key:string,selected:boolean)=>void; };
export function ShiftCell(p:Props){
  const color=templates.find(t=>t.id===p.shift?.templateId)?.color??'bg-[#5d7ff0] text-white';
  return <button type="button" aria-label={`${p.employeeName}, ${p.date}${p.shift?`, смена ${p.shift.start}–${p.shift.end}`:', без смены'}`}
    aria-pressed={p.selected}
    onPointerDown={e=>p.onPointerDown(p.cellKey,e)} onPointerEnter={()=>p.onPointerEnter(p.cellKey)}
    onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();p.onToggle(p.cellKey,p.selected);}}}
    className={cn('schedule-cell relative m-[2px] flex h-[39px] flex-col items-center justify-center rounded-[5px] border border-dashed border-[#e5e7ee] text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#5b7cf0]',p.selected?'border-solid border-[#5b7cf0] bg-[#e9eeff]':p.shift?`border-transparent ${color}`:'hover:bg-[#f1f4ff]')}>
    {p.selected?<Plus className="size-[13px] rounded-full bg-[#587bec] p-[2px] text-white" strokeWidth={3}/>:p.shift?(p.view==='week'?<><span className="text-[10px] leading-[14px]">{labelForTime(p.shift.start)}–{labelForTime(p.shift.end)}</span><span className="text-[9px] leading-[12px] opacity-80">{durationHours(p.shift.start,p.shift.end)} ч</span></>:<span className="text-[9px]">{durationHours(p.shift.start,p.shift.end)} ч</span>):null}
  </button>;
}
