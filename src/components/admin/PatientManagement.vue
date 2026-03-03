<!-- src/components/PatientManagement.vue -->
<template>
  <div class="patient-management">
    <!-- 编辑患者信息表单 -->
    <div v-if="isEditing && currentEditingPatient">
      <h2 class="section-title">编辑患者信息</h2>

      <el-card class="edit-card" shadow="never">
        <el-form
            :model="currentEditingPatient"
            label-width="100px"
            class="edit-form"
        >
          <el-form-item label="姓名" required>
            <el-input
                v-model="currentEditingPatient.name"
                placeholder="请输入患者姓名"
            />
          </el-form-item>

          <el-form-item label="电话" required>
            <el-input
                v-model="currentEditingPatient.phone"
                placeholder="请输入联系电话"
            />
          </el-form-item>

          <el-form-item label="性别" required>
            <el-select
                v-model="currentEditingPatient.gender"
                placeholder="请选择性别"
                style="width: 100%"
            >
              <el-option label="男" :value="1"></el-option>
              <el-option label="女" :value="0"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="身份证号" required>
            <el-input
                v-model="currentEditingPatient.card"
                placeholder="请输入身份证号"
            />
          </el-form-item>

          <el-form-item label="邮箱">
            <el-input
                v-model="currentEditingPatient.email"
                placeholder="请输入邮箱地址"
            />
          </el-form-item>

          <el-form-item label="联系地址">
            <el-input
                v-model="currentEditingPatient.address"
                type="textarea"
                :rows="3"
                placeholder="请输入联系地址"
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

    <!-- 患者列表 -->
    <div v-else>
      <h2 class="section-title">患者信息列表</h2>

      <!-- 查询条件行 -->
      <el-card class="search-card" shadow="never" style="text-align: left;">
        <div style="display: flex; flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start;">
          <el-form :model="searchForm" label-width="80px" inline
                   style="margin: 0; padding: 0;">
            <el-form-item label="姓名" style="flex-shrink: 0; margin-right: 2px;">
              <el-input
                  v-model="searchForm.name"
                  placeholder="请输入患者姓名"
                  clearable
                  style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="电话" style="flex-shrink: 0; margin-right: 2px;">
              <el-input
                  v-model="searchForm.phone"
                  placeholder="请输入电话号码"
                  clearable
                  style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="性别" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.gender"
                  placeholder="请选择性别"
                  clearable
                  style="width: 150px"
              >
                <el-option label="男" :value="1"></el-option>
                <el-option label="女" :value="0"></el-option>
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

      <!-- 患者表格容器 -->
      <div class="table-container">
        <el-table :data="patients" border stripe style="width: 100%">
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
          <el-table-column prop="email" label="邮箱" width="250">
            <template #default="{ row }">
              {{ row.email || '未填写' }}
            </template>
          </el-table-column>
          <el-table-column prop="address" label="联系地址" width="280">
            <template #default="{ row }">
              {{ row.address || '未填写' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button size="small" type="warning" @click="handleEdit(row.id)">编辑</el-button>
                <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { patientApi } from '@/api/patient.ts'

// 定义props
const props = defineProps({
  // 可以添加需要的props
})

// 定义emits
const emit = defineEmits(['update-patients'])

// 状态管理
const patients = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isEditing = ref(false)
const currentEditingPatient = ref(null)

// 搜索表单数据
const searchForm = ref({
  name: '',
  phone: '',
  gender: null,
  sortOrder: 'desc'
})

// 获取患者列表
const fetchPatients = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchForm.value.name || undefined,
      phone: searchForm.value.phone || undefined,
      gender: searchForm.value.gender !== null ? searchForm.value.gender : undefined,
      sortBy: 'create_time',
      sortDir: searchForm.value.sortOrder || 'desc'
    }

    // 移除undefined的参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await patientApi.pageQuery(params)

    // 根据API文档的返回结构处理数据
    if (response && response.data && Array.isArray(response.data.records)) {
      patients.value = response.data.records
      total.value = response.data.total || 0
      emit('update-patients', patients.value)
    } else {
      patients.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取患者列表失败:', error)
    ElMessage.error('获取患者列表失败')
  }
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
  fetchPatients()
}

// 查询方法
const handleSearch = () => {
  currentPage.value = 1
  fetchPatients()
}

// 重置方法
const handleReset = () => {
  searchForm.value = {
    name: '',
    phone: '',
    gender: null,
    sortOrder: 'desc'
  }
  currentPage.value = 1
  fetchPatients()
}

// 编辑患者
const handleEdit = async (id) => {
  try {
    const response = await patientApi.getById(id)
    if (response && response.data) {
      currentEditingPatient.value = response.data
      isEditing.value = true
    }
  } catch (error) {
    console.error('获取患者信息失败:', error)
    ElMessage.error('获取患者信息失败')
  }
}

// 保存编辑
const handleSaveEdit = async () => {
  try {
    if (!currentEditingPatient.value.name ||
        !currentEditingPatient.value.phone ||
        !currentEditingPatient.value.card) {
      ElMessage.warning('请填写所有必填项')
      return
    }

    const updateData = {
      id: currentEditingPatient.value.id,
      name: currentEditingPatient.value.name,
      phone: currentEditingPatient.value.phone,
      gender: currentEditingPatient.value.gender,
      card: currentEditingPatient.value.card,
      email: currentEditingPatient.value.email,
      address: currentEditingPatient.value.address
    }

    const response = await patientApi.update(updateData)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('患者信息更新成功')
      isEditing.value = false
      currentEditingPatient.value = null
      fetchPatients()
    } else {
      const errorMsg = response?.msg || response?.message || '更新失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('更新患者信息失败:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}

// 取消编辑
const handleCancelEdit = () => {
  isEditing.value = false
  currentEditingPatient.value = null
}

// 删除患者
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除患者【${row.name}】吗？此操作不可恢复！`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    const response = await patientApi.delete(row.id)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('删除成功')
      fetchPatients()
    } else {
      const errorMsg = response?.msg || response?.message || '删除失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('删除失败:', error)
    ElMessage.error('删除失败，请稍后重试')
  }
}

// 暴露方法给父组件
defineExpose({
  fetchPatients,
  patients,
  total,
  currentPage,
  pageSize,
  isEditing,
  currentEditingPatient
})

// 初始化
onMounted(() => {
  fetchPatients()
})
</script>

<style scoped>
.patient-management {
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

/* 填充满右侧空白的样式 */
.patient-management {
  width: 100%;
  padding: 10px 0;
}

.search-card {
  width: 100%;
  margin-bottom: 15px;
}

.el-table {
  width: 100%;
  margin: 0;
}

.pagination-container {
  width: 100%;
  margin-top: 15px;
}
/* 表格容器样式 */
.table-container {
  width: 100%;
  margin: 0 0 15px 0;
  overflow-x: auto;
}

.table-container :deep(.el-table) {
  width: 100%;
  margin: 0;
}
</style>
