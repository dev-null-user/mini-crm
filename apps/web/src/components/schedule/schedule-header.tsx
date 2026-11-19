import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props={published:boolean;hasChanges:boolean;onReset:()=>void;onSave:(publish:boolean)=>void};
export function ScheduleHeader({published,hasChanges,onReset,onSave}:Props){
  return <>
    <div className="flex h-6 items-center gap-2 text-[11px]">
      <Button type="button" variant="ghost" size="icon" className="size-[25px] rounded-full bg-white" onClick={onReset} aria-label="Текущий период"><ArrowLeft className="size-3" /></Button>
      <span>Графики смен</span>
    </div>
    <div className="mb-[15px] mt-[14px] flex items-center justify-between gap-3">
      <h1 className="text-[21px] leading-[26px] font-normal tracking-[-.8px]">График</h1>
      <div className="flex items-center gap-1.5">
        {published&&<span className="hidden items-center gap-1 text-[10px] text-green-700 md:inline-flex"><Check className="size-3"/> Опубликован</span>}
        <Button type="button" variant="secondary" size="sm" className="h-[29px] text-[10px]" onClick={()=>onSave(true)}>Опубликовать</Button>
        <Button type="button" size="sm" className="h-[29px] text-[10px]" onClick={()=>onSave(false)}>{hasChanges?'Сохранить *':'Сохранить'}</Button>
      </div>
    </div>
  </>;
}
