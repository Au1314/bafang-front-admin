<template>
  <div class="complaint-statistics-container">
    <StatPageShell
      title="故障/投诉统计"
      :loading="loading"
      :error="error"
      :empty="!complaintStats"
      :update-time="updateTime"
      @retry="loadComplaintStatistics"
    >
      <!-- 投诉统计 -->
      <div class="stats-section">
        <h3 class="section-title">投诉统计</h3>
        <div class="stats-grid">
          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Document /></el-icon>
              <span>投诉总数</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.complaintTotal }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Clock /></el-icon>
              <span>待处理投诉</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.complaintPending }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Loading /></el-icon>
              <span>处理中投诉</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.complaintProcessing }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Check /></el-icon>
              <span>已通过投诉</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.complaintPassed }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Close /></el-icon>
              <span>已拒绝投诉</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.complaintRejected }}</div>
          </el-card>
        </div>
      </div>

      <!-- 故障统计 -->
      <div class="stats-section">
        <h3 class="section-title">故障统计</h3>
        <div class="stats-grid">
          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Document /></el-icon>
              <span>故障总数</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.faultTotal }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Clock /></el-icon>
              <span>待处理故障</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.faultPending }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Loading /></el-icon>
              <span>处理中故障</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.faultProcessing }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Check /></el-icon>
              <span>已通过故障</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.faultPassed }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Close /></el-icon>
              <span>已拒绝故障</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.faultRejected }}</div>
          </el-card>
        </div>
      </div>

      <!-- 其他统计 -->
      <div class="stats-section">
        <h3 class="section-title">其他统计</h3>
        <div class="stats-grid">
          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Warning /></el-icon>
              <span>紧急情况</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.urgentCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Calendar /></el-icon>
              <span>今日统计</span>
            </div>
            <div class="stats-item-value">{{ complaintStats.todayCount }}</div>
          </el-card>
        </div>
      </div>
    </StatPageShell>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { Document, Clock, Loading, Check, Close, Warning, Calendar } from '@element-plus/icons-vue'
import StatPageShell from '@/components/common/StatPageShell.vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const complaintStats = ref(null)
const updateTime = ref(new Date())

// 加载故障/投诉统计数据
const loadComplaintStatistics = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getComplaintStatistics()
    complaintStats.value = data
    updateTime.value = new Date()
  } catch (err) {
    console.error('加载故障/投诉统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadComplaintStatistics()
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
