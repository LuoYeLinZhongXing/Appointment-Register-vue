<template>
  <div class="my-appointments">
    <div class="appointments-header">
      <h3>我的预约列表</h3>
      <el-button type="primary" @click="refreshAppointments" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 100px; margin-bottom: 15px" />
          <el-skeleton-item variant="rect" style="width: 100%; height: 100px; margin-bottom: 15px" />
          <el-skeleton-item variant="rect" style="width: 100%; height: 100px" />
        </template>
      </el-skeleton>
    </div>

    <!-- 预约列表 -->
    <div v-else-if="appointments.length > 0" class="appointments-list">
      <el-card
          v-for="appointment in appointments"
          :key="appointment.id"
          class="appointment-card"
          :class="getStatusClass(appointment.orderStatus)"
          shadow="hover"
      >
        <div class="appointment-content">
          <div class="appointment-header">
            <div class="status-badge" :class="getStatusClass(appointment.orderStatus)">
              {{ getStatusText(appointment.orderStatus) }}
            </div>
            <div class="order-number">
              订单号：{{ appointment.orderNo }}
            </div>
          </div>

          <div class="appointment-body">
            <div class="info-row">
              <el-icon><User /></el-icon>
              <span class="info-label">医生：</span>
              <span class="info-value">{{ appointment.doctorName }}</span>
            </div>

            <div class="info-row">
              <el-icon><OfficeBuilding /></el-icon>
              <span class="info-label">科室：</span>
              <span class="info-value">{{ appointment.deptName }}</span>
            </div>

            <div class="info-row">
              <el-icon><Clock /></el-icon>
              <span class="info-label">时间：</span>
              <span class="info-value">{{ formatAppointmentTime(appointment) }}</span>
            </div>

            <div class="info-row">
              <el-icon><PriceTag /></el-icon>
              <span class="info-label">费用：</span>
              <span class="info-value price">¥{{ appointment.feeAmount }}</span>
            </div>

            <div v-if="appointment.isEmergency" class="info-row">
              <el-icon><Warning /></el-icon>
              <span class="info-label">类型：</span>
              <span class="info-value emergency">急诊</span>
            </div>
          </div>

          <div class="appointment-footer">
            <div class="time-info">
              <span>创建时间：{{ formatDateTime(appointment.createTime) }}</span>
            </div>
            <div class="action-buttons">
              <el-button
                  type="info"
                  size="small"
                  @click="showOrderDetail(appointment)"
              >
                查看详情
              </el-button>
              <el-button
                  v-if="appointment.orderStatus === 1"
                  type="success"
                  size="small"
                  @click="handlePay(appointment)"
                  :loading="appointment.paying"
              >
                立即支付
              </el-button>
              <el-button
                  v-if="appointment.orderStatus === 1"
                  type="warning"
                  size="small"
                  @click="handleCancel(appointment)"
              >
                取消预约
              </el-button>
              <el-button
                  v-if="appointment.orderStatus === 2"
                  type="primary"
                  size="small"
                  @click="handleCheckIn(appointment)"
                  :loading="checkingIn[appointment.id]"
              >
                <el-icon><Position /></el-icon>
                我要报到
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="暂无预约记录">
        <el-button type="primary" @click="goToAppointment">
          去预约
        </el-button>
      </el-empty>
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
        v-model="showDetailDialog"
        title="预约订单详情"
        width="800px"
        :before-close="closeDetailDialog"
    >
      <div v-if="selectedOrder" class="order-detail-content">
        <div class="order-header">
          <el-icon class="success-icon"><SuccessFilled /></el-icon>
          <h4>预约信息</h4>
          <p class="order-id">订单号：{{ selectedOrder.orderNo }}</p>
        </div>

        <div class="order-info">
          <div class="info-section">
            <h5>基本信息</h5>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">患者姓名：</span>
                <span class="value">{{ selectedOrder.patientName }}</span>
              </div>
              <div class="info-item">
                <span class="label">就诊科室：</span>
                <span class="value">{{ selectedOrder.deptName }}</span>
              </div>
              <div class="info-item">
                <span class="label">主治医生：</span>
                <span class="value">{{ selectedOrder.doctorName }}</span>
              </div>
              <div class="info-item">
                <span class="label">就诊类型：</span>
                <span class="value" :class="getOrderTypeClass(selectedOrder.isEmergency)">
                  {{ selectedOrder.isEmergency === 1 ? '急诊' : '普通门诊' }}
                </span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h5>时间安排</h5>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">预约时间：</span>
                <span class="value">{{ formatDateTime(selectedOrder.createTime) }}</span>
              </div>
              <div v-if="selectedOrder.paymentTime" class="info-item">
                <span class="label">支付时间：</span>
                <span class="value">{{ formatDateTime(selectedOrder.paymentTime) }}</span>
              </div>
              <div v-if="selectedOrder.checkInTime" class="info-item">
                <span class="label">报到时间：</span>
                <span class="value">{{ formatDateTime(selectedOrder.checkInTime) }}</span>
              </div>
              <div v-if="selectedOrder.cancelTime" class="info-item">
                <span class="label">取消时间：</span>
                <span class="value">{{ formatDateTime(selectedOrder.cancelTime) }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h5>费用信息</h5>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">挂号费用：</span>
                <span class="value price">¥{{ selectedOrder.feeAmount }}</span>
              </div>
              <div v-if="selectedOrder.isEmergency === 1" class="info-item">
                <span class="label">急诊费用：</span>
                <span class="value price">+ ¥10</span>
              </div>
              <div class="info-item total">
                <span class="label">总费用：</span>
                <span class="value price total-price">
                  ¥{{ selectedOrder.feeAmount + (selectedOrder.isEmergency === 1 ? 10 : 0) }}
                </span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h5>订单状态</h5>
            <div class="status-info">
              <el-tag :type="getOrderStatusType(selectedOrder.orderStatus)" size="large">
                {{ getOrderStatusText(selectedOrder.orderStatus) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDetailDialog">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { orderApi } from '@/api/order'

// 导入图标
const {
  Refresh,
  User,
  OfficeBuilding,
  Clock,
  PriceTag,
  Warning,
  SuccessFilled,
  Position  // 添加位置图标用于报到按钮
} = ElementPlusIconsVue

const router = useRouter()

// 状态管理
const appointments = ref([])
const loading = ref(false)
const currentUser = ref({
  id: 1,
  name: '张三'
})

// 订单详情对话框相关
const showDetailDialog = ref(false)
const selectedOrder = ref(null)

// 添加取号状态
const checkingIn = ref({})  // 用于跟踪各个订单的取号状态

// 方法
const refreshAppointments = async () => {
  try {
    loading.value = true

    console.log('开始获取患者订单列表')

    // 调用真实API
    const response = await orderApi.getPatientOrders()
    console.log('API响应:', response)

    // 处理API响应数据
    let rawData = []
    if (response && response.data) {
      // 如果是Result包装的对象
      rawData = Array.isArray(response.data) ? response.data : [response.data]
    } else if (Array.isArray(response)) {
      // 如果直接返回数组
      rawData = response
    } else if (response && typeof response === 'object' && response.id) {
      // 如果返回单个对象
      rawData = [response]
    } else {
      // 如果都没有数据，使用模拟数据作为后备
      console.log('API无数据返回，使用模拟数据')
      appointments.value = getMockAppointments()
      return
    }

    // 处理数据格式，确保字段名一致
    appointments.value = rawData.map(item => ({
      ...item,
      // 如果API返回的字段名不同，这里进行映射
      scheduleDate: item.createTime ? item.createTime.split(' ')[0] : '',
      timePeriod: 'morning', // 这个字段API可能没有返回，需要后续补充
      doctorId: item.doctorId || 1,
      deptId: item.deptId || 1,
      slotId: item.slotId || 1,
      patientId: item.patientId || 1
    }))

    console.log('处理后的预约列表:', appointments.value)
    ElMessage.success('刷新成功')

  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error('获取预约列表失败，使用模拟数据')
    // 出错时使用模拟数据
    appointments.value = getMockAppointments()
  } finally {
    loading.value = false
  }
}

// 显示订单详情
const showOrderDetail = (order) => {
  selectedOrder.value = order
  showDetailDialog.value = true
}

// 关闭订单详情对话框
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedOrder.value = null
}

// 订单状态相关方法
const getOrderTypeClass = (isEmergency) => {
  return isEmergency === 1 ? 'emergency-type' : 'normal-type'
}

const getOrderStatusType = (orderStatus) => {
  const statusMap = {
    1: 'info',    // 待支付
    2: 'success', // 已支付
    3: 'warning', // 已取消
    4: 'primary', // 已就诊
    5: 'warning'  // 已取号
  }
  return statusMap[orderStatus] || 'info'
}

const getOrderStatusText = (orderStatus) => {
  const statusMap = {
    1: '待支付',
    2: '已支付',
    3: '已取消',
    4: '已就诊',
    5: '已取号'
  }
  return statusMap[orderStatus] || '未知状态'
}

// 模拟数据作为后备方案
const getMockAppointments = () => {
  return [
    {
      id: 1,
      orderNo: 'LYLZX0BUQ9N723',
      patientName: '张三',
      doctorName: '张明华',
      deptName: '内科',
      feeAmount: 50,
      orderStatus: 1, // 待支付
      createTime: '2026-02-24 16:12:11',
      isEmergency: 1,
      paying: false
    },
    {
      id: 2,
      orderNo: 'LYLZX0BUQ9N724',
      patientName: '张三',
      doctorName: '李小红',
      deptName: '外科',
      feeAmount: 60,
      orderStatus: 2, // 已支付
      createTime: '2026-02-23 14:30:22',
      paymentTime: '2026-02-23 14:35:15',
      isEmergency: 0
    },
    {
      id: 3,
      orderNo: 'LYLZX0BUQ9N725',
      patientName: '张三',
      doctorName: '王大力',
      deptName: '内科',
      feeAmount: 45,
      orderStatus: 4, // 已就诊
      createTime: '2026-02-21 10:15:30',
      paymentTime: '2026-02-21 10:20:45',
      checkInTime: '2026-02-22 14:30:12',
      isEmergency: 0
    },
    {
      id: 4,
      orderNo: 'LYLZX0BUQ9N726',
      patientName: '张三',
      doctorName: '赵美丽',
      deptName: '儿科',
      feeAmount: 35,
      orderStatus: 5, // 已取号
      createTime: '2026-02-25 09:30:15',
      paymentTime: '2026-02-25 09:35:20',
      checkInTime: '2026-02-25 09:45:30',
      isEmergency: 0
    }

  ]
}

const getStatusClass = (status) => {
  const classMap = {
    1: 'status-pending',
    2: 'status-paid',
    3: 'status-cancelled',
    4: 'status-completed',
    5: 'status-checked-in'
  }
  return classMap[status] || 'status-pending'
}

const getStatusText = (status) => {
  const textMap = {
    1: '待支付',
    2: '已支付',
    3: '已取消',
    4: '已就诊',
    5: '已取号'
  }
  return textMap[status] || '未知状态'
}

const formatAppointmentTime = (appointment) => {
  const timeMap = {
    'morning': '上午 08:00-12:00',
    'afternoon': '下午 14:00-18:00',
    'night': '晚上 18:00-21:00'
  }
  return `${appointment.scheduleDate} ${timeMap[appointment.timePeriod] || appointment.timePeriod}`
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '未知时间'
  // 根据实际返回的时间格式进行处理
  return dateTime.replace('T', ' ').substring(0, 19)
}

const handlePay = async (appointment) => {
  try {
    appointment.paying = true

    await ElMessageBox.confirm(
        `确认支付订单 ${appointment.orderNo} 吗？费用：¥${appointment.feeAmount}`,
        '支付确认',
        {
          confirmButtonText: '确认支付',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    // 模拟支付API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 更新状态
    appointment.orderStatus = 2
    appointment.paymentTime = new Date().toLocaleString('zh-CN').replace(/\//g, '-')

    ElMessage.success('支付成功！')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('支付失败，请稍后重试')
    }
  } finally {
    appointment.paying = false
  }
}

const handleCancel = async (appointment) => {
  try {
    await ElMessageBox.confirm(
        '确认取消该预约吗？',
        '取消预约',
        {
          confirmButtonText: '确认取消',
          cancelButtonText: '继续预约',
          type: 'warning'
        }
    )

    // 模拟取消API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新状态
    appointment.orderStatus = 3
    appointment.cancelTime = new Date().toLocaleString('zh-CN').replace(/\//g, '-')

    ElMessage.success('预约已取消')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败，请稍后重试')
    }
  }
}

const handleCheckIn = async (appointment) => {
  try {
    // 设置该订单的取号状态为加载中
    checkingIn.value[appointment.id] = true

    await ElMessageBox.confirm(
      `确认对订单 ${appointment.orderNo} 进行报到吗？报到后请按时前往医院就诊`,
      '报到确认',
      {
        confirmButtonText: '确认报到',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    // 调用取号API
    const checkInData = {
      orderId: appointment.id
    }

    console.log('开始取号，订单ID:', appointment.id)
    const response = await orderApi.checkInOrder(checkInData)
    console.log('取号响应:', response)

    // 检查取号结果
    if (response && (response.code === 200 || response.data)) {
      ElMessage.success('报到成功！请按时前往医院就诊')

      // 更新订单状态
      appointment.orderStatus = 5  // 已取号状态
      appointment.checkInTime = new Date().toLocaleString('zh-CN').replace(/\//g, '-')


      // 刷新列表
      await refreshAppointments()
    } else {
      throw new Error('报到失败')
    }

  } catch (error) {
    if (error !== 'cancel') {
      console.error('报到失败:', error)
      ElMessage.error('报到失败，请稍后重试')
    }
  } finally {
    // 重置该订单的取号状态
    checkingIn.value[appointment.id] = false
  }
}

const goToAppointment = () => {
  // 跳转到预约挂号页面
  router.push('/patient?tab=appointment')
}

// 初始化
onMounted(() => {
  // 获取当前用户信息
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      currentUser.value = { ...currentUser.value, ...JSON.parse(userInfo) }
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }

  refreshAppointments()
})
</script>

<style scoped>
.my-appointments {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.appointments-header h3 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.loading-container {
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.appointment-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.appointment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.appointment-card.status-pending {
  border-left-color: #409EFF;
}

.appointment-card.status-paid {
  border-left-color: #67C23A;
}

.appointment-card.status-cancelled {
  border-left-color: #909399;
}

.appointment-card.status-completed {
  border-left-color: #E6A23C;
}

.appointment-content {
  padding: 20px;
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.status-pending {
  background-color: #ecf5ff;
  color: #409EFF;
  border: 1px solid #409EFF;
}

.status-badge.status-paid {
  background-color: #f0f9ff;
  color: #67C23A;
  border: 1px solid #67C23A;
}

.status-badge.status-cancelled {
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #909399;
}

.status-badge.status-completed {
  background-color: #fdf6ec;
  color: #E6A23C;
  border: 1px solid #E6A23C;
}

.order-number {
  font-size: 14px;
  color: #999;
}
.status-badge.status-checked-in {
  background-color: #fef0f0;
  color: #F56C6C;
  border: 1px solid #F56C6C;
}

.appointment-card.status-checked-in {
  border-left-color: #F56C6C;
}

.appointment-body {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-row .el-icon {
  margin-right: 8px;
  font-size: 16px;
  color: #999;
}

.info-label {
  color: #666;
  margin-right: 8px;
  min-width: 50px;
}

.info-value {
  font-weight: 500;
  color: #333;
}

.price {
  color: #F56C6C;
  font-weight: 600;
}

.emergency {
  color: #F56C6C;
}

.appointment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.time-info {
  font-size: 12px;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 订单详情对话框样式 */
.order-detail-content {
  padding: 20px;
}

.order-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.success-icon {
  font-size: 48px;
  color: #67C23A;
  margin-bottom: 15px;
}

.order-header h4 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.order-id {
  margin: 0;
  font-size: 16px;
  color: #999;
}

.info-section {
  margin-bottom: 25px;
}

.info-section h5 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  font-weight: 600;
  color: #333;
}

.emergency-type {
  color: #F56C6C;
}

.normal-type {
  color: #409EFF;
}

.price {
  color: #F56C6C;
  font-size: 16px;
}

.total-price {
  font-size: 18px;
  color: #E6A23C;
}

.total {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}

.status-info {
  text-align: center;
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .my-appointments {
    padding: 15px;
  }

  .appointments-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .appointment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .appointment-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .action-buttons {
    width: 100%;
    justify-content: flex-end;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .order-detail-content {
    padding: 15px;
  }

  .order-header h4 {
    font-size: 20px;
  }
}
</style>
