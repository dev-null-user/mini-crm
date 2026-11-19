'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { ScheduleHeader } from './schedule-header';
import { ScheduleToolbar } from './schedule-toolbar';
import { ScheduleGrid } from './schedule-grid';
import { ShiftTemplatesPanel } from './shift-templates-panel';
import { ShiftPicker, type ShiftPickerTarget } from './shift-picker';
import type { ShiftDrag } from './data';
import { useScheduleEditor } from '@/hooks/use-schedule-editor';

export function ScheduleDashboard(){
  const editor=useScheduleEditor();
  const [picker,setPicker]=useState<ShiftPickerTarget|null>(null);
  const [dragging,setDragging]=useState<ShiftDrag|null>(null);
  if(!editor.ready)return <div role="status" className="px-3 pt-3 text-xs text-[#858993]">Загрузка графика…</div>;
  return <div className="min-w-0 flex-1 px-3 pb-10 pt-[11px] text-[#25252c] sm:px-[17px]">
    <fieldset disabled={editor.busy||editor.scheduleLoading||editor.scheduleError}>
    <ScheduleHeader published={editor.published} hasChanges={editor.hasChanges} onReset={editor.reset} onSave={editor.save}/>
    </fieldset>
    {editor.notice&&<div role="status" className="mb-2 flex items-center justify-between rounded-md border border-[#d8e1ff] bg-[#f9fbff] px-3 py-2 text-[11px] text-[#3758a8]">{editor.notice}<button type="button" onClick={()=>editor.setNotice('')} aria-label="Закрыть"><X className="size-3.5"/></button></div>}
    {editor.socketStatus!=='connected'&&<p role="status" className="mb-2 text-xs text-[#858993]">{editor.socketStatus==='connecting'?'Подключение к обновлениям графика…':'Нет соединения для обновлений графика. Подключение восстанавливается…'}</p>}
    {editor.scheduleLoading&&<p role="status" className="mb-2 text-xs text-[#858993]">Загрузка графика…</p>}
    {editor.scheduleError&&<div role="alert" className="mb-2 text-xs text-[#c43b42]">Не удалось загрузить график. <button type="button" onClick={editor.retrySchedule} className="underline">Повторить</button></div>}
    <fieldset disabled={editor.busy||editor.scheduleLoading||editor.scheduleError}>
    <div className="grid grid-cols-1 items-start gap-[5px] xl:grid-cols-[minmax(0,1fr)_202px]">
      <section className="min-w-0 overflow-hidden rounded-[13px] bg-white p-2" aria-label="График смен сотрудников">
        <ScheduleToolbar selectedCount={editor.selected.size} selectedEmployeesCount={editor.selectedEmployeesCount} selectedDatesCount={editor.selectedDatesCount} query={editor.query} onQuery={editor.setQuery} view={editor.view} onView={editor.setViewMode} periodText={editor.periodText} onPeriod={editor.changePeriod} onApply={()=>setPicker({kind:'selection'})} onClear={editor.clearSelected} onUnselect={editor.clearSelection}/>
        <ScheduleGrid days={editor.days} gridColumns={editor.gridColumns} minGridWidth={editor.minGridWidth} employees={editor.filteredEmployees} employeesLoading={editor.employeesLoading} employeesError={editor.employeesError} selected={editor.selected} shifts={editor.shifts} templates={editor.templates} coverage={editor.coverage} view={editor.view} dragging={Boolean(dragging)} onPointerDown={editor.beginSelection} onPointerEnter={editor.hoverSelection} onOpenDate={date=>setPicker({kind:'date',date})} onOpenCell={(key,keyboard)=>{if(editor.shouldOpenCell(key,keyboard)){const [employeeId,date]=key.split('|');setPicker({kind:'cell',employeeId,date});}}} onDragShift={(key,event)=>{editor.startShiftDrag();event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','shift');setDragging({kind:'shift',key});}} onDragEnd={()=>{setDragging(null);editor.finishDrag();}} onDropShift={key=>{if(!dragging)return;setDragging(null);if(dragging.kind==='shift')void editor.moveShift(dragging.key,key);else if(editor.shifts[key])editor.setNotice('В выбранной ячейке уже есть смена.');else void editor.applyToCells([key],dragging.template.id,dragging.template.start,dragging.template.end,true);}}/>
        <p className="mt-2 px-1 text-[9px] text-[#a2a6b0]">Нажмите на дату или ячейку, чтобы назначить смену. Перетащите смену или шаблон в свободную ячейку. Для выделения нескольких ячеек начните перетаскивание с пустой ячейки.</p>
      </section>
      <ShiftTemplatesPanel templates={editor.templates} loading={editor.templatesLoading} error={editor.templatesError} onRetry={editor.retryTemplates} startTime={editor.startTime} endTime={editor.endTime} onStartTime={editor.setStartTime} onEndTime={editor.setEndTime} onApply={editor.applyShift} onDragTemplate={(template,event)=>{editor.startTemplateDrag();event.dataTransfer.effectAllowed='copy';event.dataTransfer.setData('text/plain','template');setDragging({kind:'template',template});}} onDragEnd={()=>{setDragging(null);editor.finishDrag();}}/>
    </div>
    </fieldset>
    {picker&&<ShiftPicker target={picker} employees={editor.filteredEmployees} shifts={editor.shifts} templates={editor.templates} templatesLoading={editor.templatesLoading} templatesError={editor.templatesError} busy={editor.busy} scheduleUnavailable={editor.scheduleLoading||editor.scheduleError} selectedCount={editor.selected.size} onApply={(keys,id,start,end)=>keys?editor.applyToCells(keys,id,start,end):editor.applyShift(id,start,end)} onClear={editor.clearCells} onClose={()=>setPicker(null)}/>}
  </div>;
}
