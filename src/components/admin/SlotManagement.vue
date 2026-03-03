<template>
  <div class="slot-management">
    <!-- 放出号源表单 -->
    <div v-if="isAdding">
      <h2 class="section-title">放出号源</h2>

      <el-card class="add-card" shadow="never">
        <el-form
            :model="newSlot"
            :rules="addRules"
            ref="addFormRef"
            label-width="120px"
            class="add-form"
        >
          <el-form-item label="选择医生" prop="doctorId" required>
            <el-select
                v-model="newSlot.doctorId"
                placeholder="请选择医生"
                style="width: 50%"
                filterable
            >
              <el-option
                  v-for="doctor in doctors"
                  :key="doctor.id"
                  :label="`${doctor.name} (${getDeptName(doctor.deptId)})`"
                  :value="doctor.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="排班日期" prop="scheduleDate" required>
            <el-date-picker
                v-model="newSlot.scheduleDate"
                type="date"
                placeholder="请选择排班日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 50%"
                :disabled-date="disabledDate"
            />
          </el-form-item>

          <el-form-item label="时间段" prop="timePeriod" required>
            <el-select
                v-model="newSlot.timePeriod"
                placeholder="请选择时间段"
                style="width: 50%"
            >
              <el-option label="上午 (08:00-12:00)" value="上午"></el-option>
              <el-option label="下午 (14:00-18:00)" value="下午"></el-option>
              <el-option label="晚上 (19:00-21:00)" value="晚上"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="挂号费用" prop="feeAmount" required>
            <el-input-number
                v-model="newSlot.feeAmount"
                :min="0"
                :step="1"
                :precision="2"
                placeholder="请输入挂号费用"
                style="width: 50%"
            />
          </el-form-item>

          <el-form-item label="号源数量" prop="totalCount" required>
            <el-input-number
                v-model="newSlot.totalCount"
                :min="1"
                :max="100"
                placeholder="请输入号源数量"
                style="width: 50%"
            />
          </el-form-item>

          <el-form-item>
            <div class="form-actions">
              <el-button type="primary" @click="handleAddSubmit">确认放出</el-button>
              <el-button @click="handleCancelAdd">取消</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 号源列表 -->
    <div v-else>
      <h2 class="section-title">号源信息列表</h2>

      <!-- 查询条件行 -->
      <el-card class="search-card" shadow="never" style="text-align: left;">
        <div style="display: flex; flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start;">
          <el-form :model="searchForm" label-width="100px" inline
                   style="margin: 0; padding: 0;">
            <el-form-item label="医生姓名" style="flex-shrink: 0; margin-right: 2px;">
              <el-input
                  v-model="searchForm.doctorName"
                  placeholder="请输入医生姓名"
                  clearable
                  style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="医生" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.doctorId"
                  placeholder="请选择医生"
                  clearable
                  style="width: 150px"
                  filterable
              >
                <el-option
                    v-for="doctor in doctors"
                    :key="doctor.id"
                    :label="doctor.name"
                    :value="doctor.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="开始日期" style="flex-shrink: 0; margin-right: 2px;">
              <el-date-picker
                  v-model="searchForm.startDate"
                  type="date"
                  placeholder="开始日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="结束日期" style="flex-shrink: 0; margin-right: 2px;">
              <el-date-picker
                  v-model="searchForm.endDate"
                  type="date"
                  placeholder="结束日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="时间段" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.timePeriod"
                  placeholder="选择时间段"
                  clearable
                  style="width: 150px"
              >
                <el-option label="上午" value="上午"></el-option>
                <el-option label="下午" value="下午"></el-option>
                <el-option label="晚上" value="晚上"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="状态" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.status"
                  placeholder="选择状态"
                  clearable
                  style="width: 150px"
              >
                <el-option label="可预约" :value="1"></el-option>
                <el-option label="已约满" :value="2"></el-option>
                <el-option label="已过期" :value="3"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item style="flex-shrink: 0; margin-right: 0;">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <!-- 放出号源按钮行 -->
      <div class="add-slot-row">
        <el-button type="success" @click="handleAddSlot" icon="Plus">放出号源</el-button>
      </div>

      <el-table :data="slots" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="doctorName" label="医生姓名" width="120"></el-table-column>
        <el-table-column prop="doctorDept" label="所属科室" width="120">
          <template #default="{ row }">
            {{ getDeptName(row.deptId) }}
          </template>
        </el-table-column>
        <el-table-column prop="scheduleDate" label="排班日期" width="120"></el-table-column>
        <el-table-column prop="timePeriod" label="时间段" width="100">
          <template #default="{ row }">
            {{ translateTimePeriod(row.timePeriod) }}
          </template>
        </el-table-column>
        <el-table-column prop="feeAmount" label="挂号费用" width="100">
          <template #default="{ row }">
            ¥{{ row.feeAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="总号源数" width="100"></el-table-column>
        <el-table-column prop="availableCount" label="剩余号源" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                  size="small"
                  type="danger"
                  @click="handleDelete(row.id)"
                  :disabled="row.status !== 1"
              >
                删除
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
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { slotApi } from '@/api/slot.ts'
import { doctorApi } from '@/api/doctor.ts'

// 定义props
const props = defineProps({
  deptMap: {
    type: Map,
    required: true
  }
})

// 定义emits
const emit = defineEmits(['update-slots'])

// 状态管理
const slots = ref([])
const doctors = ref([]) // 所有医生列表
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isAdding = ref(false)
const newSlot = ref({
  doctorId: null,
  scheduleDate: '',
  timePeriod: '',
  feeAmount: 0,
  totalCount: 1
})

// 表单引用
const addFormRef = ref()

// 表单验证规则
const addRules = {
  doctorId: [
    { required: true, message: '请选择医生', trigger: 'change' }
  ],
  scheduleDate: [
    { required: true, message: '请选择排班日期', trigger: 'change' }
  ],
  timePeriod: [
    { required: true, message: '请选择时间段', trigger: 'change' }
  ],
  feeAmount: [
    { required: true, message: '请输入挂号费用', trigger: 'blur' }
  ],
  totalCount: [
    { required: true, message: '请输入号源数量', trigger: 'blur' }
  ]
}

// 搜索表单数据
const searchForm = ref({
  doctorName: '',
  doctorId: null,
  startDate: '',
  endDate: '',
  timePeriod: '',
  status: null
})

// 时间段翻译函数
const translateTimePeriod = (period) => {
  const periodMap = {
    'morning': '上午',
    'afternoon': '下午',
    'night': '晚上',
    '上午': '上午',
    '下午': '下午',
    '晚上': '晚上'
  }
  return periodMap[period] || period || '未知时间段'
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

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '可预约',
    2: '已约满',
    3: '已过期'
  }
  return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'success',
    2: 'warning',
    3: 'info'
  }
  return typeMap[status] || 'info'
}

// 禁用过去日期
const disabledDate = (date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
}

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchSlots()
}

// 查询方法
const handleSearch = () => {
  currentPage.value = 1
  fetchSlots()
}

// 重置方法
const handleReset = () => {
  searchForm.value = {
    doctorName: '',
    doctorId: null,
    startDate: '',
    endDate: '',
    timePeriod: '',
    status: null
  }
  currentPage.value = 1
  fetchSlots()
}

// 放出号源
const handleAddSlot = () => {
  isAdding.value = true
  newSlot.value = {
    doctorId: null,
    scheduleDate: '',
    timePeriod: '',
    feeAmount: 0,
    totalCount: 1
  }
}

// 取消添加
const handleCancelAdd = () => {
  isAdding.value = false
  newSlot.value = {
    doctorId: null,
    scheduleDate: '',
    timePeriod: '',
    feeAmount: 0,
    totalCount: 1
  }
}

// 提交添加
const handleAddSubmit = async () => {
  if (!addFormRef.value) return

  try {
    await addFormRef.value.validate()

    const response = await slotApi.release(newSlot.value)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('号源放出成功')
      isAdding.value = false
      newSlot.value = {
        doctorId: null,
        scheduleDate: '',
        timePeriod: '',
        feeAmount: 0,
        totalCount: 1
      }
      fetchSlots()
    } else {
      const errorMsg = response?.msg || response?.message || '放出失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('放出号源失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('放出失败，请稍后重试')
    }
  }
}

// 删除号源
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这个号源吗？此操作不可恢复！',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    const response = await slotApi.delete(id)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('号源删除成功')
      // 从列表中移除已删除的号源
      slots.value = slots.value.filter(slot => slot.id !== id)
    } else {
      const errorMsg = response?.msg || response?.message || '删除失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('删除号源失败:', error)
    ElMessage.error('删除失败，请稍后重试')
  }
}

// 获取医生列表（用于下拉选择）
const fetchDoctors = async () => {
  try {
    const response = await doctorApi.pageQuery({
      page: 1,
      pageSize: 1000, // 获取所有医生
      status: 1 // 只获取在职医生
    })

    if (response && response.data && Array.isArray(response.data.records)) {
      doctors.value = response.data.records
    }
  } catch (error) {
    console.error('获取医生列表失败:', error)
  }
}

// 获取号源列表
const fetchSlots = async () => {
  try {
    const params = {
      doctorId: searchForm.value.doctorId || undefined,
      doctorName: searchForm.value.doctorName || undefined,
      startDate: searchForm.value.startDate || undefined,
      endDate: searchForm.value.endDate || undefined,
      timePeriod: searchForm.value.timePeriod || undefined,
      status: searchForm.value.status !== null ? searchForm.value.status : undefined,
      page: currentPage.value,
      size: pageSize.value
    }

    // 清除undefined参数
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await slotApi.pageQuery(params)

    if (response && response.data && Array.isArray(response.data.records)) {
      // 处理号源数据
      const slotRecords = response.data.records

      // 为每个号源查询对应的医生名称
      const slotsWithDoctorNames = []
      for (const slot of slotRecords) {
        let doctorName = slot.doctorName || '未知医生'

        // 如果有医生ID且没有医生名称，则查询医生信息
        if (slot.doctorId && !slot.doctorName) {
          try {
            const doctorResponse = await doctorApi.getById(slot.doctorId)
            if (doctorResponse && doctorResponse.data && doctorResponse.data.name) {
              doctorName = doctorResponse.data.name
            }
          } catch (error) {
            console.warn(`获取医生ID ${slot.doctorId} 的名称失败:`, error)
          }
        }

        slotsWithDoctorNames.push({
          ...slot,
          doctorName: doctorName,
          doctorDept: getDeptName(slot.deptId),
          availableCount: (slot.totalCount || 0) - (slot.bookedCount || 0)
        })
      }

      slots.value = slotsWithDoctorNames
      total.value = response.data.total || 0
      emit('update-slots', slots.value)
    } else {
      slots.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取号源列表失败:', error)
    ElMessage.error('获取号源列表失败')
  }
}

// 暴露方法给父组件
defineExpose({
  fetchSlots,
  slots,
  total,
  currentPage,
  pageSize,
  isAdding
})

// 初始化
onMounted(() => {
  fetchDoctors()
  fetchSlots()
})
</script>

<style scoped>
.slot-management {
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

/* 放出号源按钮行样式 */
.add-slot-row {
  margin: 15px 0;
  text-align: left;
}

.add-slot-row .el-button {
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
  justify-content: center;
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
