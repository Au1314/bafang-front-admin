<template>
  <div class="star-field" aria-hidden="true">
    <span
      v-for="s in stars"
      :key="s.id"
      class="star"
      :class="{ 'is-twinkle': s.twinkle }"
      :style="s.style"
    />
  </div>
</template>

<script setup>
// 纯 CSS 星空（替代 Unsplash 外链图）：确定性伪随机星点，离线可用、刷新不跳变
import { computed } from 'vue'

const props = defineProps({
  /** 星点数量 */
  count: { type: Number, default: 140 },
  /** 随机种子（相同种子 → 相同星空） */
  seed: { type: Number, default: 42 }
})

// mulberry32：小型确定性伪随机数生成器
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const stars = computed(() => {
  const rand = mulberry32(props.seed)
  return Array.from({ length: props.count }, (_, id) => {
    const size = 1 + rand() * 1.8
    return {
      id,
      twinkle: rand() > 0.55,
      style: {
        left: `${(rand() * 100).toFixed(2)}%`,
        top: `${(rand() * 100).toFixed(2)}%`,
        width: `${size.toFixed(2)}px`,
        height: `${size.toFixed(2)}px`,
        opacity: (0.25 + rand() * 0.75).toFixed(2),
        animationDelay: `${(rand() * 4).toFixed(2)}s`,
        animationDuration: `${(2.5 + rand() * 3).toFixed(2)}s`
      }
    }
  })
})
</script>

<style scoped>
.star-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 20% 15%, rgba(38, 62, 120, 0.35) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 80%, rgba(28, 45, 90, 0.3) 0%, transparent 55%),
    linear-gradient(180deg, #05070f 0%, #0a0f1e 55%, #05070f 100%);
}

.star {
  position: absolute;
  border-radius: 50%;
  background: #dce8ff;
  box-shadow: 0 0 4px 1px rgba(160, 195, 255, 0.5);
}

.is-twinkle {
  animation: star-twinkle infinite ease-in-out alternate;
}

@keyframes star-twinkle {
  from { opacity: 0.15; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.15); }
}
</style>
