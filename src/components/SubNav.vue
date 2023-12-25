<script setup lang="ts">
import { useRoute } from 'vue-router'
import { englishOnly } from '../logics'

const inactiveStyle = 'opacity-20 hover:opacity-50'
const activeStyle = 'opacity-100 underline'

const route = useRoute()
</script>

<template>
  <div class="prose m-auto mb-8 select-none animate-none! op100!">
    <button flex="~ gap1" items-center mb2 op30 text-sm @click="englishOnly = !englishOnly">
      <div :i="englishOnly ? 'carbon-checkbox-checked' : 'carbon-checkbox'" />
      English Only
    </button>

    <div mb-0 flex="~ col gap-1 sm:row sm:gap-3 wrap" text-3xl>
      <router-link to="/posts" class="!border-none !font-400" :class="route.path === '/posts' ? activeStyle : inactiveStyle">
        Blog
      </router-link>
      <router-link to="/streams" class="!border-none !font-400" :class="route.path === '/streams' ? activeStyle : inactiveStyle">
        Cutting-Edge
      </router-link>
    </div>
  </div>
</template>
