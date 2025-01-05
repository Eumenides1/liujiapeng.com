<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const canvas = ref<HTMLCanvasElement | null>(null);

function initParticleRain() {
  const ctx = canvas.value!.getContext("2d")!;
  const width = (canvas.value!.width = window.innerWidth);
  const height = (canvas.value!.height = window.innerHeight);

  const particles = Array.from({ length: 300 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 1, // 粒子大小
    speedY: Math.random() * 2 + 1, // 垂直速度
    opacity: Math.random() * 0.5 + 0.2, // 粒子透明度
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)"; // 拖影效果
    ctx.fillRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.y += particle.speedY;
      if (particle.y > height) particle.y = -particle.size;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${particle.opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

onMounted(() => {
  if (canvas.value) {
    initParticleRain();
    window.addEventListener("resize", () => {
      canvas.value!.width = window.innerWidth;
      canvas.value!.height = window.innerHeight;
    });
  }
});

onUnmounted(() => {
  if (canvas.value) {
    const ctx = canvas.value.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  }
});
</script>

<template>
  <div class="particle-container">
    <canvas ref="canvas" />
  </div>
</template>

<style scoped>
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 不干扰页面交互 */
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
