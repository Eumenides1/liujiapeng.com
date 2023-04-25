<script setup lang="ts">
useHead({
  meta: [
    { property: 'og:title', content: 'Jaguar Liu' },
    { property: 'og:image', content: 'https://jaguarliu.me/og-icon.png' },
    { name: 'description', content: 'Jaguar Liu\'s Portfolio' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:creator', content: '@jaguarliu' },
  ],
})
</script>

<template>
  <NavBar />
  <main class="px-7 py-10">
    <router-view />
    <Footer />
  </main>
</template>
