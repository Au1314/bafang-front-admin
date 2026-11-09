<template>
  <el-card shadow="never" class="todo-card">
    <template #header>
      <div class="card-header">
        <span>待办事项</span>
        <el-tag v-if="totalTodo > 0" type="danger" size="small" effect="dark">{{ totalTodo }}</el-tag>
        <el-tag v-else type="success" size="small" effect="plain">全部处理完</el-tag>
      </div>
    </template>

    <el-skeleton v-if="loading" :rows="3" animated />
    <template v-else>
      <div
        v-for="item in todoItems"
        :key="item.label"
        class="todo-item"
        :class="{ 'is-zero': item.count === 0 }"
        @click="item.count > 0 && go(item.path)"
      >
        <div class="todo-left">
          <span class="todo-dot" :style="{ background: item.color }" />
          <span class="todo-label">{{ item.label }}</span>
        </div>
        <div class="todo-right">
          <span class="todo-count" :style="{ color: item.count > 0 ? item.color : undefined }">
            {{ item.count }}
          </span>
          <el-icon class="todo-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
      <div v-if="!todoItems.length" class="todo-empty">暂无待办数据</div>
    </template>
  </el-card>
</template>

<script setup>
// 待办面板：真实待审核数（GET /audit/record/statistics）+ 会话/紧急（/stats/screen）
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import { getAuditStatistics } from '@/api/audit'

const router = useRouter()
const loading = ref(true)
const auditStats = ref(null)
const screenStats = ref(null)

const totalTodo = computed(() => todoItems.value.reduce((sum, i) => sum + i.count, 0))

const todoItems = computed(() => {
  const a = auditStats.value
  const s = screenStats.value
  if (!a && !s) return []
  return [
    { label: '待审核申请', count: Number(a?.pendingCount) || 0, color: '#E6A23C', path: '/audit/record-list' },
    { label: '审核中事项', count: Number(a?.processingCount) || 0, color: '#409EFF', path: '/audit/record-list' },
    { label: '待接入客服会话', count: Number(s?.pendingConversations) || 0, color: '#67C23A', path: '/customer-service' },
    { label: '今日紧急呼叫', count: Number(s?.todayEmergencyCalls) || 0, color: '#F56C6C', path: '/emergency' }
  ]
})

const go = (path) => router.push(path)

onMounted(async () => {
  try {
    const [a, s] = await Promise.allSettled([getAuditStatistics(), authApi.getScreenStats()])
    if (a.status === 'fulfilled') auditStats.value = a.value
    if (s.status === 'fulfilled') screenStats.value = s.value
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-2);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.todo-item:not(.is-zero):hover {
  background: var(--color-bg-hover);
}

.todo-item.is-zero {
  cursor: default;
  opacity: 0.55;
}

.todo-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.todo-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-pill);
}

.todo-label {
  font-size: var(--font-size-base);
  color: var(--color-text-regular);
}

.todo-right {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.todo-count {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text-primary);
}

.todo-arrow {
  color: var(--color-text-placeholder);
  font-size: 12px;
}

.todo-empty {
  text-align: center;
  color: var(--color-text-placeholder);
  padding: var(--space-4) 0;
}
</style>
