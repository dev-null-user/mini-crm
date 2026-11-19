export type Employee = {
  id: string;
  name: string;
  title: string;
  image: string;
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

export const employees: Employee[] = [
  { id: 'e1', name: 'Кузнецова Алина', title: 'агент · 24 ч', image: '/avatars/1.png' },
  { id: 'e2', name: 'Волков Тимур', title: 'агент · 24 ч', image: '/avatars/2.png' },
  { id: 'e3', name: 'Морозова Виктория', title: 'агент · 24 ч', image: '/avatars/3.png' },
  { id: 'e4', name: 'Соколов Артём', title: 'агент · 24 ч', image: '/avatars/4.png' },
  { id: 'e5', name: 'Лебедева Полина', title: 'агент · 24 ч', image: '/avatars/5.png' },
  { id: 'e6', name: 'Новиков Кирилл', title: 'агент · 24 ч', image: '/avatars/6.png' },
  { id: 'e7', name: 'Ерохина Дарья', title: 'агент · 24 ч', image: '/avatars/7.png' },
  { id: 'e8', name: 'Гаврилов Егор', title: 'агент · 24 ч', image: '/avatars/8.png' },
  { id: 'e9', name: 'Тестов Тест', title: 'агент · 24 ч', image: '/avatars/8.png' },
];

export const templates: ShiftTemplate[] = [
  { id: 'morning', title: 'Утро', start: '07:00', end: '15:00', hoursLabel: '8 ч', color: 'bg-[#e9eefc] text-[#3b5fcf]', marker: 'border-[#b8c8fe]' },
  { id: 'day', title: 'День', start: '10:00', end: '18:00', hoursLabel: '8 ч', color: 'bg-[#ebdefe] text-[#7750bb]', marker: 'border-[#d7aff8]' },
  { id: 'evening', title: 'Вечер', start: '15:00', end: '23:00', hoursLabel: '8 ч', color: 'bg-[#dcf7f4] text-[#208f87]', marker: 'border-[#8de8de]' },
];
