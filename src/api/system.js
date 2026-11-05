import service from './index'

// ==================== 系统日志（后端 SystemLogController） ====================

/**
 * 查询系统日志列表
 * @param {Object} params - SystemLogQueryDTO：{module, action, adminId, userId, status, startTime, endTime, page, size}
 */
export const getLogList = (params) => {
  return service({
    url: '/system/log/list',
    method: 'get',
    params
  })
}

/**
 * 查询日志详情
 */
export const getLogDetail = (id) => {
  return service({
    url: `/system/log/detail/${id}`,
    method: 'get'
  })
}

/**
 * 获取所有模块名称（筛选下拉）
 */
export const getLogModules = () => {
  return service({
    url: '/system/log/modules',
    method: 'get'
  })
}

// ==================== 管理员（角色）管理（后端 AdminController /member） ====================

/**
 * 获取管理员列表（仅超管/普管）
 * @returns {list, total, page, size}
 */
export const getAdminMemberList = (params) => {
  return service({
    url: '/member/list',
    method: 'get',
    params
  })
}

/**
 * 修改管理员身份（超管可设 1/2/3/4/5/10；普管可设 2/3/4/10）
 * @param {Object} data - {targetAdminId, newType}
 */
export const updateAdminMemberType = (data) => {
  return service({
    url: '/member/type',
    method: 'put',
    data
  })
}

/**
 * 获取管理员详情
 */
export const getAdminMemberDetail = (adminId) => {
  return service({
    url: `/member/${adminId}`,
    method: 'get'
  })
}
