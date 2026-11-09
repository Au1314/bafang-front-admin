<template>
  <div class="dashboard-container">
    <!-- 头部：欢迎信息 -->
    <DashboardHeader />

    <!-- 真实核心指标（/stats/screen） -->
    <DashboardRealStats />

    <!-- 待办 + 最近动态 -->
    <div class="main-content">
      <div class="content-section">
        <DashboardTodo />
      </div>
      <div class="content-section">
        <DashboardActivity />
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="content-section">
      <QuickActions />
    </div>

    <!-- 底部：系统信息 -->
    <div class="system-info">
      <RoleBasedCard header="系统信息">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">当前版本</span>
            <span class="value">v1.0.0</span>
          </div>
          <div class="info-item">
            <span class="label">在线用户数
              <el-tooltip content="当前通过 WebSocket 客服通道在线的用户端数量" placement="top">
                <el-icon style="vertical-align: -2px"><InfoFilled /></el-icon>
              </el-tooltip>
            </span>
            <span class="value">{{ onlineUsers }}</span>
          </div>
          <div class="info-item">
            <span class="label">系统状态</span>
            <el-tag type="success" size="small" effect="light">正常</el-tag>
          </div>
          <div class="info-item">
            <span class="label">最后更新</span>
            <span class="value">{{ lastLoginTime ? formatDateTime(lastLoginTime) : '暂无' }}</span>
          </div>
        </div>
      </RoleBasedCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import DashboardHeader from '@/components/DashboardHeader.vue'
import DashboardRealStats from '@/components/dashboard/DashboardRealStats.vue'
import DashboardTodo from '@/components/dashboard/DashboardTodo.vue'
import DashboardActivity from '@/components/dashboard/DashboardActivity.vue'
import QuickActions from '@/components/QuickActions.vue'
import RoleBasedCard from '@/components/permission/RoleBasedCard.vue'
import { formatDateTime } from '@/utils/dateFormat'
import { useAuthStore } from '@/store/authStore'
import { getOnlineStats } from '@/api/system'

const authStore = useAuthStore()

// 最后更新：取当前管理员信息里的更新时间
const lastLoginTime = computed(() => authStore.getAdminBaseInfo.updateTime || '')

// 在线用户数（真实来源：WS 会话统计 /stats/online）
const onlineUsers = ref(0)
const fetchOnlineUsers = async () => {
  try {
    const data = await getOnlineStats()
    onlineUsers.value = Number(data?.onlineUsers) || 0
  } catch (error) {
    console.error('获取在线人数失败:', error)
  }
}
fetchOnlineUsers()
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.content-section {
  min-width: 0;
}

.system-info {
  margin-top: var(--space-4);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-4);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-item .label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.info-item .value {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>
