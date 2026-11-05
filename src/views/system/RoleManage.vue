<template>
  <div class="role-manage">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>管理员身份管理</span>
          <span class="total-count">共 {{ total }} 名管理员</span>
        </div>
      </template>

      <el-table v-loading="loading" :data="memberList" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="头像" width="70">
          <template #default="scope">
            <el-avatar :size="34" :src="scope.row.avatar || ''">{{ (scope.row.name || scope.row.username || '?').slice(0, 1) }}</el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="name" label="昵称" min-width="130">
          <template #default="scope">
            {{ scope.row.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="身份" width="140">
          <template #default="scope">
            <el-tag :type="typeTag(scope.row.type)" size="small">
              {{ scope.row.typeName || typeName(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170">
          <template #default="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="170">
          <template #default="scope">
            {{ scope.row.lastLoginTime ? formatDateTime(scope.row.lastLoginTime) : '从未登录' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-tooltip
              :disabled="canChangeType"
              content="仅超级管理员可修改身份"
              placement="top"
            >
              <span>
                <el-button
                  size="small"
                  type="primary"
                  plain
                  :disabled="!canChangeType"
                  @click="openTypeDialog(scope.row)"
                >
                  修改身份
                </el-button>
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 修改身份弹窗 -->
    <el-dialog v-model="typeDialogVisible" title="修改管理员身份" width="420px">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      >
        目标：{{ currentMember?.name || currentMember?.username }}（ID: {{ currentMember?.id }}）。
        超级管理员不可被修改，也不允许修改自己的身份。
      </el-alert>
      <el-form label-width="90px">
        <el-form-item label="新身份" required>
          <el-select v-model="newType" placeholder="请选择身份" style="width: 100%">
            <el-option
              v-for="opt in assignableTypes"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitTypeChange">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminMemberList, updateAdminMemberType } from '@/api/system'
import { formatDateTime } from '@/utils/dateFormat'
import { useAuthStore } from '@/store/authStore'

const authStore = useAuthStore()

const memberList = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(20)
const loading = ref(false)

// 管理员类型 → 名称/标签色（与后端 AdminRoleEnum 对齐）
const TYPE_NAMES = {
  0: '超级管理员',
  1: '普通管理员',
  2: '审核员',
  3: '客服',
  4: '紧急响应人员',
  5: '论坛管理员',
  10: '未分配身份'
}

const TYPE_TAGS = {
  0: 'danger',
  1: 'primary',
  2: 'warning',
  3: 'success',
  4: 'warning',
  5: 'danger',
  10: 'info'
}

const typeName = (type) => TYPE_NAMES[type] || '未知'
const typeTag = (type) => TYPE_TAGS[type] || 'info'

// 仅超级管理员可修改身份（后端同时校验）
const canChangeType = computed(() => authStore.isSuperAdmin)

// 超管可设置的身份集合（与后端 SUPER_ADMIN_CAN_SET 一致）
const assignableTypes = [
  { value: 1, label: '普通管理员' },
  { value: 2, label: '审核员' },
  { value: 3, label: '客服' },
  { value: 4, label: '紧急响应人员' },
  { value: 5, label: '论坛管理员' },
  { value: 10, label: '未分配身份' }
]

const fetchList = async () => {
  try {
    loading.value = true
    const data = await getAdminMemberList({ page: page.value, size: size.value }) || {}
    memberList.value = data.list || []
    total.value = Number(data.total) || 0
  } catch (error) {
    console.error('获取管理员列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSizeChange = () => {
  page.value = 1
  fetchList()
}

// 修改身份
const typeDialogVisible = ref(false)
const currentMember = ref(null)
const newType = ref(null)
const submitting = ref(false)

const openTypeDialog = (row) => {
  currentMember.value = row
  newType.value = row.type === 0 ? null : row.type
  typeDialogVisible.value = true
}

const submitTypeChange = async () => {
  if (newType.value === null) {
    ElMessage.warning('请选择新身份')
    return
  }
  if (currentMember.value.type === 0) {
    ElMessage.warning('不能修改超级管理员的身份')
    return
  }
  if (currentMember.value.id === authStore.adminInfo?.id) {
    ElMessage.warning('不能修改自己的身份')
    return
  }
  try {
    submitting.value = true
    await updateAdminMemberType({ targetAdminId: currentMember.value.id, newType: newType.value })
    ElMessage.success('身份修改成功')
    typeDialogVisible.value = false
    fetchList()
  } catch (error) {
    console.error('修改身份失败:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.role-manage {
  padding: 20px;
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
</style>
