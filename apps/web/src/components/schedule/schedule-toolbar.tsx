import { ChevronLeft,ChevronRight,ClipboardCheck,Search,Trash2,X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '../../lib/utils';
import type { ViewMode } from '@/lib/schedule-utils';

type Props={
  selectedCount:number;selectedEmployeesCount:number;selectedDatesCount:number;
  query:string;onQuery:(s:string)=>void;view:ViewMode;onView:(v:ViewMode)=>void;
  periodText:string;onPeriod:(n:-1|1)=>void;onApply:()=>void;onClear:()=>void;onUnselect:()=>void;
};
export function ScheduleToolbar(p:Props){
  return <>
    {p.selectedCount>0?(
      <div className="flex h-[34px] items-center justify-between gap-2 overflow-x-auto rounded-md bg-[#35363d] px-2.5 text-white">
        <div className="flex shrink-0 items-center gap-1.5 text-[10px]"><span>Выделено:</span><span className="rounded bg-[#62636b] px-1.5 py-0.5">{p.selectedCount} яч.</span><span>{p.selectedEmployeesCount} сотр. · {p.selectedDatesCount} дн.</span></div>
        <div className="flex shrink-0 items-center gap-2.5 text-[10px]">
          <button type="button" onClick={p.onApply}><ClipboardCheck className="mr-1 inline size-3"/>Применить шаблон</button>
          <button type="button" onClick={p.onClear}><Trash2 className="mr-1 inline size-3"/>Очистить</button>
          <button type="button" onClick={p.onUnselect}><X className="mr-1 inline size-3"/>Снять</button>
        </div>
      </div>
    ):(
      <div className="flex min-h-[34px] items-center gap-1.5 overflow-x-auto">
        <div className="relative min-w-[130px] flex-1">
          <Search className="pointer-events-none absolute left-[9px] top-1/2 size-[13px] -translate-y-1/2 text-[#abb1bf]"/>
          <Input value={p.query} onChange={e=>p.onQuery(e.target.value)} placeholder="Поиск по ФИО" aria-label="Поиск сотрудника" className="h-[29px] pl-7 text-[10px]" />
        </div>
        <div className="flex h-[29px] shrink-0 items-center rounded-md bg-[#f0f1f5] p-[2px]">
          {(['month','week'] as const).map(mode=><button type="button" key={mode} onClick={()=>p.onView(mode)} aria-pressed={p.view===mode} className={cn('h-[25px] min-w-[76px] rounded-md px-3 text-[10px] transition-colors sm:min-w-[90px]',p.view===mode?'bg-[#383940] text-white':'hover:bg-[#e5e6ed]')}>{mode==='week'?'Неделя':'Месяц'}</button>)}
        </div>
      </div>
    )}
    <div className="mt-[5px] flex h-[23px] items-center justify-end gap-2 pr-1 text-[10px] text-[#90949f]">
      <button type="button" onClick={()=>p.onPeriod(-1)} aria-label="Предыдущий период"><ChevronLeft className="size-3"/></button>
      <span className="min-w-[115px] text-center capitalize">{p.periodText}</span>
      <button type="button" onClick={()=>p.onPeriod(1)} aria-label="Следующий период"><ChevronRight className="size-3"/></button>
    </div>
  </>;
}
