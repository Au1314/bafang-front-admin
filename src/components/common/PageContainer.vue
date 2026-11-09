<template>
  <div class="page-container">
    <!-- 标题区 -->
    <div v-if="title || $slots.header" class="page-header">
      <div class="page-header-text">
        <h2 v-if="title" class="page-title">{{ title }}</h2>
        <div v-if="description" class="page-description">{{ description }}</div>
      </div>
      <div v-if="$slots.actions" class="page-header-actions">
        <slot name="actions" />
      </div>
    </div>

    <!-- 内容区 -->
    <slot />
  </div>
</template>

<script setup>
// 统一页面容器：标题/描述/主操作区 + 内容
// 用法：<PageContainer title="用户管理" description="..."> <template #actions>...</template> 内容 </PageContainer>
defineProps({
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.page-container {
  padding: var(--space-5);
  min-height: calc(100vh - var(--layout-header-height) - 48px);
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  flex-wrap: wrap;
}

.page-header-text {
  min-width: 0;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.page-description {
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.page-header-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}
</style>
