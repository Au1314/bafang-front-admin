<template>
  <div class="customer-service-stats-container">
    <StatPageShell
      title="个人客服统计"
      :loading="loading"
      :error="error"
      :empty="!statsData"
      :update-time="updateTime"
      @retry="loadStatsData"
    >
      <div class="stats-info">
        <div class="admin-info">
          <h3>{{ statsData.adminName }}的客服统计</h3>
        </div>

        <div class="stats-grid">
          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Calendar /></el-icon>
              <span>今日接待量</span>
            </div>
            <div class="stats-item-value">{{ statsData.todayCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Check /></el-icon>
              <span>今日完成量</span>
            </div>
            <div class="stats-item-value">{{ statsData.todayCompletedCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Timer /></el-icon>
              <span>进行中量</span>
            </div>
            <div class="stats-item-value">{{ statsData.ongoingCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><ChatDotRound /></el-icon>
              <span>消息量</span>
            </div>
            <div class="stats-item-value">{{ statsData.messageCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Clock /></el-icon>
              <span>平均响应时间</span>
            </div>
            <div class="stats-item-value">{{ formattedAvgResponseTime }}</div>
          </el-card>
        </div>
      </div>
    </StatPageShell>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { Calendar, Check, Timer, ChatDotRound, Clock } from '@element-plus/icons-vue'
import StatPageShell from '@/components/common/StatPageShell.vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const statsData = ref(null)
const updateTime = ref(new Date())

// 格式化平均响应时间（秒 -> 分:秒）
const formattedAvgResponseTime = computed(() => {
  if (!statsData.value) return '00:00'
  const seconds = statsData.value.avgResponseTime
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// 加载统计数据
const loadStatsData = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getMyCustomerServiceStats()
    statsData.value = data
    updateTime.value = new Date()
  } catch (err) {
    console.error('加载个人客服统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadStatsData()
})
</script>

<style scoped>

.admin-info {
  margin-bottom: 24px;
  text-align: center;
}

.admin-info h3 {
  margin: 0 0 8px 0;
  color: var(--color-text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stats-card-item {
  border: 1px solid var(--color-border-lighter);
  transition: all 0.3s ease;
}

.stats-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.stats-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: var(--color-text-regular);
  font-size: 14px;
}

.stats-icon {
  margin-right: 8px;
  font-size: 18px;
  color: var(--color-primary);
}

.stats-item-value {
  font-size: 36px;
  font-weight: bold;
  color: var(--color-text-primary);
  text-align: center;
}
</style>
