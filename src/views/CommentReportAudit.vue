<template>
  <div class="comment-report-audit">
    <AuditRecordList :fixed-audit-type="4" />
  </div>
</template>

<script setup>
// 评论举报审核：复用通用审核记录页，固定 auditType=4
// （列表/详情/操作日志走真实接口 /audit/record/*；记录由用户端提报后产生）
import AuditRecordList from './AuditRecordList.vue'
</script>

<style scoped>
.comment-report-audit {
  padding: 20px;
}
</style>
