<template>
  <div class="queue-management">
    <h2 class="section-title">我的队列管理</h2>

    <!-- 当前就诊患者信息 -->
    <el-card class="current-patient-card" v-if="currentPatient" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><User /></el-icon>
          <span>当前就诊患者</span>
          <el-tag :type="getStatusType(currentPatient.queueStatus)" class="status-tag">
            {{ getStatusText(currentPatient.queueStatus) }}
          </el-tag>
        </div>
      </template>

      <div class="patient-info">
        <div class="info-row">
          <div class="info-item">
            <label>患者姓名：</label>
            <span>{{ currentPatient.patientName || '未知' }}</span>
          </div>
          <div class="info-item">
            <label>队列号码：</label>
            <span class="queue-number">{{ currentPatient.queueNumber }}</span>
          </div>
        </div>

        <div class="info-item">
          <label>订单号：</label>
          <span>{{ currentPatient.orderNo || '无' }}</span>
        </div>

        <div class="info-row">
          <div class="info-item">
            <label>挂号时间：</label>
            <span>{{ formatDate(currentPatient.checkInTime) }}</span>
          </div>
          <div class="info-item">
            <label>叫号时间：</label>
            <span>{{ formatDate(currentPatient.callTime) || '未叫号' }}</span>
          </div>
        </div>

        <div class="info-row">
          <div class="info-item">
            <label>是否急诊：</label>
            <el-tag :type="currentPatient.isPriority === 1 ? 'danger' : 'info'">
              {{ currentPatient.isPriority === 1 ? '是' : '否' }}
            </el-tag>
          </div>
          <div class="info-item">
            <label>失约次数：</label>
            <span>{{ currentPatient.missedCount }}/{{ currentPatient.maxMissedAllowed }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button
              v-if="currentPatient.queueStatus === 1"
              type="primary"
              @click="handleCallPatient"
              :loading="callingLoading"
          >
            <el-icon><Bell /></el-icon>
            叫号
          </el-button>

          <el-button
              v-if="currentPatient.queueStatus === 2"
              type="success"
              @click="handleStartTreatment"
              :loading="startingLoading"
          >
            <el-icon><VideoPlay /></el-icon>
            开始接诊
          </el-button>

          <el-button
              v-if="currentPatient.queueStatus === 3"
              type="warning"
              @click="handleFinishTreatment"
              :loading="finishingLoading"
          >
            <el-icon><CircleCheck /></el-icon>
            完成就诊
          </el-button>

          <el-button
              v-if="[2].includes(currentPatient.queueStatus)"
              type="danger"
              @click="handleMarkMissed"
              :loading="missingLoading"
          >
            <el-icon><Warning /></el-icon>
            过号
          </el-button>
        </div>

        <!-- 倒计时显示 -->
        <div v-if="countdownActive" class="countdown-display">
          <div class="countdown-timer">
            <el-icon class="timer-icon"><Clock /></el-icon>
            <span class="countdown-text">倒计时: {{ formatCountdown(countdownTime) }}</span>
          </div>
          <div class="countdown-progress">
            <el-progress
                :percentage="Math.round(((180 - countdownTime) / 180) * 100)"
                :stroke-width="8"
                :color="getCountdownColor()"
            />
          </div>
        </div>

      </div>
    </el-card>

    <!-- 等待队列列表 -->
    <el-card class="waiting-list-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon class="header-icon"><List /></el-icon>
          <span>等待队列 (共 {{ totalWaiting }} 人)</span>
          <span class="avg-wait-time">平均等待时间：{{ formatMinutes(avgWaitTime) }}</span>
        </div>
      </template>

      <div v-if="waitingList.length > 0" class="queue-list">
        <div
            v-for="(item, index) in waitingList"
            :key="item.id"
            class="queue-item"
            :class="{ 'priority-item': item.isPriority === 1 }"
        >
          <div class="queue-number-box">
            <span class="number">{{ item.queueNumber }}</span>
            <el-tag v-if="item.isPriority === 1" type="danger" size="small">急</el-tag>
          </div>


          <div class="patient-basic-info">
            <div class="patient-name">{{ item.patientName || '未知患者' }}</div>
            <div class="order-no">订单号：{{ item.orderNo || '无' }}</div>
            <div class="checkin-time">签到时间：{{ formatDate(item.checkInTime) }}</div>
          </div>


          <div class="queue-status">
            <el-tag :type="getStatusType(item.queueStatus)">
              {{ getStatusText(item.queueStatus) }}
            </el-tag>
          </div>

          <div class="wait-info">
            <div class="wait-position">前面还有 {{ index }} 人</div>
            <div class="estimated-time">预计等待：{{ calculateWaitTime(index) }}</div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-icon class="empty-icon"><DocumentRemove /></el-icon>
        <p>暂无等待患者</p>
      </div>
    </el-card>

    <!-- 刷新按钮 -->
    <div class="refresh-section">
      <el-button
          type="primary"
          plain
          @click="refreshQueue"
          :loading="refreshing"
      >
        <el-icon><Refresh /></el-icon>
        刷新队列
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted ,onUnmounted} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { queueApi } from '@/api/queue'

// 导入所需图标
const {
  User, Bell, VideoPlay, CircleCheck, Warning,
  List, DocumentRemove, Refresh
} = ElementPlusIconsVue

// 倒计时相关状态
const countdownActive = ref(false)
const countdownTime = ref(180) // 3分钟 = 180秒
const countdownTimer = ref(null)
const currentQueueId = ref(null)

// 状态管理
const currentPatient = ref(null)
const waitingList = ref([])
const totalWaiting = ref(0)
const avgWaitTime = ref(0)
const refreshing = ref(false)
const callingLoading = ref(false)
const startingLoading = ref(false)
const finishingLoading = ref(false)
const missingLoading = ref(false)

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '等待中',
    2: '呼叫中',
    3: '就诊中',
    4: '已完成',
    5: '过号',
    6: '已取消'
  }
  return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'info',      // 等待中 - 蓝色
    2: 'warning',   // 呼叫中 - 橙色
    3: 'primary',   // 就诊中 - 绿色
    4: 'success',   // 已完成 - 绿色
    5: 'danger',    // 过号 - 红色
    6: 'info'       // 已取消 - 灰色
  }
  return typeMap[status] || 'info'
}

// 格式化日期时间
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

// 格式化倒计时显示
const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}
// 获取倒计时进度条颜色
const getCountdownColor = () => {
  const progress = (180 - countdownTime.value) / 180
  if (progress < 0.5) return '#409eff'  // 蓝色 - 安全
  if (progress < 0.8) return '#e6a23c'  // 黄色 - 警告
  return '#f56c6c'  // 红色 - 危险
}


// 启动倒计时
const startCountdown = (queueId) => {
  countdownActive.value = true
  countdownTime.value = 180 // 重置为3分钟
  currentQueueId.value = queueId

  countdownTimer.value = setInterval(() => {
    countdownTime.value--

    // 每30秒提醒一次
    if (countdownTime.value === 150 || countdownTime.value === 120 || countdownTime.value === 90 || countdownTime.value === 60 || countdownTime.value === 30) {
      ElMessage.warning(`叫号已${180 - countdownTime.value}秒，剩余${formatCountdown(countdownTime.value)}`)
    }

    // 倒计时结束
    if (countdownTime.value <= 0) {
      stopCountdown()
      handleTimeout()
    }
  }, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  countdownActive.value = false
  currentQueueId.value = null
}

// 处理超时情况
const handleTimeout = async () => {
  try {
    const result = await ElMessageBox.confirm(
      '叫号已超过3分钟，是否标记为过号？',
      '超时提醒',
      {
        confirmButtonText: '过号',
        cancelButtonText: '继续等待',
        type: 'warning'
      }
    )

    // 用户选择过号
    if (result === 'confirm') {
      await handleMarkMissed(true) // 传参表示是超时过号
    } else {
      // 用户选择继续等待，重置倒计时
      countdownTime.value = 180
      ElMessage.info('倒计时已重置为3分钟')
    }
  } catch (error) {
    // 用户选择继续等待或关闭对话框
    if (error !== 'cancel') {
      console.error('处理超时失败:', error)
    } else {
      // 用户取消，重置倒计时
      countdownTime.value = 180
      ElMessage.info('倒计时已重置为3分钟')
    }
  }
}


// 格式化分钟数
const formatMinutes = (minutes) => {
  if (!minutes) return '0分钟'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}小时${mins}分钟`
  }
  return `${mins}分钟`
}

// 计算等待时间
const calculateWaitTime = (position) => {
  const estimatedMinutes = position * 15 // 假设每个患者平均15分钟
  return formatMinutes(estimatedMinutes)
}

// 获取队列数据的函数（处理实际后端数据结构）
const fetchQueueData = async () => {
  try {
    refreshing.value = true

    // 调用真实的API接口
    const response = await queueApi.getCurrentQueue('/doctor/current-queue')

    console.log('队列API原始响应:', response)

    if (response && (response.code === 200 || response.code === 0)) {
      // 处理后端返回的实际数据结构
      const rawData = response.data || []

      console.log('原始数据数组:', rawData)

      if (Array.isArray(rawData) && rawData.length > 0) {
        // 第一个元素作为当前患者
        const firstItem = rawData[0]
        currentPatient.value = {
          id: firstItem.id || firstItem.queueId,
          orderId: firstItem.orderId,
          patientId: firstItem.patientId,
          doctorId: firstItem.doctorId,
          deptId: firstItem.deptId,
          isPriority: firstItem.isPriority,
          queueNumber: firstItem.queueNumber,
          queueStatus: firstItem.queueStatus,
          checkInTime: firstItem.checkInTime,
          callTime: firstItem.callTime,
          startTime: firstItem.startTime,
          endTime: firstItem.endTime,
          missedCount: firstItem.missedCount,
          maxMissedAllowed: firstItem.maxMissedAllowed,
          orderNo: firstItem.orderNo,
          patientName: firstItem.patientName || '未知患者'
        }

        // 其余元素作为等待列表
        waitingList.value = rawData.slice(1).map((item, index) => ({
          id: item.id || item.queueId,
          orderId: item.orderId,
          patientId: item.patientId,
          doctorId: item.doctorId,
          deptId: item.deptId,
          isPriority: item.isPriority,
          queueNumber: item.queueNumber,
          queueStatus: item.queueStatus,
          checkInTime: item.checkInTime,
          callTime: item.callTime,
          startTime: item.startTime,
          endTime: item.endTime,
          missedCount: item.missedCount,
          maxMissedAllowed: item.maxMissedAllowed,
          orderNo: item.orderNo,
          patientName: item.patientName || `患者${item.queueNumber}`,
          displayIndex: index + 1
        }))

        // 设置统计信息
        totalWaiting.value = waitingList.value.length
        avgWaitTime.value = 25 // 可以根据实际情况计算

        ElMessage.success('队列数据加载成功')
      } else {
        // 如果没有数据，清空显示
        currentPatient.value = null
        waitingList.value = []
        totalWaiting.value = 0
        avgWaitTime.value = 0
        ElMessage.info('暂无队列数据')
      }
    } else {
      const errorMsg = response?.msg || response?.message || '获取队列信息失败'
      ElMessage.error(errorMsg)
      useMockData()
    }
  } catch (error) {
    console.error('获取队列数据失败:', error)
    ElMessage.error('获取队列信息失败，请检查网络连接')
    useMockData()
  } finally {
    refreshing.value = false
  }
}



// 刷新队列
const refreshQueue = () => {
  fetchQueueData()
}

// 叫号处理
const handleCallPatient = async () => {
  if (!currentPatient.value) return

  try {
    await ElMessageBox.confirm(
        `确定要叫号 ${currentPatient.value.patientName || '该患者'} 吗？`,
        '确认叫号',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    // 调用医生叫号API（根据API文档路径）
    const response = await queueApi.callNext('/doctor/call-next')

    if (response && (response.code === 200 || response.code === 0)) {
      ElMessage.success('叫号成功')

      // 启动3分钟倒计时
      startCountdown(currentPatient.value.id)
      fetchQueueData() // 重新加载队列数据
    } else {
      const errorMsg = response?.msg || response?.message || '叫号失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    console.error('叫号失败:', error)
    ElMessage.error('叫号失败，请稍后重试')
  } finally {
    callingLoading.value = false
  }
}

// 开始接诊处理
const handleStartTreatment = async () => {
  if (!currentPatient.value) {
    ElMessage.error('当前没有患者信息')
    return
  }

  // 验证队列ID
  const queueId = currentPatient.value.id
  if (!queueId || typeof queueId !== 'number') {
    ElMessage.error('无效的队列ID')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要开始为 ${currentPatient.value.patientName || '该患者'} 治疗吗？`,
      '确认开始治疗',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    startingLoading.value = true

    console.log('调用开始治疗API，队列ID:', queueId)

    // 调用开始治疗API接口
    const response = await queueApi.startTreatment(queueId)

    if (response && (response.code === 200 || response.code === 0)) {
      ElMessage.success('开始治疗成功')
      // 停止倒计时（如果有）
      stopCountdown()
      // 重新加载队列数据
      fetchQueueData()
    } else {
      const errorMsg = response?.msg || response?.message || '开始治疗失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('开始治疗失败:', error)
      ElMessage.error(`开始治疗失败: ${error.message || '请稍后重试'}`)
    }
  } finally {
    startingLoading.value = false
  }
}

// 结束接诊处理
const handleFinishTreatment = async () => {
  if (!currentPatient.value) {
    ElMessage.error('当前没有患者信息')
    return
  }

  // 验证队列ID
  const queueId = currentPatient.value.id
  if (!queueId || typeof queueId !== 'number') {
    ElMessage.error('无效的队列ID')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要完成对 ${currentPatient.value.patientName || '该患者'} 的就诊吗？`,
      '确认完成就诊',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    finishingLoading.value = true

    console.log('调用完成就诊API，队列ID:', queueId)

    // 调用完成就诊API接口
    const response = await queueApi.completeTreatment(queueId)

    if (response && (response.code === 200 || response.code === 0)) {
      ElMessage.success('完成就诊成功')
      // 重新加载队列数据
      fetchQueueData()
    } else {
      const errorMsg = response?.msg || response?.message || '完成就诊失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('完成就诊失败:', error)
      ElMessage.error(`完成就诊失败: ${error.message || '请稍后重试'}`)
    }
  } finally {
    finishingLoading.value = false
  }
}

// 患者失约处理
const handleMarkMissed = async (isTimeout = false) => {
  if (!currentPatient.value) return

  try {
    // 如果不是超时触发，需要用户确认
    if (!isTimeout) {
      await ElMessageBox.confirm(
        `确定标记 ${currentPatient.value.patientName || '该患者'} 为过号吗？`,
        '确认过号',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'error'
        }
      )
    }

    missingLoading.value = true

    // 确保queueId存在且有效
    const queueId = currentPatient.value.id
    if (!queueId) {
      throw new Error('队列ID不存在')
    }

    // 调用过号API接口
    const response = await queueApi.handleMissed(queueId)

    if (response && (response.code === 200 || response.code === 0)) {
      const successMsg = isTimeout ? '超时自动过号成功' : '标记过号成功'
      ElMessage.success(successMsg)

      // 停止倒计时
      stopCountdown()

      // 重新加载队列数据
      fetchQueueData()
    } else {
      const errorMsg = response?.msg || response?.message || '过号处理失败'
      ElMessage.error(errorMsg)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('过号处理失败:', error)
      ElMessage.error('过号处理失败，请稍后重试')
    }
  } finally {
    missingLoading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  refreshQueue,
  fetchQueueData
})

// 初始化
onMounted(() => {
  fetchQueueData()
})

onUnmounted(() =>{
  stopCountdown()
})
</script>

<style scoped>
.queue-management {
  padding: 20px 0;
}

.section-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

/* 当前患者卡片样式 */
.current-patient-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.current-patient-card :deep(.el-card__header) {
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 20px;
}

.status-tag {
  margin-left: auto;
}

.patient-info {
  padding: 20px 0;
}

.info-row {
  display: flex;
  gap: 30px;
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.info-item label {
  font-weight: 500;
  margin-right: 8px;
  opacity: 0.9;
}

.queue-number {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  min-width: 120px;
}

/* 等待列表卡片样式 */
.waiting-list-card {
  margin-bottom: 20px;
}

.waiting-list-card :deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.avg-wait-time {
  margin-left: auto;
  font-size: 14px;
  color: #666;
}

.queue-list {
  max-height: 400px;
  overflow-y: auto;
}

.queue-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;
}

.queue-item:last-child {
  border-bottom: none;
}

.queue-item:hover {
  background-color: #f8f9fa;
}

.priority-item {
  background-color: #fff3f3;
  border-left: 4px solid #f56c6c;
}

.queue-number-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
  margin-right: 20px;
}

.number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.patient-basic-info {
  flex: 1;
}

.patient-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.checkin-time {
  font-size: 14px;
  color: #666;
}

.queue-status {
  width: 80px;
  text-align: center;
}

.wait-info {
  width: 120px;
  text-align: right;
}

.wait-position {
  font-size: 14px;
  color: #666;
  margin-bottom: 3px;
}

.estimated-time {
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.refresh-section {
  text-align: center;
  padding: 20px 0;
}
/* 倒计时显示样式 */
.countdown-display {
  margin-top: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.countdown-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.timer-icon {
  font-size: 20px;
  color: #ffd700;
}

.countdown-text {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.countdown-progress {
  width: 100%;
}

.countdown-progress :deep(.el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.2);
}

.countdown-progress :deep(.el-progress-bar__inner) {
  transition: all 1s linear;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
    gap: 10px;
  }

  .queue-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .queue-number-box {
    flex-direction: row;
    width: auto;
    margin-right: 0;
    gap: 10px;
  }

  .patient-basic-info {
    width: 100%;
  }

  .queue-status, .wait-info {
    width: 100%;
    text-align: left;
  }

  .action-buttons {
    justify-content: center;
  }
}


</style>
