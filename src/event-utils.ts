import type { EventInput } from '@fullcalendar/core';

let eventGuid = 0;
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');

const EVENT_DAYS = [2, 4, 5, 5, 14, 20, 28, 29];

function getRandomTime(): string {
  const hour = Math.floor(Math.random() * 12) + 8;
  const minute = Math.floor(Math.random() * 4) * 15;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

const INITIAL_EVENTS: EventInput[] = EVENT_DAYS.map((day) => ({
  id: createEventId(),
  title: 'Event name',
  start: `${year}-${month}-${String(day).padStart(2, '0')}T${getRandomTime()}`,
}));

export function createEventId() {
  return String(eventGuid++);
}

export { INITIAL_EVENTS };
