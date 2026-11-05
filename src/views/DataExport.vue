<template>
  <div class="data-export-container">
    <el-card shadow="never" class="data-export-card">
      <template #header>
        <div class="card-header">
          <span>数据导出管理</span>
          <el-alert
            type="info"
            :closable="false"
            :show-icon="true"
            style="margin-left: 20px; flex: 1; max-width: 560px"
          >
            导出为真实 CSV 文件并立即通过浏览器下载；每次导出都会写入系统日志（模块：数据导出）
          </el-alert>
        </div>
      </template>

      <!-- 导出功能列表 -->
      <div class="export-functions">
        <!-- 审核记录导出 -->
        <el-card shadow="hover" class="export-card">
          <template #header>
            <div class="export-card-header">
              <el-icon class="card-icon"><Document /></el-icon>
              <span>审核记录导出</span>
            </div>
          </template>
          <div class="export-description">
            导出系统所有审核记录（CSV），包括私桩认证、车主认证、投诉、故障等，支持按类型与提交时间筛选
          </div>
          <div class="export-filters">
            <el-date-picker
              v-model="exportParams.auditRecords.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 300px; margin-right: 10px"
            />
            <el-select
              v-model="exportParams.auditRecords.auditType"
              placeholder="审核类型"
              style="width: 150px; margin-right: 10px"
              clearable
            >
              <el-option label="全部" :value="null" />
              <el-option label="私桩认证" :value="0" />
              <el-option label="车主认证" :value="1" />
              <el-option label="充电桩投诉" :value="2" />
              <el-option label="充电桩故障" :value="3" />
              <el-option label="评论举报" :value="4" />
              <el-option label="交易申诉" :value="5" />
            </el-select>
          </div>
          <div class="export-actions">
            <el-button
              type="primary"
              @click="handleExport('auditRecords')"
              :loading="exportLoading.auditRecords"
              size="large"
            >
              <el-icon><Download /></el-icon>
              导出审核记录
            </el-button>
            <el-tag v-if="exportStatus.auditRecords" :type="exportStatus.auditRecords === 'success' ? 'success' : 'warning'">
              {{ exportStatus.auditRecords === 'success' ? '导出成功' : '导出中...' }}
            </el-tag>
          </div>
        </el-card>

        <!-- 用户数据导出 -->
        <el-card shadow="hover" class="export-card">
          <template #header>
            <div class="export-card-header">
              <el-icon class="card-icon"><User /></el-icon>
              <span>用户数据导出</span>
            </div>
          </template>
          <div class="export-description">
            导出全部用户信息（CSV），包括用户名、手机号、认证状态、积分余额等
          </div>
          <div class="export-actions">
            <el-button
              type="primary"
              @click="handleExport('orderUser')"
              :loading="exportLoading.orderUser"
              size="large"
            >
              <el-icon><Download /></el-icon>
              导出用户数据
            </el-button>
            <el-tag v-if="exportStatus.orderUser" :type="exportStatus.orderUser === 'success' ? 'success' : 'warning'">
              {{ exportStatus.orderUser === 'success' ? '导出成功' : '导出中...' }}
            </el-tag>
          </div>
        </el-card>

        <!-- 订单明细导出 -->
        <el-card shadow="hover" class="export-card">
          <template #header>
            <div class="export-card-header">
              <el-icon class="card-icon"><Wallet /></el-icon>
              <span>订单明细导出</span>
            </div>
          </template>
          <div class="export-description">
            导出订单明细（CSV），包含电量、单价、金额与创建时间，支持按类型与时间筛选
          </div>
          <div class="export-filters">
            <el-date-picker
              v-model="exportParams.orderDetails.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 300px; margin-right: 10px"
            />
            <el-select
              v-model="exportParams.orderDetails.orderType"
              placeholder="订单类型"
              style="width: 150px; margin-right: 10px"
              clearable
            >
              <el-option label="全部" :value="null" />
              <el-option label="公桩充电" :value="0" />
              <el-option label="私桩充电" :value="1" />
              <el-option label="V2V充电" :value="2" />
            </el-select>
          </div>
          <div class="export-actions">
            <el-button
              type="primary"
              @click="handleExport('orderDetails')"
              :loading="exportLoading.orderDetails"
              size="large"
            >
              <el-icon><Download /></el-icon>
              导出订单明细
            </el-button>
            <el-tag v-if="exportStatus.orderDetails" :type="exportStatus.orderDetails === 'success' ? 'success' : 'warning'">
              {{ exportStatus.orderDetails === 'success' ? '导出成功' : '导出中...' }}
            </el-tag>
          </div>
        </el-card>

        <!-- 导出记录（真实审计：来自系统日志 module=数据导出） -->
        <el-card shadow="hover" class="export-card record-card">
          <template #header>
            <div class="export-card-header">
              <el-icon class="card-icon"><Clock /></el-icon>
              <span>导出记录</span>
              <el-button size="small" text type="primary" style="margin-left: auto" @click="fetchExportRecords">
                <el-icon><RefreshRight /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <el-table :data="exportRecords" v-loading="recordsLoading" size="small" style="width: 100%">
            <el-table-column prop="createTime" label="时间" width="180" />
            <el-table-column prop="adminName" label="操作人" width="160">
              <template #default="scope">
                {{ scope.row.adminName || ('管理员#' + scope.row.adminId) }}
              </template>
            </el-table-column>
            <el-table-column prop="action" label="操作" min-width="160" />
            <el-table-column prop="url" label="接口" min-width="220" show-overflow-tooltip />
            <el-table-column prop="ip" label="IP" width="140" />
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import {
  Document,
  Wallet,
  User,
  Clock,
  Download,
  RefreshRight
} from '@element-plus/icons-vue'

const authStore = useAuthStore()

// 导出加载状态
const exportLoading = reactive({
  auditRecords: false,
  orderUser: false,
  orderDetails: false
})

// 导出状态
const exportStatus = reactive({
  auditRecords: null,
  orderUser: null,
  orderDetails: null
})

// 导出参数
const exportParams = reactive({
  auditRecords: {
    dateRange: [],
    auditType: null
  },
  orderDetails: {
    dateRange: [],
    orderType: null
  }
})

// 导出记录（真实审计数据）
const exportRecords = ref([])
const recordsLoading = ref(false)

// 触发浏览器下载
const triggerDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

// 处理导出（真实接口：CSV 文件流）
const handleExport = async (type) => {
  try {
    exportLoading[type] = true
    exportStatus[type] = 'exporting'

    let blob
    let name
    if (type === 'auditRecords') {
      const p = exportParams.auditRecords
      blob = await authApi.exportAuditRecords({ dateRange: p.dateRange, auditType: p.auditType })
      name = '审核记录'
    } else if (type === 'orderUser') {
      blob = await authApi.exportOrderUserData()
      name = '用户数据'
    } else if (type === 'orderDetails') {
      const p = exportParams.orderDetails
      blob = await authApi.exportOrderDetails({ dateRange: p.dateRange, orderType: p.orderType })
      name = '订单明细'
    } else {
      return
    }

    const date = new Date().toISOString().slice(0, 10)
    triggerDownload(blob, `${name}_${date}.csv`)
    ElMessage.success(`${name}导出成功`)
    exportStatus[type] = 'success'
    fetchExportRecords()

    setTimeout(() => {
      exportStatus[type] = null
    }, 3000)
  } catch (error) {
    console.error(`${type}导出失败:`, error)
    ElMessage.error(`${type === 'auditRecords' ? '审核记录' : type === 'orderUser' ? '用户数据' : '订单明细'}导出失败`)
    exportStatus[type] = null
  } finally {
    exportLoading[type] = false
  }
}

// 获取导出记录（系统日志 module=数据导出）
const fetchExportRecords = async () => {
  try {
    recordsLoading.value = true
    const data = await authApi.getExportRecords({
      module: '数据导出',
      page: 1,
      size: 10
    }) || {}
    exportRecords.value = data?.list || []
  } catch (error) {
    console.error('获取导出记录失败:', error)
  } finally {
    recordsLoading.value = false
  }
}

// 组件挂载时检查权限并加载导出记录
onMounted(() => {
  if (!authStore.isSuperAdmin) {
    ElMessage.error('没有访问权限')
  }
  fetchExportRecords()
})
</script>

<style scoped>
.data-export-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: var(--color-bg-page);
}

.data-export-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.export-functions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.export-card {
  margin-bottom: 10px;
  border-left: 4px solid var(--color-primary);
}

.record-card {
  border-left-color: var(--color-success);
}

.export-card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.card-icon {
  margin-right: 8px;
  color: var(--color-primary);
  font-size: 18px;
}

.export-description {
  margin: 15px 0;
  color: var(--color-text-regular);
  line-height: 1.5;
}

.export-filters {
  margin: 15px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.export-actions {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}
</style>
