import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '../../lib/utils';
import { templates } from './data';

type Props={startTime:string;endTime:string;onStartTime:(v:string)=>void;onEndTime:(v:string)=>void;onApply:(id:string,start:string,end:string)=>void};
export function ShiftTemplatesPanel(p:Props){
  return <aside className="min-h-[445px] rounded-[10px] bg-white p-[10px]" aria-label="Шаблоны смен">
    <h2 className="mb-2 text-[11px] font-normal">Шаблоны смен</h2>
    <div className="space-y-1">
      {templates.map((t,i)=><button type="button" key={t.id} onClick={()=>p.onApply(t.id,t.start,t.end)} title="Применить шаблон к выделенным ячейкам" className={cn('relative flex min-h-[37px] w-full flex-col items-start justify-center gap-[2px] rounded-md border-l-2 bg-[#f1f2f6] py-[5px] pl-2 pr-5 text-left hover:bg-[#e7eaf5]',t.marker)}>
        <span className="text-[10px] font-medium">{t.title}</span><span className="text-[9px] text-[#4b4d56]">{t.start} - {t.end} · {t.hoursLabel}</span><span className="absolute right-[7px] top-[5px] rounded bg-white px-1 text-[9px]">{i+1}</span>
      </button>)}
    </div>
    <div className="mt-[15px]"><h3 className="mb-1.5 text-[11px]">Своя смена</h3>
      <div className="grid grid-cols-2 gap-1">
        <label className="text-[9px] text-[#999da8]">Начало<Input type="time" value={p.startTime} onChange={e=>p.onStartTime(e.target.value)} className="mt-[3px] h-[30px] min-w-0 px-2 text-[10px]"/></label>
        <label className="text-[9px] text-[#999da8]">Конец<Input type="time" value={p.endTime} onChange={e=>p.onEndTime(e.target.value)} className="mt-[3px] h-[30px] min-w-0 px-2 text-[10px]"/></label>
      </div>
      <Button type="button" variant="secondary" size="sm" className="mt-1.5 h-[29px] w-full gap-1 px-1 text-[10px]" onClick={()=>p.onApply('custom',p.startTime,p.endTime)}><Plus className="size-3"/> Поставить в выделенные</Button>
    </div>
    <div className="mt-4 hidden border-t border-[#eff0f4] pt-3 text-[10px] leading-[17px] text-[#979ba6] xl:block">Выделите дни в графике и выберите шаблон смены.</div>
  </aside>;
}
