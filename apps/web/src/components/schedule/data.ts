export type Employee = {
  id: string;
  name: string;
  title: string;
};

export type ShiftTemplate = {
  id: string;
  title: string;
  start: string;
  end: string;
  hoursLabel: string;
  color: string;
  marker: string;
};

export type Shift = {
  employeeId: string;
  date: string;
  start: string;
  end: string;
  templateId: string;
};

export type ShiftDrag =
  | {kind:'shift';key:string}
  | {kind:'template';template:ShiftTemplate};
