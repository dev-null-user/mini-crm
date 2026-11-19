import type { PointerEvent } from 'react';
import { ShiftCell } from './shift-cell';
import type { Employee,Shift } from './data';
import { cn } from '../../lib/utils';
import { dateKey,shiftKey,type ViewMode } from '@/lib/schedule-utils';

type Props={employee:Employee;index:number;days:Date[];gridColumns:string;selected:Set<string>;shifts:Record<string,Shift>;view:ViewMode;
  onPointerDown:(key:string,e:PointerEvent<HTMLButtonElement>)=>void;onPointerEnter:(key:string)=>void;onToggle:(key:string,selected:boolean)=>void;};
export function EmployeeRow(p:Props){
  return <div className={cn('grid h-[43px] items-stretch',p.index%2===0?'bg-white':'bg-[#f7f8fb]')} style={{gridTemplateColumns:p.gridColumns}}>
    <div className="flex min-w-0 items-center gap-[5px] overflow-hidden pl-1">
      <div className="min-w-0"><p className="truncate text-[10px] leading-[13px]">{p.employee.name}</p><p className="truncate text-[9px] leading-[12px] text-[#989ba3]">{p.employee.title}</p></div>
    </div>
    {p.days.map(day=>{
      const date=dateKey(day),key=shiftKey(p.employee.id,date);
      return <ShiftCell key={key} cellKey={key} employeeName={p.employee.name} date={date} selected={p.selected.has(key)} shift={p.shifts[key]} view={p.view} onPointerDown={p.onPointerDown} onPointerEnter={p.onPointerEnter} onToggle={p.onToggle}/>;
    })}
  </div>;
}
