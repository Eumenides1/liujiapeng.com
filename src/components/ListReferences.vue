<script setup lang="ts">
defineProps<{ references: Record<string, any[]> }>()
</script>

<template>
  <template v-for="key in Object.keys(references)" :key="key">
    <h4 class="mt-10 font-bold">
      {{ key }}
    </h4>
    <div class="project-grid py-2 -mx-3 gap-2">
      <a
        v-for="(item, idx) in references[key]"
        :key="idx"
        class="item relative flex items-center"
        :href="item.link"
        target="_blank"
        :class="
          !item.link ? 'opacity-0 pointer-events-none h-0 -mt-8 -mb-4' : ''
        "
        :title="item.name"
      >
        <div v-if="item.icon" class="pt-2 pr-5">
          <Slidev v-if="item.icon === 'slidev'" class="text-4xl opacity-50" />
          <VueUse
            v-else-if="item.icon === 'vueuse'"
            class="text-4xl opacity-50"
          />
          <VueReactivity
            v-else-if="item.icon === 'vue-reactivity'"
            class="text-4xl opacity-50"
          />
          <VueDemi
            v-else-if="item.icon === 'vue-demi'"
            class="text-4xl opacity-50"
          />
          <Unocss
            v-else-if="item.icon === 'unocss'"
            class="text-4xl opacity-50"
          />
          <Vitest
            v-else-if="item.icon === 'vitest'"
            class="text-4xl opacity-50"
          />
          <Elk v-else-if="item.icon === 'elk'" class="text-4xl opacity-50" />
          <div
            v-else
            class="text-3xl opacity-50"
            :class="item.icon || 'i-carbon-unknown'"
          />
        </div>
        <div class="flex-auto">
          <div class="text-normal">{{ item.name }}</div>
          <div class="desc text-sm opacity-50 font-normal" v-html="item.desc" />
        </div>
      </a>
    </div>
  </template>
  <div class="markdown pb5">
    <p op75>
      <em> Thanks for getting intersted in my works! </em>
    </p>
  </div>
</template>

<style scoped>
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.project-grid a.item {
  padding: 0.8em 1em;
  background: transparent;
  font-size: 1.1rem;
}

.project-grid a.item:hover {
  background: #88888808;
}
</style>
