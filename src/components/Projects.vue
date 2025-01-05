<script setup lang="ts">
import { readonly } from 'vue'

defineProps<{ projects: Record<string, any[]> }>()

const projectsReadOnly = readonly(projects)
</script>

<template>
  <div>{{ projectsReadOnly }}</div>
</template>
