<template>
  <div class="order-management">
    <!-- 订单列表 -->
    <div>
      <h2 class="section-title">订单信息列表</h2>

      <!-- 查询条件行 -->
      <el-card class="search-card" shadow="never" style="text-align: left;">
        <div style="display: flex; flex-wrap: nowrap; overflow-x: auto; justify-content: flex-start;">
          <el-form :model="searchForm" label-width="100px" inline
                   style="margin: 0; padding: 0;">
            <el-form-item label="订单编号" style="flex-shrink: 0; margin-right: 2px;">
              <el-input
                  v-model="searchForm.orderNo"
                  placeholder="请输入订单编号"
                  clearable
                  style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="号源ID" style="flex-shrink: 0; margin-right: 2px;">
              <el-input
                  v-model="searchForm.slotId"
                  placeholder="请输入号源ID"
                  clearable
                  style="width: 150px"
              />
            </el-form-item>

            <el-form-item label="订单状态" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.orderStatus"
                  placeholder="选择订单状态"
                  clearable
                  style="width: 150px"
              >
                <el-option label="待支付" :value="1"></el-option>
                <el-option label="待就诊" :value="2"></el-option>
                <el-option label="已取消" :value="3"></el-option>
                <el-option label="已完成" :value="4"></el-option>
                <el-option label="已取号" :value="5"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="是否急诊" style="flex-shrink: 0; margin-right: 2px;">
              <el-select
                  v-model="searchForm.isEmergency"
                  placeholder="选择急诊状态"
                  clearable
                  style="width: 150px"
              >
                <el-option label="普通" :value="0"></el-option>
                <el-option label="急诊" :value="1"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item style="flex-shrink: 0; margin-right: 0;">
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>

      <el-table :data="orders" border stripe style="width: 100%">
        <el-table-column prop="id" label="订单ID" width="70"></el-table-column>
        <el-table-column prop="orderNo" label="订单编号" width="150"></el-table-column>
        <el-table-column prop="patientName" label="患者姓名" width="100"></el-table-column>
        <el-table-column prop="doctorName" label="医生姓名" width="100"></el-table-column>
        <el-table-column prop="doctorDept" label="所属科室" width="100">
          <template #default="{ row }">
            {{ getDeptName(row.deptName) }}
          </template>
        </el-table-column>
        <el-table-column prop="isEmergency" label="是否急诊" width="100">
          <template #default="{ row }">
            {{ translateEmergency(row.isEmergency) }}
          </template>
        </el-table-column>
        <el-table-column prop="feeAmount" label="挂号费用" width="100">
        <template #default="{ row }">
          ¥{{ row.feeAmount }}
        </template>
      </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180"></el-table-column>
        <el-table-column prop="paymentTime" label="支付时间" width="120">
        <template #default="{ row }">
          {{ row.paymentTime || '未支付' }}
        </template>
      </el-table-column>
        <el-table-column prop="checkInTime" label="报道时间" width="120">
        <template #default="{ row }">
          {{ row.checkInTime || '未报道' }}
        </template>
      </el-table-column>
        <el-table-column prop="scheduleDate" label="就诊日期" width="120">
          <template #default="{ row }">
            {{ row.scheduleDate || '未就诊' }}
          </template>
        </el-table-column>
        <el-table-column prop="cancelTime" label="取消时间" width="120">
          <template #default="{ row }">
            {{ row.cancelTime || '未取消' }}
          </template>
        </el-table-column>
        <el-table-column prop="cancelReason" label="取消原因" width="120">
          <template #default="{ row }">
            {{ row.cancelReason || '无' }}
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.orderStatus)">
              {{ getStatusText(row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button
                  size="small"
                  type="primary"
                  @click="handleViewDetail(row)"
              >
                查看详情
              </el-button>
              <el-button
                  v-if="row.orderStatus === 2"
                  size="small"
                  type="warning"
                  @click="handleComplete(row)"
              >
                完成
              </el-button>
              <el-button
                  v-if="row.orderStatus === 2"
                  size="small"
                  type="danger"
                  @click="handleCancel(row)"
              >
                取消
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

    <!-- 订单详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="订单详情"
        width="600px"
        :before-close="handleCloseDetail"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.orderStatus)">
              {{ getStatusText(currentOrder.orderStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="患者姓名">{{ currentOrder.patientName }}</el-descriptions-item>
          <el-descriptions-item label="患者手机">{{ currentOrder.patientPhone }}</el-descriptions-item>
          <el-descriptions-item label="医生姓名">{{ currentOrder.doctorName }}</el-descriptions-item>
          <el-descriptions-item label="所属科室">{{ getDeptName(currentOrder.deptName) }}</el-descriptions-item>
          <el-descriptions-item label="就诊日期">{{ formatScheduleDate(currentOrder.scheduleDate) }}</el-descriptions-item>
          <el-descriptions-item label="时间段">{{ translateTimePeriod(currentOrder.timePeriod) }}</el-descriptions-item>
          <el-descriptions-item label="是否急诊">{{ translateEmergency(currentOrder.isEmergency) }}</el-descriptions-item>
          <el-descriptions-item label="挂号费用">¥{{ currentOrder.feeAmount }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ currentOrder.paymentTime || '未支付' }}</el-descriptions-item>
          <el-descriptions-item label="报道时间">{{ currentOrder.checkInTime || '未报道' }}</el-descriptions-item>
          <el-descriptions-item label="取消时间">{{ currentOrder.cancelTime || '未取消' }}</el-descriptions-item>
          <el-descriptions-item label="取消原因">{{ currentOrder.cancelReason || '无' }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ currentOrder.updateTime }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi } from '@/api/order.ts'

// 定义props
const props = defineProps({
  deptMap: {
    type: Map,
    required: true
  }
})

// 定义emits
const emit = defineEmits(['update-orders'])

// 状态管理
const orders = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const detailDialogVisible = ref(false)
const currentOrder = ref(null)

// 搜索表单数据 - 根据API文档调整
const searchForm = ref({
  orderNo: '',
  slotId: '',
  orderStatus: null,
  isEmergency: null
  // 移除不支持的字段: patientName, patientPhone, doctorName, deptId, createTimeStart, createTimeEnd
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

// 急诊状态翻译函数
const translateEmergency = (isEmergency) => {
  return isEmergency === 1 ? '是' : '否'
}

// 获取科室名称 - 修改为使用返回数据的deptName属性
const getDeptName = (deptName) => {
  if (!deptName || deptName === '') {
    return '未分配'
  }
  return deptName
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '待支付',
    2: '待就诊',
    3: '已取消',
    4: '已完成',
    5: '已取号'
  }
  return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'info',      // 待支付 - 灰色
    2: 'primary',   // 待就诊 - 蓝色
    3: 'danger',    // 已取消 - 红色
    4: 'success',   // 已完成 - 绿色
    5: 'warning'    // 已取号 - 橙色
  }
  return typeMap[status] || 'info'
}

// 处理就诊日期显示
const formatScheduleDate = (scheduleDate) => {
  return scheduleDate || '还未就诊'
}

// 分页变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchOrders()
}

// 查询方法
const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 重置方法
const handleReset = () => {
  searchForm.value = {
    orderNo: '',
    slotId: '',
    orderStatus: null,
    isEmergency: null
  }
  currentPage.value = 1
  fetchOrders()
}

// 查看详情
const handleViewDetail = (order) => {
  currentOrder.value = order
  detailDialogVisible.value = true
}

// 关闭详情对话框
const handleCloseDetail = () => {
  detailDialogVisible.value = false
  currentOrder.value = null
}

// 完成订单
const handleComplete = async (order) => {
  try {
    await ElMessageBox.confirm(
        `确定要完成订单 ${order.orderNo} 吗？`,
        '确认完成',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    // 这里需要调用完成订单的API，假设是 completeOrder
    const response = await orderApi.completeOrder(order.id)

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('订单完成成功')
      fetchOrders()
    } else {
      const errorMsg = response?.msg || response?.message || '完成失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('完成订单失败:', error)
    ElMessage.error('完成失败，请稍后重试')
  }
}

// 取消订单
const handleCancel = async (order) => {
  try {
    await ElMessageBox.confirm(
        `确定要取消订单 ${order.orderNo} 吗？`,
        '确认取消',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    const response = await orderApi.cancelOrder(order.id, { reason: '用户取消' })

    if (response && (response.code === 200 || response.code === 0 || response.success)) {
      ElMessage.success('订单取消成功')
      fetchOrders()
    } else {
      const errorMsg = response?.msg || response?.message || '取消失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('取消订单失败:', error)
    ElMessage.error('取消失败，请稍后重试')
  }
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    // 构建符合API文档的请求参数
    const requestData = {
      orderNo: searchForm.value.orderNo || undefined,
      slotId: searchForm.value.slotId ? parseInt(searchForm.value.slotId, 10) : undefined,
      orderStatus: searchForm.value.orderStatus !== null ? searchForm.value.orderStatus : undefined,
      isEmergency: searchForm.value.isEmergency !== null ? searchForm.value.isEmergency : undefined,
      page: currentPage.value,
      size: pageSize.value,
      sortBy: "create_time",
      sortDir: "desc"
    }

    // 清除undefined参数
    Object.keys(requestData).forEach(key => {
      if (requestData[key] === undefined) {
        delete requestData[key]
      }
    })

    const response = await orderApi.pageQuery(requestData)
    console.log('订单API响应:', response)

    // 根据API文档处理响应数据
    if (response && response.data) {
      // 处理PageResult格式的响应
      if (Array.isArray(response.data.records)) {
        orders.value = response.data.records
        console.log('订单数据:', response.data.records)
        response.data.records.forEach((order, index) => {
          console.log(`订单${index}: ID=${order.id}, orderStatus=${order.orderStatus}, 类型=${typeof order.orderStatus}`)
        })
        total.value = response.data.total || 0
      } else {
        orders.value = Array.isArray(response.data) ? response.data : []
        total.value = orders.value.length
      }
      emit('update-orders', orders.value)
    } else {
      orders.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  }
}

// 暴露方法给父组件
defineExpose({
  fetchOrders,
  orders,
  total,
  currentPage,
  pageSize
})

// 初始化
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-management {
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

.order-detail {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
