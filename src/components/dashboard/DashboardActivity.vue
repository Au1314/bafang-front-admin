<template>
  <el-card shadow="never" class="activity-card">
    <template #header>
      <div class="card-header">
        <span>最近动态</span>
        <el-button size="small" text type="primary" @click="router.push('/system/log')">
          全部日志
        </el-button>
      </div>
    </template>

    <el-skeleton v-if="loading" :rows="4" animated />
    <template v-else>
      <el-timeline v-if="logs.length">
        <el-timeline-item
          v-for="log in logs"
          :key="log.id"
          :type="statusType(log.status)"
          :timestamp="log.createTime"
          placement="top"
        >
          <div class="log-line">
            <span class="log-operator">{{ operator(log) }}</span>
            <span class="log-text">{{ log.module }} · {{ log.action }}</span>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无操作记录" :image-size="80" />
    </template>
  </el-card>
</template>

<script setup>
// 最近动态：真实系统日志（GET /system/log/list 最近 8 条，替代此前本地生成的假时间线）
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getLogList } from '@/api/system'

const router = useRouter()
const loading = ref(true)
const logs = ref([])

const operator = (log) =>
  log.adminName || (log.adminId ? `管理员#${log.adminId}` : log.userName || `用户#${log.userId || '系统'}`)

const statusType = (status) => (status === 1 ? 'primary' : 'danger')

onMounted(async () => {
  try {
    const data = await getLogList({ page: 1, size: 8 }) || {}
    logs.value = data.list || []
  } catch (error) {
    console.error('获取最近动态失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: baseline;
}

.log-operator {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}

.log-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
