import { Plus } from 'lucide-react';
import { useState, type DragEvent, type PointerEvent } from 'react';
import { type Shift, type ShiftTemplate } from './data';
import { cn } from '../../lib/utils';
import { durationHours,labelForTime,type ViewMode } from '@/lib/schedule-utils';

type Props={ cellKey:string; employeeName:string;date:string; shift?:Shift;templates:ShiftTemplate[];selected:boolean;view:ViewMode;dragging:boolean;
 onPointerDown:(key:string,e:PointerEvent<HTMLButtonElement>)=>void;onPointerEnter:(key:string)=>void;onOpen:(key:string,keyboard:boolean)=>void;
 onDragShift:(key:string,e:DragEvent<HTMLButtonElement>)=>void;onDragEnd:()=>void;onDropShift:(key:string)=>void; };
export function ShiftCell(p:Props){
  const [dragOver,setDragOver]=useState(false);
  const color=p.templates.find(t=>t.id===p.shift?.templateId)?.color??'bg-[#5d7ff0] text-white';
  return <button type="button" aria-label={`${p.employeeName}, ${p.date}${p.shift?`, смена ${p.shift.start}–${p.shift.end}`:', без смены'}`}
    aria-pressed={p.selected}
    draggable={Boolean(p.shift)}
    title={p.shift?'Перетащите смену в свободную ячейку':''}
    onPointerDown={e=>p.onPointerDown(p.cellKey,e)} onPointerEnter={()=>p.onPointerEnter(p.cellKey)}
    onClick={e=>p.onOpen(p.cellKey,e.detail===0)}
    onDragStart={e=>p.onDragShift(p.cellKey,e)} onDragEnd={()=>{setDragOver(false);p.onDragEnd();}}
    onDragEnter={e=>{if(p.dragging){e.preventDefault();setDragOver(true);}}}
    onDragOver={e=>{if(p.dragging)e.preventDefault();}}
    onDragLeave={()=>setDragOver(false)}
    onDrop={e=>{if(!p.dragging)return;e.preventDefault();setDragOver(false);p.onDropShift(p.cellKey);}}
    className={cn('schedule-cell relative m-[2px] flex h-[39px] flex-col items-center justify-center rounded-[5px] border border-dashed border-[#e5e7ee] text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#5b7cf0]',p.selected?'border-solid border-[#5b7cf0] bg-[#e9eeff]':p.shift?`border-transparent ${color}`:'hover:bg-[#f1f4ff]',p.shift&&'cursor-grab active:cursor-grabbing',p.dragging&&dragOver&&'ring-2 ring-[#5b7cf0]')}>
    {p.shift?(p.view==='week'?<><span className="text-[10px] leading-[14px]">{labelForTime(p.shift.start)}–{labelForTime(p.shift.end)}</span><span className="text-[9px] leading-[12px] opacity-80">{durationHours(p.shift.start,p.shift.end)} ч</span></>:<span className="text-[9px]">{durationHours(p.shift.start,p.shift.end)} ч</span>):p.selected?<Plus className="size-[13px] rounded-full bg-[#587bec] p-[2px] text-white" strokeWidth={3}/>:null}
  </button>;
}
