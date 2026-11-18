'use client';

import { X } from 'lucide-react';
import { ScheduleHeader } from './schedule-header';
import { ScheduleToolbar } from './schedule-toolbar';
import { ScheduleGrid } from './schedule-grid';
import { ShiftTemplatesPanel } from './shift-templates-panel';
import { useScheduleEditor } from '@/hooks/use-schedule-editor';

export function ScheduleDashboard(){
  const editor=useScheduleEditor();
  return <div className="min-w-0 flex-1 px-3 pb-10 pt-[11px] text-[#25252c] sm:px-[17px]">
    <ScheduleHeader published={editor.published} hasChanges={editor.hasChanges} onReset={editor.reset} onSave={editor.save}/>
    {editor.notice&&<div role="status" className="mb-2 flex items-center justify-between rounded-md border border-[#d8e1ff] bg-[#f9fbff] px-3 py-2 text-[11px] text-[#3758a8]">{editor.notice}<button type="button" onClick={()=>editor.setNotice('')} aria-label="Закрыть"><X className="size-3.5"/></button></div>}
    <div className="grid grid-cols-1 items-start gap-[5px] xl:grid-cols-[minmax(0,1fr)_202px]">
      <section className="min-w-0 overflow-hidden rounded-[13px] bg-white p-2" aria-label="График смен сотрудников">
        <ScheduleToolbar selectedCount={editor.selected.size} selectedEmployeesCount={editor.selectedEmployeesCount} selectedDatesCount={editor.selectedDatesCount} query={editor.query} onQuery={editor.setQuery} view={editor.view} onView={editor.setViewMode} periodText={editor.periodText} onPeriod={editor.changePeriod} onApply={editor.applyFirstTemplate} onClear={editor.clearSelected} onUnselect={editor.clearSelection}/>
        <ScheduleGrid days={editor.days} gridColumns={editor.gridColumns} minGridWidth={editor.minGridWidth} employees={editor.filteredEmployees} selected={editor.selected} shifts={editor.shifts} coverage={editor.coverage} view={editor.view} onPointerDown={editor.beginSelection} onPointerEnter={editor.hoverSelection} onToggle={(key,selected)=>editor.setCellSelection(key,selected?'remove':'add')}/>
        <p className="mt-2 px-1 text-[9px] text-[#a2a6b0]">Выделяйте ячейки кликом или перетаскиванием мыши. Смены сохраняются только после нажатия «Сохранить».</p>
      </section>
      <ShiftTemplatesPanel startTime={editor.startTime} endTime={editor.endTime} onStartTime={editor.setStartTime} onEndTime={editor.setEndTime} onApply={editor.applyShift}/>
    </div>
  </div>;
}
