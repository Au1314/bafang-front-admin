<template>
  <div class="transaction-appeal-audit">
    <AuditRecordList :fixed-audit-type="5" />
  </div>
</template>

<script setup>
// 交易申诉审核：复用通用审核记录页，固定 auditType=5
// （列表/详情/操作日志走真实接口 /audit/record/*；记录由用户端提报后产生）
import AuditRecordList from './AuditRecordList.vue'
</script>

<style scoped>
.transaction-appeal-audit {
  padding: 20px;
}
</style>
