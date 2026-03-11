<script setup lang="ts">
import type { NavigationAction } from '../types/calendar';

defineProps<{
  currentView: string;
  calendarTitle: string;
  isTodayActive: boolean;
}>();

const emit = defineEmits<{
  changeView: [viewType: string];
  navigate: [action: NavigationAction];
}>();

function handleViewChange(viewType: string) {
  emit('changeView', viewType);
}

function handleNavigate(action: NavigationAction) {
  emit('navigate', action);
}
</script>

<template>
  <div class="custom-header">
    <div class="header-top">
      <h2 class="title">Calendar View</h2>
      <div class="button-group">
        <button
          :class="{ active: currentView === 'dayGridMonth' }"
          @click="handleViewChange('dayGridMonth')"
          aria-label="Month view"
        >
          Month
        </button>
        <button
          :class="{ active: currentView === 'timeGridWeek' }"
          @click="handleViewChange('timeGridWeek')"
          aria-label="Week view"
        >
          Week
        </button>
        <button
          :class="{ active: currentView === 'timeGridDay' }"
          @click="handleViewChange('timeGridDay')"
          aria-label="Day view"
        >
          Day
        </button>
        <button
          :class="{ active: currentView === 'listWeek' }"
          @click="handleViewChange('listWeek')"
          aria-label="Agenda view"
        >
          Agenda
        </button>
      </div>
    </div>
    <div class="header-bottom">
      <div>
        <div class="button-group nav-group">
          <button
            :class="{ active: isTodayActive }"
            @click="handleNavigate('today')"
            aria-label="Go to today"
          >
            Today
          </button>
          <button @click="handleNavigate('prev')" aria-label="Previous">
            Back
          </button>
          <button @click="handleNavigate('next')" aria-label="Next">
            Next
          </button>
        </div>
      </div>
      <h3 class="title">{{ calendarTitle }}</h3>
      <div></div>
    </div>
  </div>
</template>

<style scoped>
.custom-header {
  max-width: 1100px;
  margin: 0 auto 20px;
}

.header-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

@media (min-width: 768px) {
  .header-top {
    flex-direction: row;
    justify-content: space-between;
    gap: 0;
  }
}

.title {
  margin: 0;
  font-weight: 400;
  font-size: 18px;
  color: #333;
}

.button-group {
  display: inline-flex;
  border: 1px solid #d7dae2;
  border-radius: 4px;
  box-shadow: 0px 2px 3px #0000000d;
}

.button-group button {
  height: 32px;
  padding: 8px 16px;
  font-size: 13px;
  color: #555;
  background: white;
  border: none;
  border-right: 1px solid #d7dae2;
  cursor: pointer;
  outline: none;
  transition:
    background 0.2s,
    color 0.2s;
}

.button-group button:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.button-group button:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-right: none;
}

.button-group button:hover {
  background: #f8f9fa;
}

.button-group button:focus-visible {
  outline: 2px solid #3b86ff;
  outline-offset: 2px;
  z-index: 1;
}

.button-group button.active {
  color: #3b86ff;
  background: #f0f7ff;
}

.header-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

@media (min-width: 768px) {
  .header-bottom {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0;
  }
}
</style>
