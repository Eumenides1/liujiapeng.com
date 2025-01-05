<script setup lang="ts">
defineProps<{ links: Record<string, { name: string, link: string, icon?: string }[]> }>()

// 简单的跳转函数
function navigate(link: string) {
  window.open(link, '_blank')
}

// 定义圆形卡片样式
const cardClass
  = 'bg-white shadow-md p-4 rounded-full flex items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer'
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <div v-for="(category, categoryName) in links" :key="categoryName" class="mb-10">
      <h2 class="text-xl font-semibold mb-4">
        {{ categoryName }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="(link, idx) in category"
          :key="idx"
          class="flex flex-col items-center"
          @click="navigate(link.link)"
        >
          <div :class="cardClass" style="width: 100px; height: 100px">
            <img
              v-if="link.icon"
              :src="link.icon"
              :alt="link.name"
              class="w-16 h-16 object-cover rounded-full"
            >
            <span v-else class="text-lg font-bold">{{ link.name[0] }}</span>
          </div>
          <span class="mt-2 text-sm text-gray-600 text-center">{{ link.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 可选全局背景色，提升页面对比 */
body {
  background-color: #f9f9f9;
}
</style>
