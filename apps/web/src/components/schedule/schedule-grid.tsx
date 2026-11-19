import type { DragEvent, PointerEvent } from 'react';
import { EmployeeRow } from './employee-row';
import { CoverageRow } from './coverage-row';
import type {Employee, Shift, ShiftTemplate} from './data';
import { dateKey,WEEKDAYS,type ViewMode } from '@/lib/schedule-utils';

type Props={days:Date[];gridColumns:string;minGridWidth:number;employees:Employee[];employeesLoading:boolean;employeesError:boolean;selected:Set<string>;shifts:Record<string,Shift>;templates:ShiftTemplate[];coverage:number[]|null;view:ViewMode;dragging:boolean;
 onPointerDown:(key:string,e:PointerEvent<HTMLButtonElement>)=>void;onPointerEnter:(key:string)=>void;onOpenCell:(key:string,keyboard:boolean)=>void;onOpenDate:(date:string)=>void;
 onDragShift:(key:string,e:DragEvent<HTMLButtonElement>)=>void;onDragEnd:()=>void;onDropShift:(key:string)=>void;};
export function ScheduleGrid(p:Props){
  return <div className="schedule-scroll min-w-0 overflow-x-auto">
    <div style={{minWidth:p.minGridWidth}}>
      <div className="grid h-[29px] items-center border-b border-[#e2e4e9] text-[10px] text-[#858993]" style={{gridTemplateColumns:p.gridColumns}}>
        <div className="pl-1.5">Сотрудник</div>
        {p.days.map(day=><div key={dateKey(day)} className="text-center"><button type="button" onClick={()=>p.onOpenDate(dateKey(day))} aria-label={`Назначить смену на ${dateKey(day)}`} className="rounded px-1 py-1 hover:bg-[#e9eeff] focus-visible:outline-2 focus-visible:outline-[#5b7cf0]">{WEEKDAYS[day.getDay()]} {day.getDate()}</button></div>)}
      </div>
      <div className="select-none">
        {!p.employeesLoading&&!p.employeesError&&p.employees.map((employee,i)=><EmployeeRow key={employee.id} employee={employee} index={i} days={p.days} gridColumns={p.gridColumns} selected={p.selected} shifts={p.shifts} templates={p.templates} view={p.view} dragging={p.dragging} onPointerDown={p.onPointerDown} onPointerEnter={p.onPointerEnter} onOpenCell={p.onOpenCell} onDragShift={p.onDragShift} onDragEnd={p.onDragEnd} onDropShift={p.onDropShift}/>)}
        {p.employeesLoading?<div role="status" className="py-12 text-center text-xs text-[#858993]">Загрузка сотрудников…</div>:p.employeesError?<div role="alert" className="py-12 text-center text-xs text-[#c43b42]">Не удалось загрузить сотрудников. Проверьте подключение к API.</div>:p.employees.length===0&&<div className="py-12 text-center text-xs text-[#858993]">Сотрудники не найдены</div>}
      </div>
      <CoverageRow days={p.days} gridColumns={p.gridColumns} coverage={p.coverage}/>
    </div>
  </div>;
}
