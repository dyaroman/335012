<script setup lang="ts">
import type { EventApi } from '@fullcalendar/core';
import { getContrastColor } from '../utils/colors';

defineProps<{
  event: EventApi;
}>();
</script>

<template>
  <span
    class="event-content"
    :style="{
      backgroundColor:
        event.backgroundColor || event.extendedProps?.color || '#3b86ff',
      color:
        event.textColor ||
        getContrastColor(
          event.backgroundColor || event.extendedProps?.color || '#3b86ff',
        ),
    }"
    >{{ event.title }}</span
  >
</template>

<style scoped>
.event-content {
  display: block;
  width: 100%;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
