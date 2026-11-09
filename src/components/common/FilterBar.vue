<template>
  <el-card shadow="never" class="filter-bar">
    <div class="filter-bar-body">
      <div class="filter-bar-fields">
        <slot />
      </div>
      <div v-if="!hideActions" class="filter-bar-actions">
        <slot name="actions">
          <el-button type="primary" @click="$emit('search')">查询</el-button>
          <el-button @click="$emit('reset')">重置</el-button>
        </slot>
      </div>
    </div>
  </el-card>
</template>

<script setup>
// 统一筛选栏容器：字段区 + 操作区（查询/重置）
// 用法：<FilterBar @search="..." @reset="..."> <el-form-item .../> ... </FilterBar>
//      自定义按钮时用 #actions 插槽并设 hide-actions
defineProps({
  hideActions: {
    type: Boolean,
    default: false
  }
})

defineEmits(['search', 'reset'])
</script>

<style scoped>
.filter-bar {
  margin-bottom: var(--space-4);
}

.filter-bar-body {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: flex-start;
}

.filter-bar-fields {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

/* 透传给内部 el-form-item 的统一间距（消解各页手写的 margin-right） */
.filter-bar-fields :deep(.el-form-item) {
  margin: 0;
}

.filter-bar-actions {
  flex: 0 0 auto;
  display: flex;
  gap: var(--space-2);
  margin-left: auto;
}
</style>
