<script setup lang="ts">
const COLORS = [
  { name: 'Blue', value: '#3b86ff' },
  { name: 'Green', value: '#2ecc71' },
  { name: 'Red', value: '#e74c3c' },
  { name: 'Purple', value: '#9b59b6' },
  { name: 'Orange', value: '#f39c12' },
] as const;

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function selectColor(value: string) {
  emit('update:modelValue', value);
}
</script>

<template>
  <div class="form-group color-group">
    <div class="color-options">
      <button
        v-for="color in COLORS"
        :key="color.value"
        class="color-btn"
        :class="{ selected: modelValue === color.value }"
        :style="{ backgroundColor: color.value }"
        :title="color.name"
        :aria-label="color.name"
        :aria-pressed="modelValue === color.value"
        @click="selectColor(color.value)"
      />
    </div>
  </div>
</template>

<style scoped>
.color-group {
  margin-top: 10px;
}

.color-options {
  display: flex;
  gap: 8px;
}

.color-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.1s;
}

.color-btn:hover {
  transform: scale(1.1);
}

.color-btn:focus-visible {
  outline: 2px solid #3b86ff;
  outline-offset: 2px;
}

.color-btn.selected {
  outline: 2px solid #ccc;
  outline-offset: 1px;
}
</style>
