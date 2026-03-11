<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = [
  '00',
  '05',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
  '55',
];

const selectedHour = computed({
  get: () => props.modelValue.split(':')[0] || '09',
  set: (val) => {
    const [, min] = props.modelValue.split(':');
    emit('update:modelValue', `${val}:${min || '00'}`);
  },
});

const selectedMinute = computed({
  get: () => {
    const [, min] = props.modelValue.split(':');
    const m = parseInt(min || '0', 10);
    const rounded = Math.floor(m / 5) * 5;
    return String(rounded).padStart(2, '0');
  },
  set: (val) => {
    const [hour] = props.modelValue.split(':');
    emit('update:modelValue', `${hour || '09'}:${val}`);
  },
});
</script>

<template>
  <div class="form-group icon-input-group time-picker">
    <div class="time-inputs">
      <select v-model="selectedHour" class="time-select">
        <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
      </select>
      <span class="time-separator">:</span>
      <select v-model="selectedMinute" class="time-select">
        <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
      </select>
    </div>
    <svg
      class="input-icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="#ccc"
      stroke-width="2"
      fill="none"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  </div>
</template>

<style scoped>
.time-picker {
  position: relative;
  min-height: 35px;
  display: flex;
  align-items: center;
}

.time-inputs {
  display: flex;
  align-items: center;
  flex: 1;
}

.time-select {
  padding: 8px 4px;
  flex: 1;
  font-size: 16px;
  color: #333;
  text-align: center;
  border: none;
  border-bottom: 1px solid #eee;
  background: transparent;
  cursor: pointer;
  outline: none;
  appearance: none;
}

.time-select:focus {
  border-bottom-color: #3b86ff;
}

.time-separator {
  font-weight: 500;
  font-size: 16px;
  color: #333;
  user-select: none;
}

.input-icon {
  position: absolute;
  right: 0;
  top: 50%;
  z-index: 10;
  padding-left: 4px;
  display: flex;
  align-items: center;
  pointer-events: none;
  transform: translateY(-50%);
  background: white;
}
</style>
