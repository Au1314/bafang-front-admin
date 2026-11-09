<template>
  <div class="audit-statistics-container">
    <StatPageShell
      title="审核统计"
      :loading="loading"
      :error="error"
      :empty="!auditStats"
      :update-time="updateTime"
      @retry="loadAuditStatistics"
    >
      <!-- 审核状态统计 -->
      <div class="stats-section">
        <h3 class="section-title">审核状态统计</h3>
        <div class="stats-grid">
          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Document /></el-icon>
              <span>审核总数</span>
            </div>
            <div class="stats-item-value">{{ auditStats.totalCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Clock /></el-icon>
              <span>待处理数</span>
            </div>
            <div class="stats-item-value">{{ auditStats.pendingCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Loading /></el-icon>
              <span>处理中数</span>
            </div>
            <div class="stats-item-value">{{ auditStats.processingCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Check /></el-icon>
              <span>已通过数</span>
            </div>
            <div class="stats-item-value">{{ auditStats.approvedCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Close /></el-icon>
              <span>已拒绝数</span>
            </div>
            <div class="stats-item-value">{{ auditStats.rejectedCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Calendar /></el-icon>
              <span>今日审核数</span>
            </div>
            <div class="stats-item-value">{{ auditStats.todayCount }}</div>
          </el-card>
        </div>
      </div>

      <!-- 审核类型统计 -->
      <div class="stats-section">
        <h3 class="section-title">审核类型统计</h3>
        <el-table :data="auditStats.typeStatistics" border style="width: 100%">
          <el-table-column prop="auditTypeName" label="审核类型" align="center" />
          <el-table-column prop="count" label="总数" align="center" />
          <el-table-column prop="pendingCount" label="待处理数" align="center" />
          <el-table-column label="处理率" align="center">
            <template #default="scope">
              <el-progress
                :percentage="calculateProcessRate(scope.row)"
                :color="getProcessRateColor(scope.row)"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </StatPageShell>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { Document, Clock, Loading, Check, Close, Calendar } from '@element-plus/icons-vue'
import StatPageShell from '@/components/common/StatPageShell.vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const auditStats = ref(null)
const updateTime = ref(new Date())

// 计算处理率
const calculateProcessRate = (row) => {
  if (row.count === 0) return 0
  return Math.round(((row.count - row.pendingCount) / row.count) * 100)
}

// 获取处理率颜色
const getProcessRateColor = (row) => {
  const rate = calculateProcessRate(row)
  if (rate >= 90) return 'var(--color-success)'
  if (rate >= 70) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

// 加载审核统计数据
const loadAuditStatistics = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getAuditStatistics()
    auditStats.value = data
    updateTime.value = new Date()
  } catch (err) {
    console.error('加载审核统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadAuditStatistics()
})
</script>

<style scoped>

.stats-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid var(--color-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stats-card-item {
  border: 1px solid var(--color-border-lighter);
  transition: all 0.3s ease;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  justify-content: center;
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
