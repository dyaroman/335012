<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  getCurrentDateDisplay: () => string;
  setDateFromInput: (input: string) => void;
  parseInputDate: (
    input: string,
  ) => { day: number; month: number; year: number } | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputValue = ref(props.modelValue || props.getCurrentDateDisplay());
const isValid = ref(true);
const isFocused = ref(false);

watch(
  () => props.modelValue,
  (newVal) => {
    if (!isFocused.value) {
      inputValue.value = newVal || props.getCurrentDateDisplay();
    }
  },
);

function applyMask(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8);

  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const cursorPos = target.selectionStart || 0;
  const oldValue = inputValue.value;

  const masked = applyMask(target.value);
  inputValue.value = masked;

  const newCursorPos = calculateNewCursorPosition(cursorPos, oldValue, masked);
  emit('update:modelValue', masked);

  setTimeout(() => {
    target.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);
}

function calculateNewCursorPosition(
  oldPos: number,
  oldValue: string,
  newValue: string,
): number {
  const oldDigits = oldValue.replace(/\D/g, '').length;
  const newDigits = newValue.replace(/\D/g, '').length;

  if (newDigits <= 2) return newDigits;
  if (newDigits <= 4) return newDigits + 1;
  return newDigits + 2;
}

function handleBlur() {
  isFocused.value = false;

  if (!inputValue.value || inputValue.value.length < 10) {
    inputValue.value = props.getCurrentDateDisplay();
    props.setDateFromInput(inputValue.value);
    emit('update:modelValue', inputValue.value);
    isValid.value = true;
    return;
  }

  const parsed = props.parseInputDate(inputValue.value);
  if (parsed) {
    isValid.value = true;
    inputValue.value = `${String(parsed.day).padStart(2, '0')}/${String(parsed.month).padStart(2, '0')}/${String(parsed.year).padStart(4, '0')}`;
    props.setDateFromInput(inputValue.value);
    emit('update:modelValue', inputValue.value);
  } else {
    isValid.value = false;
    inputValue.value = props.getCurrentDateDisplay();
    props.setDateFromInput(inputValue.value);
    emit('update:modelValue', inputValue.value);
  }
}

function handleFocus() {
  isFocused.value = true;
}
</script>

<template>
  <div class="form-group icon-input-group custom-date-input">
    <input
      v-model="inputValue"
      type="text"
      inputmode="numeric"
      placeholder="dd/mm/yyyy"
      maxlength="10"
      class="date-input"
      :class="{ 'input-error': !isValid }"
      aria-label="Date"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <svg
      class="input-icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="#ccc"
      stroke-width="2"
      fill="none"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  </div>
</template>

<style scoped>
.custom-date-input {
  position: relative;
  min-height: 35px;
  display: flex;
  align-items: center;
}

.date-input {
  width: 100%;
  padding: 8px 0;
  font-size: 16px;
  color: #333;
  border: none;
  border-bottom: 1px solid #eee;
  background: transparent;
  outline: none;
}

.date-input::placeholder {
  color: #aaa;
  font-style: italic;
}

.date-input::placeholder {
  color: #aaa;
  font-style: italic;
}

.date-input:focus {
  border-bottom-color: #3b86ff;
}

.input-error {
  color: #e74c3c;
}

.input-icon {
  position: absolute;
  right: 0;
  top: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  transform: translateY(-50%);
  background: white;
  padding-left: 4px;
  pointer-events: none;
}
</style>
