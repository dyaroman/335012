<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';

import { useDatePicker } from '../composables/useDatePicker';
import ColorPicker from './ColorPicker.vue';
import DateSelector from './DateSelector.vue';
import TimeSelector from './TimeSelector.vue';
import type { EventData, PopoverPosition } from '../types/calendar';

const DEFAULT_COLOR = '#3b86ff';

const props = defineProps<{
  visible: boolean;
  position: PopoverPosition;
  selectedDate: string;
  selectedTime?: string;
  editData?: EventData | null;
  triggerElement: HTMLElement | null;
}>();

const emit = defineEmits<{
  close: [];
  save: [data: EventData];
  delete: [id: string];
  'restore-focus': [];
}>();

const title = ref('');
const selectedColor = ref<string>(DEFAULT_COLOR);
const note = ref('');
const popoverContainer = ref<HTMLElement | null>(null);
const titleInput = ref<HTMLInputElement | null>(null);
const isDiscardConfirming = ref(false);
let discardConfirmTimeout: ReturnType<typeof setTimeout> | null = null;

const {
  time,
  date,
  syncFromProps,
  formatDisplayTime,
  parseInputDate,
  getCurrentDateDisplay,
  setDateFromInput,
  getIsoDate,
} = useDatePicker(
  () => ({ date: props.selectedDate, timeStr: props.selectedTime || '' }),
  () => props.editData || null,
);

const titleLength = computed(() => title.value.length);
const isTitleTooLong = computed(() => titleLength.value > 30);
const isEdit = computed(() => !!props.editData);

watch(
  () => props.visible,
  async (newVal) => {
    if (newVal) {
      syncFromProps();
      if (props.editData) {
        title.value = props.editData.title;
        selectedColor.value = props.editData.color;
        note.value = props.editData.note;
      } else {
        title.value = '';
        selectedColor.value = DEFAULT_COLOR;
        note.value = '';
      }
      isDiscardConfirming.value = false;
      await nextTick();
      titleInput.value?.focus();
    }
  },
);

function handleClose() {
  emit('close');
  emit('restore-focus');
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    handleClose();
    return;
  }

  if (e.key === 'Tab') {
    const focusable = popoverContainer.value?.querySelectorAll<HTMLElement>(
      'button, input, select, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusable || focusable.length === 0) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }
}

function handleSave() {
  if (!title.value.trim() || isTitleTooLong.value) return;
  emit('save', {
    id: props.editData?.id,
    title: title.value.trim(),
    date: getIsoDate(),
    time: time.value,
    color: selectedColor.value,
    note: note.value.trim(),
  });
  handleClose();
}

function handleDelete() {
  if (props.editData?.id) {
    emit('delete', props.editData.id);
    handleClose();
  }
}

function handleDiscard() {
  if (isDiscardConfirming.value) {
    if (discardConfirmTimeout) {
      clearTimeout(discardConfirmTimeout);
      discardConfirmTimeout = null;
    }
    isDiscardConfirming.value = false;
    handleDelete();
  } else if (isEdit.value) {
    isDiscardConfirming.value = true;
    discardConfirmTimeout = setTimeout(() => {
      isDiscardConfirming.value = false;
      discardConfirmTimeout = null;
    }, 3000);
  } else {
    handleClose();
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="popoverContainer"
      class="event-popover"
      :class="{ 'popover-above': position.isAbove }"
      :style="{ top: `${position.top}px`, left: `${position.left}px` }"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-label="Event form"
      @keydown="handleKeydown"
    >
      <div
        class="popover-arrow"
        :style="{
          left: position.arrowOffset ? `${position.arrowOffset}px` : '50%',
        }"
      ></div>
      <button class="close-btn" @click="handleClose" aria-label="Close">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="#ccc"
          stroke-width="2"
          fill="none"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </button>

      <div class="popover-body">
        <div class="form-group form-group-title">
          <div class="input-with-counter">
            <input
              ref="titleInput"
              v-model="title"
              type="text"
              placeholder="Event name"
              maxlength="35"
              class="borderless-input title-input"
            />
            <span v-if="isTitleTooLong" class="char-counter error"
              >{{ titleLength }}/30</span
            >
          </div>
        </div>

        <DateSelector
          :model-value="date"
          :get-current-date-display="getCurrentDateDisplay"
          :set-date-from-input="setDateFromInput"
          :parse-input-date="parseInputDate"
        />

        <TimeSelector v-model="time" :format-display-time="formatDisplayTime" />

        <div class="form-group">
          <input
            v-model="note"
            type="text"
            placeholder="notes"
            class="borderless-input note-input"
          />
        </div>

        <ColorPicker v-model="selectedColor" />
      </div>

      <div class="popover-footer">
        <button
          class="btn-text btn-discard"
          :class="{ confirming: isDiscardConfirming }"
          @click="handleDiscard"
        >
          {{ isDiscardConfirming ? 'CONFIRM?' : isEdit ? 'DISCARD' : 'CANCEL' }}
        </button>
        <button
          class="btn-text btn-save"
          @click="handleSave"
          :disabled="!title.trim() || isTitleTooLong"
        >
          {{ isEdit ? 'EDIT' : 'SAVE' }}
        </button>
      </div>
    </div>
    <div v-if="visible" class="popover-backdrop" @click="handleClose" />
  </Teleport>
</template>

<style scoped>
.event-popover {
  position: fixed;
  z-index: 1000;
  width: 200px;
  padding: 25px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.popover-arrow {
  position: absolute;
  top: -8px;
  left: 50%;
  width: 0;
  height: 0;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}

.popover-above .popover-arrow {
  top: auto;
  bottom: -8px;
  border-bottom: none;
  border-top: 8px solid white;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 0;
  line-height: 1;
  background: none;
  border: none;
  cursor: pointer;
}

.close-btn svg {
  transition: stroke 0.2s;
}

.close-btn:hover svg {
  stroke: #666;
}

.popover-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
}

.form-group {
  position: relative;
}

.borderless-input {
  width: 100%;
  padding: 8px 0;
  font-size: 14px;
  color: #333;
  border: none;
  border-bottom: 1px solid #eee;
  background: transparent;
  outline: none;
}

.borderless-input::placeholder {
  color: #aaa;
  font-style: italic;
}

.borderless-input:focus-visible {
  border-bottom-color: #3b86ff;
}

.title-input {
  font-weight: 500;
  color: #3b86ff;
  border-bottom: 1px solid #eee;
}

.input-with-counter {
  position: relative;
}

.char-counter.error {
  position: absolute;
  right: 0;
  bottom: -15px;
  font-size: 11px;
  color: #e74c3c;
}

.popover-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-text {
  padding: 5px;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.5px;
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-text:focus-visible {
  outline: 2px solid #3b86ff;
  outline-offset: 2px;
}

.btn-text.btn-discard {
  color: #e74c3c;
}

.btn-text.btn-discard.confirming {
  color: #c0392b;
  font-weight: 700;
  animation: pulse 0.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.btn-text.btn-save {
  color: #999;
}

.btn-text.btn-save:not(:disabled):hover {
  color: #3b86ff;
}

.btn-text:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-text:not(:disabled):hover {
  opacity: 0.8;
}

.popover-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}
</style>
