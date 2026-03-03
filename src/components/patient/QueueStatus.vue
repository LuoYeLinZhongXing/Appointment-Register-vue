NEW_FILE_CODE
<template>
  <div class="queue-status">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" style="width: 100%; height: 200px; margin-bottom: 20px" />
          <el-skeleton-item variant="rect" style="width: 100%; height: 300px" />
        </template>
      </el-skeleton>
    </div>

    <!-- 取号成功提示 -->
    <el-alert
        v-else-if="checkInInfo"
        :title="`取号成功！您的排队号码是 ${checkInInfo.queueNumber || 'N/A'}`"
        type="success"
        show-icon
        closable
        class="checkin-success-alert"
    >
      <template #description>
        <div class="alert-details">
          <p>请耐心等待叫号，预计等待时间：{{ estimatedWaitTime }}分钟</p>
          <p>报到时间：{{ formatDateTime(checkInInfo.checkInTime) }}</p>
        </div>
      </template>
    </el-alert>

    <!-- 排队信息卡片 -->
    <el-card v-if="!loading" class="queue-info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><List /></el-icon>
          <span>当前排队信息</span>
        </div>
      </template>

      <div v-if="checkInInfo" class="queue-details">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ checkInInfo.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">患者姓名：</span>
            <span class="value">{{ checkInInfo.patientName }}</span>
          </div>
          <div class="info-item">
            <span class="label">就诊科室：</span>
            <span class="value">{{ checkInInfo.deptName }}</span>
          </div>
          <div class="info-item">
            <span class="label">主治医生：</span>
            <span class="value">{{ checkInInfo.doctorName }}</span>
          </div>
          <div class="info-item">
            <span class="label">挂号费用：</span>
            <span class="value price">¥{{ checkInInfo.feeAmount }}</span>
          </div>
          <div class="info-item">
            <span class="label">急诊标识：</span>
            <el-tag :type="checkInInfo.isEmergency === 1 ? 'danger' : 'info'">
              {{ checkInInfo.isEmergency === 1 ? '急诊' : '普通' }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">排队号码：</span>
            <span class="value queue-number">{{ checkInInfo.queueNumber || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">当前状态：</span>
            <el-tag v-if="currentUserQueue" :type="getQueueStatusType(currentUserQueue.queueStatus)">
              {{ getQueueStatusText(currentUserQueue.queueStatus) }}
            </el-tag>
            <el-tag v-else type="warning">等待叫号</el-tag>
          </div>
        </div>

        <div class="time-info">
          <div class="info-item">
            <span class="label">报到时间：</span>
            <span class="value">{{ formatDateTime(checkInInfo.checkInTime) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-icon class="empty-icon"><DocumentRemove /></el-icon>
        <p>暂无排队信息</p>
        <el-button type="primary" @click="goToAppointments">查看我的预约</el-button>
      </div>
    </el-card>

    <!-- 等待队列预览 -->
    <el-card v-if="checkInInfo" class="waiting-preview-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><Users /></el-icon>
          <span>当前等待队列</span>
          <el-tag type="info" class="queue-count">共 {{ waitingCount }} 人等待</el-tag>
        </div>
      </template>

      <div v-if="waitingCount > 0" class="queue-preview">
        <div class="queue-item" v-for="n in Math.min(waitingCount, 5)" :key="n">
          <div class="queue-position">{{ n }}</div>
          <div class="patient-info">
            <span class="patient-name">患者{{ n }}</span>
            <span class="wait-time">等待 {{ n * 5 }}分钟</span>
          </div>
          <el-tag :type="n === 1 ? 'warning' : 'info'" size="small">
            {{ n === 1 ? '正在叫号' : '等待中' }}
          </el-tag>
        </div>
        <div v-if="waitingCount > 5" class="more-info">
          <el-icon><More /></el-icon>
          <span>还有 {{ waitingCount - 5 }} 人在等待</span>
        </div>
      </div>
      <div v-else class="empty-queue">
        <el-icon class="empty-icon"><SuccessFilled /></el-icon>
        <p>您是当前第一位，即将叫号</p>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <div v-if="!loading" class="action-buttons">
      <el-button @click="refreshQueue" :loading="loading">
        <el-icon><Refresh /></el-icon>
        刷新队列
      </el-button>
      <el-button type="primary" @click="goToAppointments">
        <el-icon><ArrowLeft /></el-icon>
        返回预约列表
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { queueApi } from '@/api/queue'

const {
  List,
  Users,
  DocumentRemove,
  More,
  SuccessFilled
} = ElementPlusIconsVue

const router = useRouter()
const route = useRoute()

// 接收父组件传递的查询函数
const props = defineProps({
  getPatientById: {
    type: Function,
    default: null
  },
  getDoctorById: {
    type: Function,
    default: null
  },
  getDeptById: {
    type: Function,
    default: null
  }
})

// 状态管理
const checkInInfo = ref(null)
const waitingCount = ref(0)
const estimatedWaitTime = ref(0)
const loading = ref(false)

// 实际队列数据
const actualQueue = ref([])
const currentUserQueue = ref(null)

// 队列状态映射
const getQueueStatusText = (status) => {
  const statusMap = {
    1: '等待中',
    2: '已叫号',
    3: '接诊中',
    4: '已完成',
    5: '失约'
  }
  return statusMap[status] || '未知状态'
}

const getQueueStatusType = (status) => {
  const typeMap = {
    1: 'info',    // 等待中
    2: 'warning', // 已叫号
    3: 'primary', // 接诊中
    4: 'success', // 已完成
    5: 'danger'   // 失约
  }
  return typeMap[status] || 'info'
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '未记录'
  return dateTime.replace('T', ' ').substring(0, 19)
}

// 获取患者排队信息
const fetchPatientQueueInfo = async () => {
  try {
    loading.value = true

    console.log('开始获取患者排队信息')

    // 调用真实API
    const response = await queueApi.getPatientQueueInfo()
    console.log('API响应:', response)

    if (response && response.data) {
      let queueData = null

      // 处理不同的数据结构
      if (Array.isArray(response.data) && response.data.length > 0) {
        // 如果返回数组，取第一个元素
        queueData = response.data[0]
        console.log('处理数组数据，使用第一个元素:', queueData)
      } else if (response.data && typeof response.data === 'object') {
        // 如果返回对象
        queueData = response.data
        console.log('处理对象数据:', queueData)
      }

      // 处理当前用户的排队信息
      if (queueData && queueData.id) {
        currentUserQueue.value = queueData

        // 异步获取详细信息
        let patientName = '未知患者'
        let doctorName = '未知医生'
        let deptName = '未知科室'

        // 并发获取详细信息
        const promises = []

        if (props.getPatientById && queueData.patientId) {
          promises.push(props.getPatientById(queueData.patientId).then(patient => {
            if (patient) {
              patientName = patient.name || patientName
            }
          }).catch(err => {
            console.error('获取患者信息失败:', err)
          }))
        }

        if (props.getDoctorById && queueData.doctorId) {
          promises.push(props.getDoctorById(queueData.doctorId).then(doctor => {
            if (doctor) {
              doctorName = doctor.name || doctorName
            }
          }).catch(err => {
            console.error('获取医生信息失败:', err)
          }))
        }

        if (props.getDeptById && queueData.deptId) {
          promises.push(props.getDeptById(queueData.deptId).then(dept => {
            if (dept) {
              deptName = dept.name || deptName
            }
          }).catch(err => {
            console.error('获取科室信息失败:', err)
          }))
        }

        // 等待所有请求完成
        await Promise.all(promises)

        // 构建显示用的信息
        checkInInfo.value = {
          orderNo: queueData.orderId || '未知',
          patientName: patientName,
          deptName: deptName,
          doctorName: doctorName,
          feeAmount: 50, // 需要通过API或关联查询获取
          isEmergency: queueData.isPriority || 0,
          queueNumber: queueData.queueNumber || 'N/A',
          checkInTime: queueData.checkInTime,
          createTime: queueData.createTime,
          paymentTime: queueData.callTime || queueData.createTime // 使用创建时间作为备选
        }

        // 设置队列统计信息
        waitingCount.value = queueData.queueNumber ? queueData.queueNumber - 1 : 0
        estimatedWaitTime.value = waitingCount.value * 5 // 简单估算，每人次5分钟

        console.log('排队信息设置完成:', checkInInfo.value)
        ElMessage.success('排队信息加载成功')
      } else {
        console.log('没有找到有效的排队数据')
        ElMessage.warning('暂无排队信息')
      }
    } else {
      console.log('API响应无数据')
      ElMessage.warning('暂无排队信息')
    }

  } catch (error) {
    console.error('获取排队信息失败:', error)
    ElMessage.error('获取排队信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 刷新队列
const refreshQueue = async () => {
  await fetchPatientQueueInfo()
}

// 返回预约列表
const goToAppointments = () => {
  router.push('/patient?tab=my-orders')
}

// 初始化
onMounted(() => {
  // 检查路由参数中的取号数据
  const checkInDataParam = route.query.checkInData
  if (checkInDataParam) {
    try {
      const parsedData = JSON.parse(decodeURIComponent(checkInDataParam))
      checkInInfo.value = {
        ...parsedData,
        queueNumber: Math.floor(Math.random() * 100) + 1 // 临时模拟排队号码
      }
      ElMessage.success('取号信息加载成功')

      // 保存到localStorage
      localStorage.setItem('lastCheckInData', JSON.stringify(checkInInfo.value))
    } catch (error) {
      console.error('解析取号数据失败:', error)
      ElMessage.error('取号信息加载失败')
    }
  } else {
    // 如果没有传入数据，尝试从localStorage获取
    const savedCheckInData = localStorage.getItem('lastCheckInData')
    if (savedCheckInData) {
      try {
        checkInInfo.value = JSON.parse(savedCheckInData)
      } catch (error) {
        console.error('解析保存的取号数据失败:', error)
      }
    }
  }

  // 获取实时排队信息
  fetchPatientQueueInfo()
})
</script>

<style scoped>
.queue-status {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.checkin-success-alert {
  margin-bottom: 20px;
}

.alert-details p {
  margin: 5px 0;
  color: #606266;
}

.queue-info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.header-icon {
  font-size: 20px;
}

.queue-details {
  padding: 20px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
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

.price {
  color: #F56C6C;
  font-size: 16px;
}

.queue-number {
  font-size: 20px;
  font-weight: 700;
  color: #409EFF;
}

.time-info {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.time-info .info-item {
  background: none;
  padding: 8px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  color: #C0C4CC;
  margin-bottom: 15px;
}

.waiting-preview-card {
  margin-bottom: 20px;
}

.queue-count {
  margin-left: auto;
}

.queue-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: #f5f7fa;
  border-radius: 6px;
  gap: 15px;
}

.queue-position {
  width: 30px;
  height: 30px;
  background-color: #409EFF;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.patient-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-weight: 500;
  color: #333;
}

.wait-time {
  font-size: 12px;
  color: #999;
}

.more-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  color: #999;
  font-size: 14px;
  gap: 8px;
}

.empty-queue {
  text-align: center;
  padding: 40px 20px;
}

.empty-queue .empty-icon {
  font-size: 48px;
  color: #67C23A;
  margin-bottom: 15px;
}

.empty-queue p {
  margin: 0;
  color: #67C23A;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .queue-status {
    padding: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .queue-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
