<!-- src/components/DeptManagement.vue -->
<template>
  <div class="dept-management">
    <!-- 添加科室表单 -->
    <div v-if="isAdding">
      <h2 class="section-title">添加科室</h2>

      <el-card class="add-card" shadow="never">
        <el-form
            :model="newDept"
            :rules="addRules"
            ref="addFormRef"
            label-width="100px"
            class="add-form"
        >
          <el-form-item label="科室名称" prop="name" required>
            <el-input
                v-model="newDept.name"
                placeholder="请输入科室名称"
            />
          </el-form-item>

          <el-form-item label="科室类型" prop="type" required>
            <el-select
                v-model="newDept.type"
                placeholder="请选择科室类型"
                style="width: 100%"
            >
              <el-option label="临床" :value="0"></el-option>
              <el-option label="医技" :value="1"></el-option>
            </el-select>
          </el-form-item>


          <el-form-item label="科室位置">
            <el-input
                v-model="newDept.location"
                placeholder="请输入科室位置"
            />
          </el-form-item>

          <el-form-item label="科室描述">
            <el-input
                v-model="newDept.description"
                type="textarea"
                :rows="3"
                placeholder="请输入科室描述"
            />
          </el-form-item>

          <el-form-item label="科室主任">
            <el-select
                v-model="newDept.directorId"
                placeholder="请选择科室主任"
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="doctor in doctors"
                  :key="doctor.id"
                  :label="doctor.name"
                  :value="doctor.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="状态" required>
            <el-switch
                v-model="newDept.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
            />
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button type="primary" @click="handleAddSubmit">确认添加</el-button>
              <el-button @click="handleCancelAdd">取消</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 编辑科室信息表单 -->
    <div v-else-if="isEditing && currentEditingDept">
      <h2 class="section-title">编辑科室信息</h2>

      <el-card class="edit-card" shadow="never">
        <el-form
            :model="currentEditingDept"
            :rules="editRules"
            ref="editFormRef"
            label-width="100px"
            class="edit-form"
        >
          <el-form-item label="科室名称" prop="name" required>
            <el-input
                v-model="currentEditingDept.name"
                placeholder="请输入科室名称"
            />
          </el-form-item>

          <el-form-item label="科室类型" prop="type" required>
            <el-select
                v-model="currentEditingDept.type"
                placeholder="请选择科室类型"
                style="width: 100%"
            >
              <el-option label="临床" :value="0"></el-option>
              <el-option label="医技" :value="1"></el-option>
            </el-select>
          </el-form-item>


          <el-form-item label="科室位置">
            <el-input
                v-model="currentEditingDept.location"
                placeholder="请输入科室位置"
            />
          </el-form-item>

          <el-form-item label="科室描述">
            <el-input
                v-model="currentEditingDept.description"
                type="textarea"
                :rows="3"
                placeholder="请输入科室描述"
            />
          </el-form-item>

          <el-form-item label="科室主任">
            <el-select
                v-model="currentEditingDept.directorId"
                placeholder="请选择科室主任"
                clearable
                style="width: 100%"
            >
              <el-option
                  v-for="doctor in doctors"
                  :key="doctor.id"
                  :label="doctor.name"
                  :value="doctor.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="状态" required>
            <el-switch
                v-model="currentEditingDept.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
            />
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button type="primary" @click="handleSaveEdit">确认保存</el-button>
              <el-button @click="handleCancelEdit">取消</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 科室列表 -->
    <div v-else>
      <h2 class="section-title">科室信息列表</h2>

      <!-- 查询条件行 -->
      <el-card class="search-card" shadow="never" style="text-align: left;">
        <div style="display: flex; flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start;">
          <el-form :model="searchForm" label-width="80px" inline
                   style="margin: 0; padding: 0;">
            <el-form-item label="科室名称" style="flex-shrink: 0; margin-right: 2px;">
              <el-input
                  v-model="searchForm.name"
                  placeholder="请输入科室名称"
                  clearable
                  style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="科室类型" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.type"
                  placeholder="请选择科室类型"
                  clearable
                  style="width: 150px"
              >
                <el-option label="临床" :value="0"></el-option>
                <el-option label="医技" :value="1"></el-option>
              </el-select>
            </el-form-item>


            <el-form-item label="状态" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.status"
                  placeholder="请选择状态"
                  clearable
                  style="width: 150px"
              >
                <el-option label="启用" :value="1"></el-option>
                <el-option label="禁用" :value="0"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="排序方式" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.sortOrder"
                  placeholder="选择排序方式"
                  style="width: 150px"
              >
                <el-option label="按创建时间升序" value="asc"></el-option>
                <el-option label="按创建时间降序" value="desc"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item style="flex-shrink: 0; margin-right: 0;">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <!-- 添加科室按钮行 -->
      <div class="add-dept-row">
        <el-button type="success" @click="handleAdd" icon="Plus">添加科室</el-button>
      </div>

      <!-- 科室表格容器 -->
      <div class="table-container">
        <el-table :data="depts" border stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="name" label="科室名称" width="150"></el-table-column>
          <el-table-column prop="type" label="科室类型" width="120">
            <template #default="{ row }">
              {{ getTypeName(row.type) }}
            </template>
          </el-table-column>
          <el-table-column prop="location" label="科室位置" width="150">
            <template #default="{ row }">
              {{ row.location || '未设置' }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="科室描述" width="200">
            <template #default="{ row }">
              {{ row.description || '未填写' }}
            </template>
          </el-table-column>
          <el-table-column prop="directorId" label="科室主任" width="120">
            <template #default="{ row }">
              {{ getDirectorName(row.directorId) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button size="small" type="primary" @click="handleViewDoctors(row)">查看医生</el-button>
                <el-button size="small" type="warning" @click="handleEdit(row.id)">编辑</el-button>
                <el-button
                    size="small"
                    :type="row.status === 1 ? 'info' : 'success'"
                    @click="handleToggleStatus(row)"
                >
                  {{ row.status === 1 ? '禁用' : '启用' }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            background
            layout="total, prev, pager, next, jumper"
            :total="total"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handlePageChange"
            :pager-count="5"
            :page-sizes="[10, 20, 50, 100]"
            :small="false"
            :disabled="false"
            :hide-on-single-page="false"
            :popper-class="'custom-pagination'"
        />
      </div>
    </div>

    <!-- 查看医生对话框 -->
    <el-dialog
        v-model="doctorDialogVisible"
        :title="`[${currentDept?.name}] 科室医生列表`"
        width="80%"
        destroy-on-close
    >
      <el-table :data="deptDoctors" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="post" label="职位" width="150">
          <template #default="{ row }">
            {{ getPostName(row.post) }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" width="150"></el-table-column>
        <el-table-column prop="card" label="身份证号" width="200">
          <template #default="{ row }">
            {{ formatIdCard(row.card) }}
          </template>
        </el-table-column>
        <el-table-column prop="introduction" label="简介" width="200">
          <template #default="{ row }">
            {{ row.introduction || '未填写' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="doctorDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deptApi } from '@/api/dept.ts'
import { doctorApi } from '@/api/doctor.ts'

// 定义props
const props = defineProps({
  // 可以添加需要的props
})

// 定义emits
const emit = defineEmits(['update-depts'])

// 状态管理
const depts = ref([])
const doctors = ref([]) // 用于科室主任选择
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isEditing = ref(false)
const isAdding = ref(false)
const currentEditingDept = ref(null)
const newDept = ref({
  name: '',
  type: 1,
  location: '',
  description: '',
  directorId: null,
  status: 1
})

// 对话框状态
const doctorDialogVisible = ref(false)
const currentDept = ref(null)
const deptDoctors = ref([])

// 搜索表单数据
const searchForm = ref({
  name: '',
  type: null,
  status: null,
  sortOrder: 'desc'
})

// 表单验证规则
const addRules = {
  name: [
    { required: true, message: '请输入科室名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择科室类型', trigger: 'change' }
  ]
}

const editRules = {
  name: [
    { required: true, message: '请输入科室名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择科室类型', trigger: 'change' }
  ]
}

// 表单引用
const addFormRef = ref()
const editFormRef = ref()

// 获取科室列表
const fetchDepts = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchForm.value.name || undefined,
      type: searchForm.value.type !== null ? searchForm.value.type : undefined,
      status: searchForm.value.status !== null ? searchForm.value.status : undefined,
      sortBy: 'create_time',
      sortDir: searchForm.value.sortOrder || 'desc'
    }

    // 移除undefined的参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await deptApi.pageQuery(params)

    // 根据API文档的返回结构处理数据
    if (response && response.data && Array.isArray(response.data.records)) {
      depts.value = response.data.records
      total.value = response.data.total || 0
      emit('update-depts', depts.value)
    } else {
      depts.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取科室列表失败:', error)
    ElMessage.error('获取科室列表失败')
  }
}

// 获取所有医生（用于科室主任选择）
const fetchDoctors = async () => {
  try {
    const response = await doctorApi.pageQuery({
      page: 1,
      pageSize: 1000,
      status: 1 // 只获取在职医生
    })

    if (response && response.data && Array.isArray(response.data.records)) {
      doctors.value = response.data.records
    }
  } catch (error) {
    console.error('获取医生列表失败:', error)
  }
}

// 时间格式化
const formatDate = (date) => {
  if (!date) return '未设置'
  return new Date(date).toLocaleString('zh-CN')
}

// 科室类型映射 - 修改为新的类型定义
const getTypeName = (type) => {
  const typeMap = {
    0: '临床',
    1: '医技'
  }
  return typeMap[type] || '未知类型'
}


// 获取科室主任姓名
const getDirectorName = (directorId) => {
  if (!directorId) return '未设置'
  const doctor = doctors.value.find(d => d.id === directorId)
  return doctor ? doctor.name : '未知'
}

// 职位映射
const getPostName = (post) => {
  const postMap = {
    0: '普通医生',
    1: '科室主任'
  }
  return postMap[post] || '未知'
}

// 身份证号格式化 - 只显示前四位和后四位
const formatIdCard = (card) => {
  if (!card) {
    return '未填写'
  }
  if (typeof card === 'string' && card.length === 18) {
    return card.substring(0, 4) + '**********' + card.substring(14)
  }
  return card
}

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchDepts()
}

// 查询方法
const handleSearch = () => {
  currentPage.value = 1
  fetchDepts()
}

// 重置方法
const handleReset = () => {
  searchForm.value = {
    name: '',
    type: null,
    status: null,
    sortOrder: 'desc'
  }
  currentPage.value = 1
  fetchDepts()
}

// 添加科室
const handleAdd = () => {
  isAdding.value = true
  newDept.value = {
    name: '',
    type: 1,
    location: '',
    description: '',
    directorId: null,
    status: 1
  }
}

// 取消添加
const handleCancelAdd = () => {
  isAdding.value = false
  newDept.value = {
    name: '',
    type: 1,
    location: '',
    description: '',
    directorId: null,
    status: 1
  }
}

// 提交添加
const handleAddSubmit = async () => {
  if (!addFormRef.value) return

  try {
    await addFormRef.value.validate()

    const response = await deptApi.create(newDept.value)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('科室添加成功')
      isAdding.value = false
      newDept.value = {
        name: '',
        type: 1,
        location: '',
        description: '',
        directorId: null,
        status: 1
      }
      fetchDepts()
    } else {
      const errorMsg = response?.msg || response?.message || '添加失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('添加科室失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('添加失败，请稍后重试')
    }
  }
}

// 编辑科室
const handleEdit = async (id) => {
  try {
    console.log('开始获取科室信息，ID:', id)
    const response = await deptApi.getById(id)
    console.log('获取科室信息响应:', response)

    // 修正数据访问逻辑 - 直接使用 response.data
    if (response && response.data) {
      currentEditingDept.value = response.data
      isEditing.value = true
      console.log('成功设置编辑数据:', currentEditingDept.value)
    } else {
      console.warn('响应数据为空或格式不正确:', response)
      ElMessage.warning('获取到的科室信息为空')
    }
  } catch (error) {
    console.error('获取科室信息失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    })

    // 根据不同的错误类型显示不同的消息
    if (error.response) {
      if (error.response.status === 404) {
        ElMessage.error(`未找到ID为${id}的科室信息`)
      } else if (error.response.status === 500) {
        ElMessage.error('服务器内部错误，请稍后重试')
      } else {
        ElMessage.error(`请求失败: ${error.response.status} ${error.response.statusText}`)
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      ElMessage.error('请求配置错误')
    }
  }
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()

    const updateData = {
      id: currentEditingDept.value.id,
      name: currentEditingDept.value.name,
      type: currentEditingDept.value.type,
      location: currentEditingDept.value.location,
      description: currentEditingDept.value.description,
      directorId: currentEditingDept.value.directorId,
      status: currentEditingDept.value.status
    }

    const response = await deptApi.update(updateData)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('科室信息更新成功')
      isEditing.value = false
      currentEditingDept.value = null
      fetchDepts()
    } else {
      const errorMsg = response?.msg || response?.message || '更新失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('更新科室信息失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

// 取消编辑
const handleCancelEdit = () => {
  isEditing.value = false
  currentEditingDept.value = null
}

// 切换科室状态
const handleToggleStatus = async (row) => {
  try {
    const action = row.status === 1 ? '禁用' : '启用'
    await ElMessageBox.confirm(
        `确定要${action}科室【${row.name}】吗？`,
        `确认${action}`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    const response = await deptApi.updateStatus({
      id: row.id,
      status: row.status === 1 ? 0 : 1
    })

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success(`${action}成功`)
      fetchDepts()
    } else {
      const errorMsg = response?.msg || response?.message || `${action}失败`
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error(`${action}失败:`, error)
    ElMessage.error(`${action}失败，请稍后重试`)
  }
}

// 查看科室医生
const handleViewDoctors = async (dept) => {
  try {
    currentDept.value = dept
    const response = await doctorApi.getDoctorsByDeptId(dept.id)

    if (response && response.data) {
      deptDoctors.value = Array.isArray(response.data) ? response.data : []
    } else {
      deptDoctors.value = []
    }

    doctorDialogVisible.value = true
  } catch (error) {
    console.error('获取科室医生失败:', error)
    ElMessage.error('获取科室医生失败')
    deptDoctors.value = []
    doctorDialogVisible.value = true
  }
}

// 暴露方法给父组件
defineExpose({
  fetchDepts,
  depts,
  total,
  currentPage,
  pageSize,
  isEditing,
  isAdding,
  currentEditingDept,
  newDept
})

// 初始化
onMounted(() => {
  fetchDepts()
  fetchDoctors()
})
</script>

<style scoped>
/* 主容器使用flex布局 */
.dept-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 10px 0;
}

/* 覆盖全局表格样式，确保表格宽度正确 */
.dept-management :deep(.el-table) {
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* 标题样式 */
.section-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

/* 卡片样式 */
.search-card, .add-card, .edit-card {
  margin-bottom: 15px;
  width: 100%;
}

.search-card :deep(.el-card__body) {
  padding: 20px;
}

.add-card :deep(.el-card__body),
.edit-card :deep(.el-card__body) {
  padding: 0;
}

/* 表单样式 */
.add-form, .edit-form {
  padding: 20px;
}

.add-form .el-form-item,
.edit-form .el-form-item {
  margin-bottom: 22px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

/* 关键：表格容器使用flex自适应 */
.table-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  margin: 0 0 15px 0;
  overflow: hidden;
}

.table-container :deep(.el-table) {
  height: 100%;
  width: 100%;
}

/* 添加科室按钮行样式 */
.add-dept-row {
  margin: 15px 0;
  text-align: left;
}

.add-dept-row .el-button {
  margin-left: 0;
}

/* 操作按钮样式 - 确保在同一行显示 */
.operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.operation-buttons .el-button {
  margin: 0;
  padding: 5px 10px;
  font-size: 12px;
}

/* 分页容器固定在底部 */
.pagination-container {
  flex-shrink: 0;
  margin-top: 15px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.pagination-container :deep(.el-pagination__total),
.pagination-container :deep(.el-pagination__jump) {
  font-size: 14px;
  color: #606266;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
