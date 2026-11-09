<template>
  <div class="private-station-statistics-container">
    <StatPageShell
      title="私桩分布数据统计"
      :loading="loading"
      :error="error"
      :empty="!privateStationStats"
      :update-time="updateTime"
      @retry="loadPrivateStationDistribution"
    >
      <!-- 状态分布 -->
      <div class="stats-section">
        <h3 class="section-title">状态分布</h3>
        <div class="distribution-grid">
          <div v-for="item in processedStatusDistribution" :key="item.status" class="distribution-item">
            <el-card shadow="hover" class="distribution-card">
              <div class="distribution-item-header">
                <span class="distribution-name">{{ item.statusName }}</span>
              </div>
              <div class="distribution-item-value">{{ item.count }}</div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 类型分布 -->
      <div class="stats-section">
        <h3 class="section-title">类型分布</h3>
        <div class="distribution-grid">
          <div v-for="item in processedTypeDistribution" :key="item.type" class="distribution-item">
            <el-card shadow="hover" class="distribution-card">
              <div class="distribution-item-header">
                <span class="distribution-name">{{ item.typeName }}</span>
              </div>
              <div class="distribution-item-value">{{ item.count }}</div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 电流类型分布 -->
      <div class="stats-section">
        <h3 class="section-title">电流类型分布</h3>
        <div class="distribution-grid">
          <div v-for="item in processedCurrentTypeDistribution" :key="item.currentType" class="distribution-item">
            <el-card shadow="hover" class="distribution-card">
              <div class="distribution-item-header">
                <span class="distribution-name">{{ item.currentTypeName }}</span>
              </div>
              <div class="distribution-item-value">{{ item.count }}</div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 认证状态分布 -->
      <div class="stats-section">
        <h3 class="section-title">认证状态分布</h3>
        <div class="distribution-grid">
          <div v-for="item in processedAuthStatusDistribution" :key="item.authStatus" class="distribution-item">
            <el-card shadow="hover" class="distribution-card">
              <div class="distribution-item-header">
                <span class="distribution-name">{{ item.authStatusName }}</span>
              </div>
              <div class="distribution-item-value">{{ item.count }}</div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 开放状态分布 -->
      <div class="stats-section">
        <h3 class="section-title">开放状态分布</h3>
        <div class="distribution-grid">
          <div v-for="item in processedOpenStatusDistribution" :key="item.openStatus" class="distribution-item">
            <el-card shadow="hover" class="distribution-card">
              <div class="distribution-item-header">
                <span class="distribution-name">{{ item.openStatusName }}</span>
              </div>
              <div class="distribution-item-value">{{ item.count }}</div>
            </el-card>
          </div>
        </div>
      </div>
    </StatPageShell>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import StatPageShell from '@/components/common/StatPageShell.vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const privateStationStats = ref(null)
const updateTime = ref(new Date())

// 定义完整的分布类型列表
// 状态分布
const allStatusTypes = [
  { status: 0, statusName: '空闲' },
  { status: 1, statusName: '使用中' },
  { status: 2, statusName: '离线' },
  { status: 3, statusName: '异常' }
]

// 类型分布
const allPrivateStationTypes = [
  { type: 0, typeName: '普通私桩' },
  { type: 1, typeName: '专业私桩' }
]

// 电流类型分布
const allCurrentTypes = [
  { currentType: 0, currentTypeName: '直流电' },
  { currentType: 1, currentTypeName: '交流电' }
]

// 认证状态分布
const allAuthStatusTypes = [
  { authStatus: 0, authStatusName: '未认证' },
  { authStatus: 1, authStatusName: '认证中' },
  { authStatus: 2, authStatusName: '已认证' },
  { authStatus: 3, authStatusName: '认证失败' }
]

// 开放状态分布
const allOpenStatusTypes = [
  { openStatus: 0, openStatusName: '关闭' },
  { openStatus: 1, openStatusName: '开启' }
]

// 通用处理函数
const processDistributionData = (allTypes, apiData, keyField) => {
  const apiDataMap = new Map(apiData.map(item => [item[keyField], item]))

  return allTypes.map(type => {
    const apiItem = apiDataMap.get(type[keyField])
    return {
      ...type,
      count: apiItem ? apiItem.count : 0
    }
  })
}

// 处理后的分布数据
const processedStatusDistribution = computed(() => {
  if (!privateStationStats.value) return []
  const apiData = privateStationStats.value.statusDistribution || []
  return processDistributionData(allStatusTypes, apiData, 'status')
})

const processedTypeDistribution = computed(() => {
  if (!privateStationStats.value) return []
  const apiData = privateStationStats.value.typeDistribution || []
  return processDistributionData(allPrivateStationTypes, apiData, 'type')
})

const processedCurrentTypeDistribution = computed(() => {
  if (!privateStationStats.value) return []
  const apiData = privateStationStats.value.currentTypeDistribution || []
  return processDistributionData(allCurrentTypes, apiData, 'currentType')
})

const processedAuthStatusDistribution = computed(() => {
  if (!privateStationStats.value) return []
  const apiData = privateStationStats.value.authStatusDistribution || []
  return processDistributionData(allAuthStatusTypes, apiData, 'authStatus')
})

const processedOpenStatusDistribution = computed(() => {
  if (!privateStationStats.value) return []
  const apiData = privateStationStats.value.openStatusDistribution || []
  return processDistributionData(allOpenStatusTypes, apiData, 'openStatus')
})

// 加载私桩分布数据统计
const loadPrivateStationDistribution = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getPrivateStationDistribution()
    privateStationStats.value = data
    updateTime.value = new Date()
  } catch (err) {
    console.error('加载私桩分布数据统计失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadPrivateStationDistribution()
})
</script>

<style scoped>

.stats-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid var(--color-primary);
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.distribution-item {
  display: flex;
  justify-content: center;
}

.distribution-card {
  width: 100%;
  border: 1px solid var(--color-border-lighter);
  transition: all 0.3s ease;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.distribution-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.distribution-item-header {
  margin-bottom: 12px;
  text-align: center;
}

.distribution-name {
  font-size: 16px;
  color: var(--color-text-regular);
  font-weight: 500;
}

.distribution-item-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--color-text-primary);
}
</style>
