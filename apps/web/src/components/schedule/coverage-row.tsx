import { cn } from '../../lib/utils';
import { dateKey } from '@/lib/schedule-utils';
export function CoverageRow({days,gridColumns,coverage}:{days:Date[];gridColumns:string;coverage:number[]|null}){
  return <div className="grid h-[29px] overflow-hidden rounded-b-md text-[10px]" style={{gridTemplateColumns:gridColumns}}>
    <div className="flex items-center pl-1.5 text-[#7a7f8a]">Покрытие</div>
    {days.map((day,i)=>{
      const count=coverage?.[i];
      return <div key={dateKey(day)} aria-label={`Покрытие ${dateKey(day)}: ${count===undefined?'нет данных':`смен: ${count}`}`} className={cn('flex items-center justify-center',count===undefined?'text-[#858993]':count===0?'bg-[#fae7e8] text-[#ef4149]':'bg-[#e8edfc] text-[#4974e4]')}>{count??'—'}</div>;
    })}
  </div>;
}
