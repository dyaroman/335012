<script setup lang="ts">
import { ref } from 'vue';
import FullCalendar from '@fullcalendar/vue3';

import { useCalendar } from './composables/useCalendar';
import CalendarHeader from './components/CalendarHeader.vue';
import EventContent from './components/EventContent.vue';
import EventPopover from './components/EventPopover.vue';

import type { NavigationAction, EventData } from './types/calendar';

import './assets/calendar.css';

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);

const {
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
  triggerElement,
} = useCalendar();

initCalendarOptions(() => calendarRef.value?.getApi());

function changeView(viewType: string) {
  const api = calendarRef.value?.getApi();
  if (api) {
    api.changeView(viewType);
  }
}

function navigate(action: NavigationAction) {
  const api = calendarRef.value?.getApi();
  if (api) {
    if (action === 'today') api.today();
    else if (action === 'prev') api.prev();
    else if (action === 'next') api.next();
  }
}

function onPopoverSave(data: EventData) {
  saveEvent(data, calendarRef.value?.getApi());
}

function onPopoverDelete(id: string) {
  deleteEvent(id, calendarRef.value?.getApi());
}

function restoreFocus() {
  triggerElement.value?.focus();
}
</script>

<template>
  <div class="app-container">
    <div class="calendar-app">
      <div class="calendar-main">
        <CalendarHeader
          :current-view="currentView"
          :calendar-title="calendarTitle"
          :is-today-active="isTodayActive"
          @change-view="changeView"
          @navigate="navigate"
        />
        <FullCalendar
          ref="calendarRef"
          class="calendar-view"
          :options="calendarOptions"
        >
          <template v-slot:eventContent="arg">
            <EventContent :event="arg.event" />
          </template>
        </FullCalendar>
      </div>
      <EventPopover
        :visible="showPopover"
        :position="popoverPosition"
        :selected-date="selectedDateTime.date"
        :selected-time="selectedDateTime.time || undefined"
        :edit-data="editingEvent"
        :trigger-element="triggerElement"
        @close="closePopover"
        @save="onPopoverSave"
        @delete="onPopoverDelete"
        @restore-focus="restoreFocus"
      />
    </div>
  </div>
</template>

<style lang="css">
body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  font-family: 'Source Sans 3', sans-serif;
  background-color: #f0f0f7;
}

* {
  font-family: inherit;
  box-sizing: border-box;
}

.app-container {
  max-width: 1170px;
  padding: 20px;
  margin: 0 auto;
}

.calendar-app {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 20px;
  font-size: 14px;
  background-color: #fff;
  box-shadow: 0px 2px 6px #0000000a;
}
</style>
