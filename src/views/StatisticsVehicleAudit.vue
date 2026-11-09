<template>
  <div class="vehicle-audit-statistics-container">
    <StatPageShell
      title="车主审核认证统计"
      :loading="loading"
      :error="error"
      :empty="!vehicleAuditStats"
      :update-time="updateTime"
      @retry="loadVehicleAuditStatistics"
    >
      <div class="stats-grid">
        <el-card shadow="hover" class="stats-card-item">
          <div class="stats-item-header">
            <el-icon class="stats-icon"><Clock /></el-icon>
            <span>待审核</span>
          </div>
          <div class="stats-item-value">{{ vehicleAuditStats.pending }}</div>
        </el-card>

        <el-card shadow="hover" class="stats-card-item">
          <div class="stats-item-header">
            <el-icon class="stats-icon"><Loading /></el-icon>
            <span>审核中</span>
          </div>
          <div class="stats-item-value">{{ vehicleAuditStats.processing }}</div>
        </el-card>

        <el-card shadow="hover" class="stats-card-item">
          <div class="stats-item-header">
            <el-icon class="stats-icon"><Check /></el-icon>
            <span>已通过</span>
          </div>
          <div class="stats-item-value">{{ vehicleAuditStats.approved }}</div>
        </el-card>

        <el-card shadow="hover" class="stats-card-item">
          <div class="stats-item-header">
            <el-icon class="stats-icon"><Close /></el-icon>
            <span>已拒绝</span>
          </div>
          <div class="stats-item-value">{{ vehicleAuditStats.rejected }}</div>
        </el-card>

        <el-card shadow="hover" class="stats-card-item">
          <div class="stats-item-header">
            <el-icon class="stats-icon"><EditPen /></el-icon>
            <span>需要补充材料</span>
          </div>
          <div class="stats-item-value">{{ vehicleAuditStats.needsSupplement }}</div>
        </el-card>

        <el-card shadow="hover" class="stats-card-item">
          <div class="stats-item-header">
            <el-icon class="stats-icon"><Calendar /></el-icon>
            <span>今日处理</span>
          </div>
          <div class="stats-item-value">{{ vehicleAuditStats.todayProcessed }}</div>
        </el-card>
      </div>
    </StatPageShell>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { Clock, Loading, Check, Close, EditPen, Calendar } from '@element-plus/icons-vue'
import StatPageShell from '@/components/common/StatPageShell.vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const vehicleAuditStats = ref(null)
const updateTime = ref(new Date())

// 加载车主审核认证统计数据
const loadVehicleAuditStatistics = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getVehicleAuditStatistics()
    vehicleAuditStats.value = data
    updateTime.value = new Date()
  } catch (err) {
    console.error('加载车主审核认证统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadVehicleAuditStatistics()
})
</script>

<style scoped>

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
