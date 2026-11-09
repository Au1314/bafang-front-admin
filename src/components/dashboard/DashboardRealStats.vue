<template>
  <el-row :gutter="16" class="real-stats">
    <el-col v-for="card in cards" :key="card.key" :xs="12" :sm="12" :md="6">
      <el-card shadow="never" class="stat-card" :class="`tone-${card.tone}`">
        <el-skeleton v-if="loading" :rows="1" animated style="padding: 4px 0" />
        <template v-else>
          <div class="stat-icon">
            <el-icon :size="22"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-value">
              {{ card.display }}<span class="stat-unit">{{ card.unit }}</span>
            </div>
            <div class="stat-label">{{ card.label }}</div>
          </div>
          <div class="stat-foot">
            <span class="stat-sub">{{ card.sub }}</span>
          </div>
        </template>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
// 数据驾驶舱：真实核心指标（GET /stats/screen）
import { ref, computed, onMounted } from 'vue'
import { Odometer, Coin, User, Warning } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

const loading = ref(true)
const stats = ref(null)

const fmt = (v, digits = 0) => {
  if (stats.value == null) return '—'
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('zh-CN', { maximumFractionDigits: digits })
}

const cards = computed(() => {
  const s = stats.value
  return [
    {
      key: 'charge',
      label: '总充电电量',
      unit: 'kWh',
      icon: Odometer,
      tone: 'blue',
      display: fmt(s?.totalChargeAmount, 1),
      sub: `今日 +${fmt(s?.todayChargeAmount, 1)} kWh`
    },
    {
      key: 'revenue',
      label: '订单总额',
      unit: '元',
      icon: Coin,
      tone: 'gold',
      display: fmt(s?.totalRevenue, 2),
      sub: `今日 ¥${fmt(s?.todayRevenue, 2)}`
    },
    {
      key: 'users',
      label: '平台用户',
      unit: '人',
      icon: User,
      tone: 'green',
      display: fmt(s?.totalUsers),
      sub: `今日活跃 ${fmt(s?.dailyActiveUsers)}`
    },
    {
      key: 'fault',
      label: '故障私桩',
      unit: '台',
      icon: Warning,
      tone: Number(s?.faultPileCount) > 0 ? 'red' : 'gray',
      display: fmt(s?.faultPileCount),
      sub: `今日紧急呼叫 ${fmt(s?.todayEmergencyCalls)}`
    }
  ]
})

onMounted(async () => {
  try {
    stats.value = await authApi.getScreenStats()
  } catch (error) {
    console.error('获取大屏汇总失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.real-stats {
  margin-bottom: var(--space-4);
}

.stat-card :deep(.el-card__body) {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 86px;
  overflow: hidden;
}

.stat-card.tone-blue .stat-icon { color: #409EFF; background: var(--color-primary-light); }
.stat-card.tone-gold .stat-icon { color: #E6A23C; background: var(--color-warning-light); }
.stat-card.tone-green .stat-icon { color: #67C23A; background: var(--color-success-light); }
.stat-card.tone-red .stat-icon { color: #F56C6C; background: var(--color-danger-light); }
.stat-card.tone-gray .stat-icon { color: #909399; background: var(--color-info-light); }

.stat-card.tone-red { border-top: 3px solid var(--color-danger); }

.stat-icon {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-body {
  min-width: 0;
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
  white-space: nowrap;
}

.stat-unit {
  font-size: var(--font-size-xs);
  font-weight: 400;
  color: var(--color-text-secondary);
  margin-left: 4px;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.stat-foot {
  position: absolute;
  right: var(--space-4);
  bottom: 10px;
}

.stat-sub {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
}
</style>
