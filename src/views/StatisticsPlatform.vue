<template>
  <StatPageShell
    title="用户日活/总数统计"
    :loading="loading"
    :error="error"
    :empty="!platformStats"
    :date="platformStats?.statsDate || ''"
    :update-time="updateTime"
    @retry="loadPlatformStats"
  >
    <div class="stats-grid">
      <el-card v-for="card in statCards" :key="card.label" shadow="hover" class="stats-card-item">
        <div class="stats-item-header">
          <el-icon class="stats-icon"><component :is="card.icon" /></el-icon>
          <span>{{ card.label }}</span>
        </div>
        <div class="stats-item-value">{{ card.value }}</div>
      </el-card>
    </div>
  </StatPageShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { User, Avatar, Location, Van } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import StatPageShell from '@/components/common/StatPageShell.vue'

const loading = ref(true)
const error = ref('')
const platformStats = ref(null)
const updateTime = ref(new Date())

const statCards = computed(() => {
  const s = platformStats.value || {}
  return [
    { label: '总用户数', icon: User, value: s.totalUsers ?? '—' },
    { label: '日活跃用户数', icon: Avatar, value: s.dailyActiveUsers ?? '—' },
    { label: '认证私桩数', icon: Location, value: s.authenticatedStations ?? '—' },
    { label: '认证车辆数', icon: Van, value: s.authenticatedCars ?? '—' }
  ]
})

const loadPlatformStats = async () => {
  loading.value = true
  error.value = ''
  try {
    platformStats.value = await authApi.getPlatformStats()
    updateTime.value = new Date()
  } catch (err) {
    console.error('加载平台统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPlatformStats()
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-5);
}

.stats-card-item {
  border: 1px solid var(--color-border-lighter);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stats-card-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.stats-item-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  color: var(--color-text-regular);
  font-size: var(--font-size-base);
}

.stats-icon {
  margin-right: var(--space-2);
  font-size: var(--font-size-md);
  color: var(--color-primary);
}

.stats-item-value {
  font-size: 34px;
  font-weight: bold;
  color: var(--color-text-primary);
  text-align: center;
}
</style>
