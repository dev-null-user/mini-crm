import type { PointerEvent } from 'react';
import { EmployeeRow } from './employee-row';
import { CoverageRow } from './coverage-row';
import type {Employee, Shift} from './data';
import { dateKey,WEEKDAYS,type ViewMode } from '@/lib/schedule-utils';

type Props={days:Date[];gridColumns:string;minGridWidth:number;employees:Employee[];selected:Set<string>;shifts:Record<string,Shift>;coverage:number[];view:ViewMode;
 onPointerDown:(key:string,e:PointerEvent<HTMLButtonElement>)=>void;onPointerEnter:(key:string)=>void;onToggle:(key:string,selected:boolean)=>void;};
export function ScheduleGrid(p:Props){
  return <div className="schedule-scroll min-w-0 overflow-x-auto">
    <div style={{minWidth:p.minGridWidth}}>
      <div className="grid h-[29px] items-center border-b border-[#e2e4e9] text-[10px] text-[#858993]" style={{gridTemplateColumns:p.gridColumns}}>
        <div className="pl-1.5">Сотрудник</div>
        {p.days.map(day=><div key={dateKey(day)} className="text-center">{WEEKDAYS[day.getDay()]} {day.getDate()}</div>)}
      </div>
      <div className="select-none">
        {p.employees.map((employee,i)=><EmployeeRow key={employee.id} employee={employee} index={i} days={p.days} gridColumns={p.gridColumns} selected={p.selected} shifts={p.shifts} view={p.view} onPointerDown={p.onPointerDown} onPointerEnter={p.onPointerEnter} onToggle={p.onToggle}/>)}
        {p.employees.length===0&&<div className="py-12 text-center text-xs text-[#858993]">Сотрудники не найдены</div>}
      </div>
      <CoverageRow days={p.days} gridColumns={p.gridColumns} coverage={p.coverage}/>
    </div>
  </div>;
}
