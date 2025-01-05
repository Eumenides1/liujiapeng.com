<script setup lang="ts">
defineProps<{
  name: string
  link: string
  desc: string
  icon?: string
}>()
</script>

<template>
  <a
    :href="link"
    target="_blank"
    class="block p-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-lg transition-all"
  >
    <div class="flex items-center gap-4">
      <div
        v-if="icon"
        class="text-4xl text-gray-500"
        :class="icon"
      />
      <div>
        <h3 class="text-lg font-semibold mb-1">{{ name }}</h3>
        <p class="text-sm text-gray-600">{{ desc }}</p>
      </div>
    </div>
  </a>
</template>

<style scoped>
a {
  background-color: white;
  transition: transform 0.2s ease-in-out;
}
a:hover {
  transform: translateY(-4px);
}
</style>
