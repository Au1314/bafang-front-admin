<template>
  <div class="forum-statistics-container">
    <StatPageShell
      title="论坛统计"
      :loading="loading"
      :error="error"
      :empty="!forumStats"
      :update-time="updateTime"
      @retry="loadForumStatistics"
    >
      <!-- 帖子统计 -->
      <div class="stats-section">
        <h3 class="section-title">帖子统计</h3>
        <div class="stats-grid">
          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Document /></el-icon>
              <span>总帖子数</span>
            </div>
            <div class="stats-item-value">{{ forumStats.totalPostCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Calendar /></el-icon>
              <span>今日帖子数</span>
            </div>
            <div class="stats-item-value">{{ forumStats.todayPostCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><ArrowUp /></el-icon>
              <span>置顶帖子数</span>
            </div>
            <div class="stats-item-value">{{ forumStats.topPostCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Star /></el-icon>
              <span>精华帖子数</span>
            </div>
            <div class="stats-item-value">{{ forumStats.essencePostCount }}</div>
          </el-card>
        </div>
      </div>

      <!-- 回复统计 -->
      <div class="stats-section">
        <h3 class="section-title">回复统计</h3>
        <div class="stats-grid">
          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><ChatDotRound /></el-icon>
              <span>总回复数</span>
            </div>
            <div class="stats-item-value">{{ forumStats.totalReplyCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Message /></el-icon>
              <span>今日回复数</span>
            </div>
            <div class="stats-item-value">{{ forumStats.todayReplyCount }}</div>
          </el-card>
        </div>
      </div>

      <!-- 举报统计 -->
      <div class="stats-section">
        <h3 class="section-title">举报统计</h3>
        <div class="stats-grid">
          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Warning /></el-icon>
              <span>待处理帖子举报数</span>
            </div>
            <div class="stats-item-value">{{ forumStats.pendingPostReportCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Warning /></el-icon>
              <span>待处理回复举报数</span>
            </div>
            <div class="stats-item-value">{{ forumStats.pendingReplyReportCount }}</div>
          </el-card>

          <el-card shadow="hover" class="stats-card-item">
            <div class="stats-item-header">
              <el-icon class="stats-icon"><Check /></el-icon>
              <span>本月已处理举报数</span>
            </div>
            <div class="stats-item-value">{{ forumStats.monthProcessedReportCount }}</div>
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
import { Document, Calendar, ArrowUp, Star, ChatDotRound, Message, Warning, Check } from '@element-plus/icons-vue'
import StatPageShell from '@/components/common/StatPageShell.vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const forumStats = ref(null)
const updateTime = ref(new Date())

// 加载论坛统计数据
const loadForumStatistics = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getForumStatistics()
    forumStats.value = data
    updateTime.value = new Date()
  } catch (err) {
    console.error('加载论坛统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadForumStatistics()
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
