import { ref, computed, watch } from 'vue';

export function useDatePicker(
  initialDate: () => { date: string; timeStr: string },
  editData: () => { date: string; time: string } | null,
) {
  const year = ref<number>(new Date().getFullYear());
  const month = ref<number>(new Date().getMonth() + 1);
  const day = ref<number>(new Date().getDate());
  const time = ref('09:00');

  function getInitialDateDisplay() {
    const y = String(year.value).padStart(4, '0');
    const m = String(month.value).padStart(2, '0');
    const d = String(day.value).padStart(2, '0');
    return `${d}/${m}/${y}`;
  }

  const date = ref(getInitialDateDisplay());

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 5 + i,
  );

  const months = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 },
  ];

  const days = computed(() => {
    const daysInMonth = new Date(year.value, month.value, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  });

  watch([year, month, day], () => {
    date.value = formatForDisplay(day.value, month.value, year.value);
  });

  function isValidDate(d: number, m: number, y: number): boolean {
    if (d < 1 || m < 1 || m > 12 || y < 1) return false;
    const daysInMonth = new Date(y, m, 0).getDate();
    return d <= daysInMonth;
  }

  function parseInputDate(
    input: string,
  ): { day: number; month: number; year: number } | null {
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length < 8) return null;

    const day = parseInt(cleaned.slice(0, 2), 10);
    const month = parseInt(cleaned.slice(2, 4), 10);
    const year = parseInt(cleaned.slice(4, 8), 10);

    if (isValidDate(day, month, year)) {
      return { day, month, year };
    }
    return null;
  }

  function formatForDisplay(d: number, m: number, y: number): string {
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(m).padStart(2, '0');
    const yearStr = String(y).padStart(4, '0');
    return `${dayStr}/${monthStr}/${yearStr}`;
  }

  function getCurrentDateDisplay(): string {
    return formatForDisplay(day.value, month.value, year.value);
  }

  function setDateFromInput(input: string) {
    const parsed = parseInputDate(input);
    if (parsed) {
      day.value = parsed.day;
      month.value = parsed.month;
      year.value = parsed.year;
    }
  }

  function syncFromProps() {
    const { date: dateStr, timeStr } = initialDate();
    const edit = editData();

    if (edit) {
      const [y = '', m = '', d = ''] = edit.date.split('-');
      year.value = parseInt(y) || new Date().getFullYear();
      month.value = parseInt(m) || 1;
      day.value = parseInt(d) || 1;
      time.value = edit.time || '09:00';
    } else {
      const [y = '', m = '', d = ''] = dateStr.split('-');
      year.value = parseInt(y) || new Date().getFullYear();
      month.value = parseInt(m) || new Date().getMonth() + 1;
      day.value = parseInt(d) || new Date().getDate();

      if (timeStr) {
        const timeParts = timeStr.split(':');
        const hours = timeParts[0] ?? '09';
        const minutes = timeParts[1] ?? '00';
        time.value = `${String(hours).padStart(2, '0')}:${minutes}`;
      } else {
        time.value = '09:00';
      }
    }
  }

  function formatDisplayTime(timeStr: string) {
    if (!timeStr) return '';
    return timeStr;
  }

  function getIsoDate(): string {
    const y = String(year.value).padStart(4, '0');
    const m = String(month.value).padStart(2, '0');
    const d = String(day.value).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return {
    year,
    month,
    day,
    time,
    date,
    years,
    months,
    days,
    syncFromProps,
    formatDisplayTime,
    parseInputDate,
    formatForDisplay,
    getCurrentDateDisplay,
    setDateFromInput,
    getIsoDate,
  };
}
