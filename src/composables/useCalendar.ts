import { ref, reactive, onMounted, onUnmounted } from 'vue';
import type {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  DatesSetArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { INITIAL_EVENTS, createEventId } from '../event-utils';
import { getContrastColor } from '../utils/colors';
import type {
  EventData,
  PopoverPosition,
  SelectedDateTime,
} from '../types/calendar';

export function useCalendar() {
  const calendarTitle = ref('');
  const currentView = ref('dayGridMonth');
  const isTodayActive = ref(false);

  const calendarOptions = reactive<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    headerToolbar: false,
    initialView: 'dayGridMonth',
    initialEvents: INITIAL_EVENTS,
    editable: true,
    eventDurationEditable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    slotEventOverlap: false,
    eventOrder: 'start,-duration,allDay,title',
  });

  const showPopover = ref(false);
  const popoverPosition = ref<PopoverPosition>({
    top: 0,
    left: 0,
    arrowOffset: 100,
    isAbove: false,
  });
  const lastTargetElement = ref<HTMLElement | null>(null);

  const selectedDateTime = reactive<SelectedDateTime>({ date: '', time: '' });
  const editingEvent = ref<EventData | null>(null);

  function updatePopoverPosition() {
    if (!showPopover.value || !lastTargetElement.value) return;

    let el = lastTargetElement.value;

    // Robust recovery: If element is detached (e.g. after FullCalendar re-render),
    // try to find it again by date if it's a day cell.
    if (!document.contains(el)) {
      if (selectedDateTime.date && !editingEvent.value) {
        const recoveredEl = document.querySelector(
          `[data-date="${selectedDateTime.date}"]`,
        );
        if (recoveredEl) {
          el = recoveredEl as HTMLElement;
          lastTargetElement.value = el;
        }
      }
    }

    if (!document.contains(el)) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    const targetCenterX = rect.left + rect.width / 2;
    let isAbove = false;
    let top = rect.bottom + 5;
    let left = targetCenterX - 100;

    if (top + 400 > window.innerHeight) {
      top = rect.top - 400 - 5;
      isAbove = true;
    }

    if (left < 10) {
      left = 10;
    } else if (left + 200 > window.innerWidth) {
      left = window.innerWidth - 200 - 10;
    }
    const arrowOffset = targetCenterX - left;
    popoverPosition.value = { top, left, arrowOffset, isAbove };
  }

  function handleDateSelect(selectInfo: DateSelectArg) {
    editingEvent.value = null;

    const target = selectInfo.jsEvent?.target as HTMLElement;
    const dayCell = target
      ? target.closest('.fc-daygrid-day') || target.closest('.fc-timegrid-slot')
      : null;

    const dateStr: string = String(selectInfo.startStr).split('T')[0] ?? '';
    const timeMatch = String(selectInfo.startStr).match(/T(\d{2}:\d{2})/);
    const timeStr: string = timeMatch?.[1] ?? '';

    selectedDateTime.date = dateStr;
    selectedDateTime.time = timeStr;

    if (dayCell) {
      lastTargetElement.value = dayCell as HTMLElement;
    } else {
      lastTargetElement.value = null;
    }

    showPopover.value = true;
    updatePopoverPosition();
  }

  function closePopover() {
    showPopover.value = false;
    editingEvent.value = null;
    lastTargetElement.value = null;
  }

  function saveEvent(data: EventData, calendarApi: any) {
    const startDateTime = `${data.date}T${data.time}:00`;
    const endDateTime = `${data.date}T${data.time}:00`;
    const isAllDay = data.time === '00:00';

    if (calendarApi) {
      if (data.id) {
        const event = calendarApi.getEventById(data.id);
        if (event) {
          event.setProp('title', data.title);
          event.setStart(startDateTime);
          event.setEnd(endDateTime);
          event.setProp('allDay', isAllDay);
          event.setProp('backgroundColor', data.color);
          event.setProp('borderColor', data.color);
          event.setProp('textColor', getContrastColor(data.color));
          event.setExtendedProp('color', data.color);
          event.setExtendedProp('note', data.note);
        }
      } else {
        calendarApi.addEvent({
          id: createEventId(),
          title: data.title,
          start: startDateTime,
          end: endDateTime,
          allDay: isAllDay,
          backgroundColor: data.color,
          borderColor: data.color,
          textColor: getContrastColor(data.color),
          extendedProps: {
            color: data.color,
            note: data.note,
          },
        });
      }
    }
  }

  function deleteEvent(id: string, calendarApi: any) {
    if (calendarApi) {
      const event = calendarApi.getEventById(id);
      if (event) {
        event.remove();
      }
    }
  }

  function handleEventClick(clickInfo: EventClickArg) {
    lastTargetElement.value = clickInfo.el;

    const event = clickInfo.event;
    const startParts = event.startStr.split('T');
    const startDate = startParts[0] || '';
    const time = (startParts[1] || '00:00').substring(0, 5);

    editingEvent.value = {
      id: event.id,
      title: event.title,
      date: startDate,
      time: time,
      color: event.backgroundColor || event.extendedProps?.color || '#3b86ff',
      note: event.extendedProps?.note || '',
    };

    showPopover.value = true;
    updatePopoverPosition();
  }

  function handleDatesSet(dateInfo: DatesSetArg) {
    calendarTitle.value = dateInfo.view.title;
    currentView.value = dateInfo.view.type;

    const now = new Date();
    const start = dateInfo.view.currentStart;
    const end = dateInfo.view.currentEnd;
    isTodayActive.value = now >= start && now < end;
  }

  let resizeTicking = false;
  const handleResize = () => {
    if (showPopover.value && !resizeTicking) {
      resizeTicking = true;
      requestAnimationFrame(() => {
        updatePopoverPosition();
        resizeTicking = false;
      });
    }
  };

  function initCalendarOptions(calendarApiGetter: () => any) {
    calendarOptions.select = handleDateSelect;
    calendarOptions.eventClick = handleEventClick;
    calendarOptions.datesSet = handleDatesSet;
    calendarOptions.windowResize = () => {
      handleResize();
    };
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  return {
    calendarTitle,
    currentView,
    calendarOptions,
    showPopover,
    popoverPosition,
    selectedDateTime,
    editingEvent,
    isTodayActive,
    closePopover,
    saveEvent,
    deleteEvent,
    initCalendarOptions,
    triggerElement: lastTargetElement,
  };
}
