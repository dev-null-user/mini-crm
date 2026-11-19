export type ViewMode = 'week' | 'month';
export type SelectionMode = 'add' | 'remove';
export const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
export function dateKey(d: Date): string {
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
export function getDays(date: Date, view: ViewMode): Date[] {
  if (view === 'week') return Array.from({ length: 7 }, (_,i) => addDays(startOfWeek(date), i));
  const count = new Date(date.getFullYear(), date.getMonth()+1,0).getDate();
  return Array.from({ length: count }, (_,i) => new Date(date.getFullYear(), date.getMonth(), i+1));
}
export function shiftKey(employeeId: string, day: string): string { return `${employeeId}|${day}`; }
export function countShiftsByDate(days:Date[], shifts:Iterable<{date:string}>):number[] {
  const counts=new Map<string,number>();
  for(const shift of shifts) counts.set(shift.date,(counts.get(shift.date)??0)+1);
  return days.map(day=>counts.get(dateKey(day))??0);
}
export function labelForTime(s: string): string { return s.replace(':00',''); }
export function durationHours(start: string, end: string): number {
  const [sh=0,sm=0] = start.split(':').map(Number);
  const [eh=0,em=0] = end.split(':').map(Number);
  const minutes = (eh*60+em-sh*60-sm+1440) % 1440;
  return minutes === 0 ? 24 : Math.round(minutes / 6)/10;
}
export function validTime(s:string): boolean {
  if(!/^\d{2}:\d{2}$/.test(s)) return false;
  const [h,m]=s.split(':').map(Number); return h>=0 && h<24 && m>=0 && m<60;
}
