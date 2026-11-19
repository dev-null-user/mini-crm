import type { DragEvent, PointerEvent } from 'react';
import { ShiftCell } from './shift-cell';
import type { Employee,Shift,ShiftTemplate } from './data';
import { cn } from '../../lib/utils';
import { dateKey,shiftKey,type ViewMode } from '@/lib/schedule-utils';

type Props={employee:Employee;index:number;days:Date[];gridColumns:string;selected:Set<string>;shifts:Record<string,Shift>;templates:ShiftTemplate[];view:ViewMode;dragging:boolean;
  onPointerDown:(key:string,e:PointerEvent<HTMLButtonElement>)=>void;onPointerEnter:(key:string)=>void;onOpenCell:(key:string,keyboard:boolean)=>void;
  onDragShift:(key:string,e:DragEvent<HTMLButtonElement>)=>void;onDragEnd:()=>void;onDropShift:(key:string)=>void;};
export function EmployeeRow(p:Props){
  const initials=p.employee.name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>Array.from(part)[0]).join('').toLocaleUpperCase('ru-RU');
  return <div className={cn('grid h-[43px] items-stretch',p.index%2===0?'bg-white':'bg-[#f7f8fb]')} style={{gridTemplateColumns:p.gridColumns}}>
    <div className="flex min-w-0 items-center gap-[6px] overflow-hidden px-1" title={`${p.employee.name} · ${p.employee.title}`}>
      <span aria-hidden="true" className="flex size-[29px] shrink-0 items-center justify-center rounded-[3px] bg-gradient-to-b from-[#80b6ff] to-[#4a89f7] text-[10px] font-medium text-white">{initials}</span>
      <div className="min-w-0"><p className="truncate text-[10px] leading-[13px]">{p.employee.name}</p><p className="truncate text-[9px] leading-[12px] text-[#989ba3]">{p.employee.title}</p></div>
    </div>
    {p.days.map(day=>{
      const date=dateKey(day),key=shiftKey(p.employee.id,date);
      return <ShiftCell key={key} cellKey={key} employeeName={p.employee.name} date={date} selected={p.selected.has(key)} shift={p.shifts[key]} templates={p.templates} view={p.view} dragging={p.dragging} onPointerDown={p.onPointerDown} onPointerEnter={p.onPointerEnter} onOpen={p.onOpenCell} onDragShift={p.onDragShift} onDragEnd={p.onDragEnd} onDropShift={p.onDropShift}/>;
    })}
  </div>;
}
