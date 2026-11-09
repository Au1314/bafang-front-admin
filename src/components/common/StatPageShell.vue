<template>
  <div class="stat-page-shell">
    <el-card shadow="never" class="stat-card">
      <template #header>
        <div class="card-header">
          <span>{{ title }}</span>
        </div>
      </template>

      <!-- 操作栏：统计日期 + 更新时间 + 刷新 -->
      <div class="action-bar">
        <div class="overview-info">
          <el-tag v-if="date" type="info">统计日期：{{ date }}</el-tag>
          <el-tag type="info">数据更新时间：{{ formattedUpdateTime }}</el-tag>
        </div>
        <div class="refresh-btn">
          <el-button type="primary" :loading="loading" @click="$emit('retry')">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>

      <!-- 加载骨架 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="skeleton-grid">
            <div v-for="i in 4" :key="i" class="skeleton-item">
              <el-skeleton-item variant="text" style="width: 60%" />
              <el-skeleton-item variant="text" style="width: 40%" />
            </div>
          </div>
        </template>

        <!-- 错误提示 -->
        <div v-if="error" class="state-container">
          <el-alert
            title="数据加载失败"
            :description="error"
            type="error"
            show-icon
            :closable="false"
          />
          <el-button type="primary" style="margin-top: var(--space-4)" @click="$emit('retry')">
            重新加载
          </el-button>
        </div>

        <!-- 空数据 -->
        <div v-else-if="empty" class="state-container">
          <el-empty description="暂无数据" image="empty">
            <el-button type="primary" @click="$emit('retry')">重新加载</el-button>
          </el-empty>
        </div>

        <!-- 页面内容 -->
        <div v-else class="stat-content">
          <slot />
        </div>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script setup>
// 统计页统一外壳：标题卡 + 操作栏（日期/更新时间/刷新）+ 骨架 + 错误重试 + 空态
// 用法：
//   <StatPageShell title="..." :loading="loading" :error="error" :empty="!data"
//                  :date="data?.statsDate" :update-time="updateTime" @retry="load">
//     ...页面内容...
//   </StatPageShell>
import { computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  title: { type: String, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  empty: { type: Boolean, default: false },
  date: { type: String, default: '' },
  updateTime: { type: [Date, String], default: null }
})

defineEmits(['retry'])

const formattedUpdateTime = computed(() => {
  if (!props.updateTime) return '—'
  return props.updateTime instanceof Date
    ? props.updateTime.toLocaleString()
    : String(props.updateTime)
})
</script>

<style scoped>
.stat-page-shell {
  padding: var(--space-4) var(--space-5) var(--space-5);
}

.card-header {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
  gap: var(--space-3);
}

.overview-info {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.refresh-btn {
  margin-left: auto;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-5);
}

.skeleton-item {
  padding: var(--space-4);
  border: 1px solid var(--color-border-lighter);
  border-radius: var(--radius-md);
}

.state-container {
  text-align: center;
  padding: var(--space-6) 0;
}

.stat-content {
  padding: var(--space-4) 0 var(--space-2);
}
</style>
