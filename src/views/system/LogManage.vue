<template>
  <div class="log-manage">
    <!-- 筛选 -->
    <FilterBar @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="操作模块">
          <el-select v-model="filterForm.module" placeholder="全部模块" clearable filterable style="width: 180px">
            <el-option v-for="m in moduleOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作行为">
          <el-input v-model="filterForm.action" placeholder="按行为关键字" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="全部" :value="null" />
            <el-option label="成功" :value="1" />
            <el-option label="失败" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
    </FilterBar>

    <!-- 列表 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
          <span class="total-count">共 {{ total }} 条</span>
        </div>
      </template>
      <el-table v-loading="loading" :data="logList" stripe style="width: 100%" @row-click="showDetail">
        <el-table-column prop="createTime" label="时间" width="170" />
        <el-table-column label="操作人" width="140">
          <template #default="scope">
            {{ scope.row.adminName || (scope.row.adminId ? '管理员#' + scope.row.adminId : (scope.row.userName || '用户#' + scope.row.userId)) }}
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="130" />
        <el-table-column prop="action" label="操作" min-width="170" show-overflow-tooltip />
        <el-table-column prop="method" label="方法" width="80" />
        <el-table-column prop="url" label="接口" min-width="230" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP" width="130" />
        <el-table-column label="状态" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="small">
              {{ scope.row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="executionTime" label="耗时(ms)" width="100">
          <template #default="scope">
            {{ scope.row.executionTime ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click.stop="showDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="日志详情" size="480px">
      <el-skeleton v-if="detailLoading" :rows="8" animated />
      <template v-else-if="detail">
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="时间">{{ detail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ detail.adminName || (detail.adminId ? '管理员#' + detail.adminId : '用户#' + detail.userId) }}</el-descriptions-item>
          <el-descriptions-item label="模块 / 操作">{{ detail.module }} / {{ detail.action }}</el-descriptions-item>
          <el-descriptions-item label="请求">{{ detail.method }} {{ detail.url }}</el-descriptions-item>
          <el-descriptions-item label="IP">{{ detail.ip || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detail.status === 1 ? 'success' : 'danger'" size="small">
              {{ detail.status === 1 ? '成功' : '失败' }}
            </el-tag>
            <span v-if="detail.executionTime != null" style="margin-left: 8px">耗时 {{ detail.executionTime }}ms</span>
          </el-descriptions-item>
          <el-descriptions-item label="User-Agent">
            <span class="ua-text">{{ detail.userAgent || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="detail.params" class="json-section">
          <div class="json-title">请求参数</div>
          <pre class="json-block">{{ pretty(detail.params) }}</pre>
        </div>
        <div v-if="detail.result" class="json-section">
          <div class="json-title">返回结果</div>
          <pre class="json-block">{{ pretty(detail.result) }}</pre>
        </div>
        <div v-if="detail.errorMsg" class="json-section">
          <div class="json-title error">错误信息</div>
          <pre class="json-block error">{{ detail.errorMsg }}</pre>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getLogList, getLogDetail, getLogModules } from '@/api/system'
import FilterBar from '@/components/common/FilterBar.vue'

// 后端 SystemLogQueryDTO 分页参数名为 page / size
const logList = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)

const moduleOptions = ref([])
const filterForm = reactive({
  module: null,
  action: '',
  status: null,
  dateRange: []
})

const buildParams = () => ({
  module: filterForm.module || undefined,
  action: filterForm.action || undefined,
  status: filterForm.status ?? undefined,
  startTime: filterForm.dateRange?.[0] || undefined,
  endTime: filterForm.dateRange?.[1] ? filterForm.dateRange[1] + ' 23:59:59' : undefined,
  page: page.value,
  size: size.value
})

const fetchList = async () => {
  try {
    loading.value = true
    const data = await getLogList(buildParams()) || {}
    logList.value = data.list || []
    total.value = Number(data.total) || 0
  } catch (error) {
    console.error('获取操作日志失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchList()
}

const handleReset = () => {
  Object.assign(filterForm, { module: null, action: '', status: null, dateRange: [] })
  page.value = 1
  size.value = 20
  fetchList()
}

const handleSizeChange = () => {
  page.value = 1
  fetchList()
}

// 详情
const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref(null)

const pretty = (text) => {
  if (text == null) return ''
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch (e) {
    return String(text)
  }
}

const showDetail = async (row) => {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = row
  try {
    const data = await getLogDetail(row.id)
    if (data) detail.value = { ...row, ...data }
  } catch (error) {
    console.error('获取日志详情失败:', error)
  } finally {
    detailLoading.value = false
  }
}

const fetchModules = async () => {
  try {
    moduleOptions.value = await getLogModules() || []
  } catch (error) {
    console.error('获取模块列表失败:', error)
  }
}

onMounted(() => {
  fetchModules()
  fetchList()
})
</script>

<style scoped>
.log-manage {
  padding: var(--space-5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.total-count {
  font-size: 14px;
  color: var(--color-text-regular);
  font-weight: normal;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.ua-text {
  word-break: break-all;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.json-section {
  margin-top: 16px;
}

.json-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.json-title.error {
  color: var(--color-danger);
}

.json-block {
  margin: 0;
  padding: 10px;
  max-height: 220px;
  overflow: auto;
  background: #f7f8fa;
  border: 1px solid var(--color-border-light);
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.json-block.error {
  background: #fef0f0;
  border-color: #fbc4c4;
}
</style>
