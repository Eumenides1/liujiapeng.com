<script setup lang="ts">
import { onMounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)

function initParticleNetwork() {
  const ctx = canvas.value!.getContext('2d')!
  const width = (canvas.value!.width = window.innerWidth)
  const height = (canvas.value!.height = window.innerHeight)

  // 粒子数组
  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 2, // 粒子大小
    dx: Math.random() * 0.5 - 0.25, // 水平移动速度
    dy: Math.random() * 0.5 - 0.25, // 垂直移动速度
  }))

  function drawParticles() {
    ctx.clearRect(0, 0, width, height)

    // 绘制粒子
    particles.forEach((particle) => {
      particle.x += particle.dx
      particle.y += particle.dy

      // 边界反弹
      if (particle.x < 0 || particle.x > width)
        particle.dx *= -1
      if (particle.y < 0 || particle.y > height)
        particle.dy *= -1

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fill()
    })

    // 连接粒子
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 100) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(0, 0, 0, ${1 - distance / 100})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    requestAnimationFrame(drawParticles)
  }

  drawParticles()
}

onMounted(() => {
  if (canvas.value)
    initParticleNetwork()
})
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
