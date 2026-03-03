NEW_FILE_CODE
<template>
  <div class="doctor-management">
    <!-- 编辑医生信息表单 -->
    <div v-if="isEditing && currentEditingDoctor">
      <h2 class="section-title">编辑医生信息</h2>

      <el-card class="edit-card" shadow="never">
        <el-form
            :model="currentEditingDoctor"
            label-width="100px"
            class="edit-form"
        >
          <el-form-item label="姓名" required>
            <el-input
                v-model="currentEditingDoctor.name"
                placeholder="请输入医生姓名"
            />
          </el-form-item>

          <el-form-item label="电话" required>
            <el-input
                v-model="currentEditingDoctor.phone"
                placeholder="请输入联系电话"
            />
          </el-form-item>

          <el-form-item label="性别" required>
            <el-select
                v-model="currentEditingDoctor.gender"
                placeholder="请选择性别"
                style="width: 100%"
            >
              <el-option label="男" :value="1"></el-option>
              <el-option label="女" :value="0"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="职位" required>
            <el-select
                v-model="currentEditingDoctor.post"
                placeholder="请选择职位"
                style="width: 100%"
            >
              <el-option label="普通医生" :value="0"></el-option>
              <el-option label="科室主任" :value="1"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="隶属科室" required>
            <el-select
                v-model="currentEditingDoctor.deptId"
                placeholder="请选择科室"
                style="width: 100%"
            >
              <el-option
                  v-for="[id, name] in deptMap"
                  :key="id"
                  :label="name"
                  :value="id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="状态" required>
            <el-select
                v-model="currentEditingDoctor.status"
                placeholder="请选择状态"
                style="width: 100%"
            >
              <el-option label="在职" :value="1"></el-option>
              <el-option label="离职" :value="2"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="身份证号" required>
            <el-input
                v-model="currentEditingDoctor.card"
                placeholder="请输入身份证号"
            />
          </el-form-item>

          <el-form-item label="自我介绍">
            <el-input
                v-model="currentEditingDoctor.introduction"
                type="textarea"
                :rows="4"
                placeholder="请输入医生简介"
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

    <!-- 添加医生表单 -->
    <div v-if="isAdding">
      <h2 class="section-title">添加医生</h2>

      <el-card class="add-card" shadow="never">
        <el-form
            :model="newDoctor"
            :rules="addRules"
            ref="addFormRef"
            label-width="100px"
            class="add-form"
        >
          <el-form-item label="姓名" prop="name" required>
            <el-input
                v-model="newDoctor.name"
                placeholder="请输入医生姓名"
            />
          </el-form-item>

          <el-form-item label="电话" prop="phone" required>
            <el-input
                v-model="newDoctor.phone"
                placeholder="请输入联系电话"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password" required>
            <el-input
                v-model="newDoctor.password"
                type="password"
                placeholder="请输入登录密码"
                show-password
            />
          </el-form-item>

          <el-form-item label="性别" prop="gender" required>
            <el-select
                v-model="newDoctor.gender"
                placeholder="请选择性别"                  style="width: 100%"
            >
              <el-option label="男" :value="1"></el-option>
              <el-option label="女" :value="0"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="职位" prop="post" required>
            <el-select
                v-model="newDoctor.post"
                placeholder="请选择职位"                  style="width: 100%"
            >
              <el-option label="普通医生" :value="0"></el-option>
              <el-option label="科室主任" :value="1"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="隶属科室" prop="deptId" required>
            <el-select
                v-model="newDoctor.deptId"
                placeholder="请选择科室"                  style="width: 100%"
            >
              <el-option
                  v-for="[id, name] in deptMap"
                  :key="id"
                  :label="name"
                  :value="id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="身份证号" prop="card" required>
            <el-input
                v-model="newDoctor.card"
                placeholder="请输入身份证号"
            />
          </el-form-item>

          <el-form-item label="自我介绍">
            <el-input
                v-model="newDoctor.introduction"
                type="textarea"
                :rows="4"
                placeholder="请输入医生简介"
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

    <!-- 医生列表 -->
    <div v-else>
      <h2 class="section-title">医生信息列表</h2>

      <!-- 查询条件行 -->
      <el-card class="search-card" shadow="never" style="text-align: left;">
        <div style="display: flex; flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start;">
          <el-form :model="searchForm" label-width="80px" inline
                   style="margin: 0; padding: 0;">
            <el-form-item label="姓名" style="flex-shrink: 0; margin-right: 2px;">
              <el-input
                  v-model="searchForm.name"
                  placeholder="请输入医生姓名"
                  clearable
                  style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="职位" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.post"
                  placeholder="请选择职位"
                  clearable
                  style="width: 150px"
              >
                <el-option label="普通医生" :value="0"></el-option>
                <el-option label="科室主任" :value="1"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="状态" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.status"
                  placeholder="请选择状态"
                  clearable
                  style="width: 150px"
              >
                <el-option label="在职" :value="1"></el-option>
                <el-option label="离职" :value="0"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="隶属科室" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.deptId"
                  placeholder="请选择科室"
                  clearable
                  style="width: 150px"
              >
                <el-option
                    v-for="[id, name] in deptMap"
                    :key="id"
                    :label="name"
                    :value="id"
                />
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

      <!-- 添加医生按钮行 -->
      <div class="add-doctor-row">
        <el-button type="success" @click="handleAddDoctor" icon="Plus">添加医生</el-button>
      </div>

      <el-table :data="doctors" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <!-- 身份证号列（前4位+********+后4位） -->
        <el-table-column prop="card" label="身份证号" width="180">
          <template #default="{ row }">
            {{ formatIdCard(row.card) }}
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="电话" width="150"></el-table-column>
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            {{ row.gender === 1 ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="post" label="职称" width="120">
          <template #default="{ row }">
            {{ getPostText(row.post) }}
          </template>
        </el-table-column>
        <el-table-column prop="deptId" label="科室" width="100">
          <template #default="{ row }">
            {{ getDeptName(row.deptId) }}
          </template>
        </el-table-column>
        <el-table-column prop="introduction" label="自我介绍" width="200">
          <template #default="{ row }">
            {{ row.introduction || '暂无介绍' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button size="small" type="warning" @click="handleEdit(row.id)">编辑</el-button>
              <el-button
                  size="small"
                  :type="row.status === 1 ? 'danger' : 'success'"
                  @click="handleChangeStatus(row)"
              >
                {{ row.status === 1 ? '设为离职' : '设为在职' }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { doctorApi } from '@/api/doctor.ts'

// 定义props
const props = defineProps({
  deptMap: {
    type: Map,
    required: true
  }
})

// 定义emits
const emit = defineEmits(['update-doctors'])

// 状态管理
const doctors = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isEditing = ref(false)
const isAdding = ref(false) // 添加新增状态
const currentEditingDoctor = ref(null)
const newDoctor = ref({  // 添加新医生数据
  name: '',
  phone: '',
  password: '',  // 添加密码字段
  gender: 1,
  post: 0,
  deptId: null,
  card: '',
  introduction: ''
})

// 表单引用
const addFormRef = ref()  // 添加表单引用
const editFormRef = ref()

// 表单验证规则
const addRules = {  // 添加表单验证规则
  name: [
    { required: true, message: '请输入医生姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  password: [  // 添加密码验证规则
    { required: true, message: '请输入登录密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  post: [
    { required: true, message: '请选择职位', trigger: 'change' }
  ],
  deptId: [
    { required: true, message: '请选择科室', trigger: 'change' }
  ],
  card: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ]
}

// 搜索表单数据
const searchForm = ref({
  name: '',
  post: null,
  status: null,
  deptId: null,
  sortOrder: 'desc'
})

// 获取医生列表
const fetchDoctors = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchForm.value.name || undefined,
      post: searchForm.value.post !== null ? searchForm.value.post : undefined,
      status: searchForm.value.status !== null ? searchForm.value.status : undefined,
      deptId: searchForm.value.deptId !== null ? searchForm.value.deptId : undefined,
      sortBy: 'create_time',
      sortDir: searchForm.value.sortOrder || 'desc'
    }

    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await doctorApi.pageQuery(params)

    if (response && response.data && Array.isArray(response.data.records)) {
      doctors.value = response.data.records
      total.value = response.data.total || 0
      emit('update-doctors', doctors.value)
    } else {
      doctors.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取医生列表失败:', error)
  }
}

// 获取科室名称
const getDeptName = (deptId) => {
  if (deptId === null || deptId === undefined || deptId === '' || deptId === 0) {
    return '未分配'
  }

  const numericDeptId = Number(deptId)
  const deptName = props.deptMap.get(numericDeptId)
  return deptName || '未知科室'
}

// 获取职称文本
const getPostText = (post) => {
  const postMap = {
    0: '普通医生',
    1: '科室主任'
  }
  return postMap[post] || '未知'
}

// 身份证号格式化
const formatIdCard = (card) => {
  if (!card) {
    return '未填写'
  }
  if (typeof card === 'string' && card.length === 18) {
    return card.substring(0, 4) + '********' + card.substring(14)
  }
  return card
}

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchDoctors()
}

// 查询方法
const handleSearch = () => {
  currentPage.value = 1
  fetchDoctors()
}

// 重置方法
const handleReset = () => {
  searchForm.value = {
    name: '',
    post: null,
    status: null,
    deptId: null,
    sortOrder: 'desc'
  }
  currentPage.value = 1
  fetchDoctors()
}

// 添加医生
const handleAddDoctor = () => {
  isAdding.value = true
  newDoctor.value = {
    name: '',
    phone: '',
    password: '',  // 初始化密码字段
    gender: 1,
    post: 0,
    deptId: null,
    card: '',
    introduction: ''
  }
}

// 取消添加
const handleCancelAdd = () => {
  isAdding.value = false
  newDoctor.value = {
    name: '',
    phone: '',
    password: '',  // 初始化密码字段
    gender: 1,
    post: 0,
    deptId: null,
    card: '',
    introduction: ''
  }
}

// 提交添加
const handleAddSubmit = async () => {
  if (!addFormRef.value) return

  try {
    await addFormRef.value.validate()

    const response = await doctorApi.register(newDoctor.value)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('医生添加成功')
      isAdding.value = false
      newDoctor.value = {
        name: '',
        phone: '',
        password: '',  // 初始化密码字段
        gender: 1,
        post: 0,
        deptId: null,
        card: '',
        introduction: ''
      }
      fetchDoctors()
    } else {
      const errorMsg = response?.msg || response?.message || '添加失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('添加医生失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('添加失败，请稍后重试')
    }
  }
}

// 编辑医生
const handleEdit = async (id) => {
  try {
    const response = await doctorApi.getById(id)
    if (response && response.data) {
      currentEditingDoctor.value = response.data
      isEditing.value = true
    }
  } catch (error) {
    console.error('获取医生信息失败:', error)
    ElMessage.error('获取医生信息失败')
  }
}

// 保存编辑
const handleSaveEdit = async () => {
  try {
    if (!currentEditingDoctor.value.name ||
        !currentEditingDoctor.value.phone ||
        !currentEditingDoctor.value.card) {
      ElMessage.warning('请填写所有必填项')
      return
    }

    const updateData = {
      id: currentEditingDoctor.value.id,
      name: currentEditingDoctor.value.name,
      phone: currentEditingDoctor.value.phone,
      gender: currentEditingDoctor.value.gender,
      card: currentEditingDoctor.value.card,
      post: currentEditingDoctor.value.post,
      deptId: currentEditingDoctor.value.deptId,
      status: currentEditingDoctor.value.status,
      introduction: currentEditingDoctor.value.introduction
    }

    const response = await doctorApi.update(updateData)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('医生信息更新成功')
      isEditing.value = false
      currentEditingDoctor.value = null
      fetchDoctors()
    } else {
      const errorMsg = response?.msg || response?.message || '更新失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('更新医生信息失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

// 取消编辑
const handleCancelEdit = () => {
  isEditing.value = false
  currentEditingDoctor.value = null
}

// 更改医生状态
const handleChangeStatus = async (row) => {
  try {
    const actionText = row.status === 1 ? '离职' : '在职'
    await ElMessageBox.confirm(
        `确定要将医生【${row.name}】设为${actionText}状态吗？`,
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    const newStatus = row.status === 1 ? 2 : 1
    const updateData = {
      id: row.id,
      status: newStatus
    }

    const response = await doctorApi.updateStatus(updateData)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      row.status = newStatus
      ElMessage.success(`${actionText}状态设置成功`)
      fetchDoctors()
    } else {
      const errorMsg = response?.msg || response?.message || '状态更新失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('更改状态失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 暴露方法给父组件
defineExpose({
  fetchDoctors,
  doctors,
  total,
  currentPage,
  pageSize,
  isEditing,
  currentEditingDoctor
})

// 初始化
onMounted(() => {
  fetchDoctors()
})
</script>

<style scoped>
.doctor-management {
  padding: 10px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.search-card {
  margin-bottom: 15px;
  background-color: #ffffff;
}

.search-card :deep(.el-card__body) {
  padding: 20px;
}

.edit-card {
  margin-bottom: 20px;
}

.edit-form {
  padding: 20px;
}

.edit-card :deep(.el-card__body) {
  padding: 0;
}

.edit-form .el-form-item {
  margin-bottom: 22px;
}

/* 添加卡片样式 */
.add-card {
  margin-bottom: 20px;
}

.add-card :deep(.el-card__body) {
  padding: 0;
}

/* 添加表单样式 */
.add-form {
  padding: 20px;
}

.add-form .el-form-item {
  margin-bottom: 22px;
}

/* 添加医生按钮行样式 */
.add-doctor-row {
  margin: 15px 0;
  text-align: left;
}

.add-doctor-row .el-button {
  margin-left: 0;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.operation-buttons .el-button {
  margin: 0;
  white-space: nowrap;
}

.el-table {
  flex: 1;
  min-height: 0;
}

.pagination-container {
  flex-shrink: 0;
  margin-top: 15px;
  display: flex;
  justify-content: center; /* 居中显示 */
}

.pagination-container :deep(.el-pagination__total) {
  font-size: 14px;
  color: #606266;
}

.pagination-container :deep(.el-pagination__jump) {
  font-size: 14px;
  color: #606266;
}
</style>
