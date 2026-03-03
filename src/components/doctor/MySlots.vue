<template>
  <div class="my-slots">
    <!-- 放出我的号源表单 -->
    <div v-if="isAdding">
      <h2 class="section-title">放出我的号源</h2>

      <el-card class="add-card" shadow="never">
        <el-form
            :model="newSlot"
            :rules="addRules"
            ref="addFormRef"
            label-width="120px"
            class="add-form"
        >
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

    <!-- 我的号源列表 -->
    <div v-else>
      <h2 class="section-title">我的号源列表</h2>

      <!-- 查询条件行 -->
      <el-card class="search-card" shadow="never" style="text-align: left;">
        <div style="display: flex; flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start;">
          <el-form :model="searchForm" label-width="100px" inline
                   style="margin: 0; padding: 0;">
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
                <el-option label="已停诊" :value="0"></el-option>
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
        <el-button type="success" @click="handleAddSlot" icon="Plus">放出我的号源</el-button>
      </div>

      <el-table :data="mySlots" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
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
        <el-table-column prop="bookedCount" label="已预约数" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                  size="small"
                  type="primary"
                  @click="handleViewDetails(row.id)"
              >
                查看详情
              </el-button>
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

    <!-- 号源详情对话框 -->
    <el-dialog
        v-model="showDetailDialog"
        title="号源详情"
        width="600px"
        :before-close="handleCloseDetail"
    >
      <div v-if="currentSlotDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="号源ID">{{ currentSlotDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="排班日期">{{ currentSlotDetail.scheduleDate }}</el-descriptions-item>
          <el-descriptions-item label="时间段">{{ translateTimePeriod(currentSlotDetail.timePeriod) }}</el-descriptions-item>
          <el-descriptions-item label="挂号费用">¥{{ currentSlotDetail.feeAmount }}</el-descriptions-item>
          <el-descriptions-item label="总号源数">{{ currentSlotDetail.totalCount }}</el-descriptions-item>
          <el-descriptions-item label="已预约数">{{ currentSlotDetail.bookedCount }}</el-descriptions-item>
          <el-descriptions-item label="剩余号源">{{ currentSlotDetail.availableCount }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentSlotDetail.status)">
              {{ getStatusText(currentSlotDetail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentSlotDetail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentSlotDetail.updateTime }}</el-descriptions-item>
        </el-descriptions>

        <!-- 预约患者列表 -->
        <div v-if="currentSlotDetail.orders && currentSlotDetail.orders.length > 0" style="margin-top: 20px;">
          <h4>预约患者列表</h4>
          <el-table :data="currentSlotDetail.orders" border stripe style="width: 100%">
            <el-table-column prop="patientName" label="患者姓名" width="120"></el-table-column>
            <el-table-column prop="patientPhone" label="联系电话" width="150"></el-table-column>
            <el-table-column prop="orderTime" label="预约时间" width="180"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusType(row.status)">
                  {{ getOrderStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { slotApi } from '@/api/slot.js'

// 定义emits
const emit = defineEmits(['update-my-slots'])

// 状态管理
const mySlots = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const isAdding = ref(false)
const showDetailDialog = ref(false)
const currentSlotDetail = ref(null)

const newSlot = ref({
  scheduleDate: '',
  timePeriod: '',
  feeAmount: 0,
  totalCount: 1
})

// 表单引用
const addFormRef = ref()

// 表单验证规则
const addRules = {
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

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '已停诊',
    1: '可预约',
    2: '已约满',
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

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    1: '待支付',
    2: '已支付',
    3: '已完成',
    4: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取订单状态标签类型
const getOrderStatusType = (status) => {
  const typeMap = {
    1: 'warning',
    2: 'success',
    3: 'info',
    4: 'danger'
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
  fetchMySlots()
}

// 查询方法
const handleSearch = () => {
  currentPage.value = 1
  fetchMySlots()
}

// 重置方法
const handleReset = () => {
  searchForm.value = {
    startDate: '',
    endDate: '',
    timePeriod: '',
    status: null
  }
  currentPage.value = 1
  fetchMySlots()
}

// 放出号源
const handleAddSlot = () => {
  isAdding.value = true
  newSlot.value = {
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

    // 获取当前登录医生的信息
    const userInfo = localStorage.getItem('userInfo')
    if (!userInfo) {
      ElMessage.error('请先登录')
      return
    }

    const doctorInfo = JSON.parse(userInfo)
    const slotData = {
      ...newSlot.value,
      doctorId: doctorInfo.id // 使用当前登录医生的ID
    }

    const response = await slotApi.release(slotData)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('号源放出成功')
      isAdding.value = false
      newSlot.value = {
        scheduleDate: '',
        timePeriod: '',
        feeAmount: 0,
        totalCount: 1
      }
      fetchMySlots()
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

// 查看详情
const handleViewDetails = async (id) => {
  try {
    const response = await slotApi.getById(id)
    if (response && response.data) {
      currentSlotDetail.value = {
        ...response.data,
        availableCount: (response.data.totalCount || 0) - (response.data.bookedCount || 0)
      }
      showDetailDialog.value = true
    }
  } catch (error) {
    console.error('获取号源详情失败:', error)
    ElMessage.error('获取号源详情失败')
  }
}

// 关闭详情对话框
const handleCloseDetail = () => {
  showDetailDialog.value = false
  currentSlotDetail.value = null
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
      mySlots.value = mySlots.value.filter(slot => slot.id !== id)
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

// 获取我的号源列表
const fetchMySlots = async () => {
  try {
    // 获取当前登录医生的信息
    const userInfo = localStorage.getItem('userInfo')
    if (!userInfo) {
      ElMessage.error('请先登录')
      return
    }

    const doctorInfo = JSON.parse(userInfo)

    const params = {
      doctorId: doctorInfo.id, // 只查询当前医生的号源
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
      const slotRecords = response.data.records

      // 计算剩余号源数
      const slotsWithAvailableCount = slotRecords.map(slot => ({
        ...slot,
        availableCount: (slot.totalCount || 0) - (slot.bookedCount || 0)
      }))

      mySlots.value = slotsWithAvailableCount
      total.value = response.data.total || 0
      emit('update-my-slots', mySlots.value)
    } else {
      mySlots.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取我的号源列表失败:', error)
    ElMessage.error('获取我的号源列表失败')
  }
}

// 暴露方法给父组件
defineExpose({
  fetchMySlots,
  mySlots,
  total,
  currentPage,
  pageSize,
  isAdding
})

// 初始化
onMounted(() => {
  fetchMySlots()
})
</script>

<style scoped>
.my-slots {
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
