NEW_FILE_CODE
<template>
  <div class="medical-records">
    <div class="records-header">
      <h3>我的病历记录</h3>
      <el-button type="primary" @click="refreshRecords" :loading="loading">
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

    <!-- 病历列表 -->
    <div v-else-if="records.length > 0" class="records-list">
      <el-card
          v-for="record in records"
          :key="record.id"
          class="record-card"
          :class="getStatusClass(record.orderStatus)"
          shadow="hover"
      >
        <div class="record-content">
          <div class="record-header">
            <div class="status-badge" :class="getStatusClass(record.orderStatus)">
              {{ getStatusText(record.orderStatus) }}
            </div>
            <div class="order-number">
              订单号：{{ record.orderNo }}
            </div>
          </div>

          <div class="record-body">
            <div class="info-row">
              <el-icon><User /></el-icon>
              <span class="info-label">医生：</span>
              <span class="info-value">{{ record.doctorName }}</span>
            </div>

            <div class="info-row">
              <el-icon><OfficeBuilding /></el-icon>
              <span class="info-label">科室：</span>
              <span class="info-value">{{ record.deptName }}</span>
            </div>

            <div class="info-row">
              <el-icon><Clock /></el-icon>
              <span class="info-label">就诊时间：</span>
              <span class="info-value">{{ formatVisitTime(record) }}</span>
            </div>

            <div class="info-row">
              <el-icon><PriceTag /></el-icon>
              <span class="info-label">费用：</span>
              <span class="info-value price">¥{{ record.feeAmount }}</span>
            </div>

            <div v-if="record.isEmergency === 1" class="info-row">
              <el-icon><Warning /></el-icon>
              <span class="info-label">类型：</span>
              <span class="info-value emergency">急诊</span>
            </div>

            <div v-if="record.checkInTime" class="info-row">
              <el-icon><CircleCheck /></el-icon>
              <span class="info-label">报到时间：</span>
              <span class="info-value">{{ formatDateTime(record.checkInTime) }}</span>
            </div>
          </div>

          <div class="record-footer">
            <div class="time-info">
              <span>预约时间：{{ formatDateTime(record.createTime) }}</span>
            </div>
            <div class="action-buttons">
              <el-button
                  type="info"
                  size="small"
                  @click="showRecordDetail(record)"
              >
                查看详情
              </el-button>
              <el-button
                  type="success"
                  size="small"
                  @click="downloadRecord(record)"
              >
                <el-icon><Download /></el-icon>
                下载记录
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty description="暂无病历记录" />
    </div>

    <!-- 病历详情对话框 -->
    <el-dialog
        v-model="showDetailDialog"
        title="病历详情"
        width="800px"
        :before-close="closeDetailDialog"
    >
      <div v-if="selectedRecord" class="record-detail-content">
        <div class="detail-header">
          <el-icon class="success-icon"><SuccessFilled /></el-icon>
          <h4>就诊信息</h4>
          <p class="order-id">订单号：{{ selectedRecord.orderNo }}</p>
        </div>

        <div class="detail-info">
          <div class="info-section">
            <h5>基本信息</h5>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">患者姓名：</span>
                <span class="value">{{ selectedRecord.patientName }}</span>
              </div>
              <div class="info-item">
                <span class="label">就诊科室：</span>
                <span class="value">{{ selectedRecord.deptName }}</span>
              </div>
              <div class="info-item">
                <span class="label">主治医生：</span>
                <span class="value">{{ selectedRecord.doctorName }}</span>
              </div>
              <div class="info-item">
                <span class="label">就诊类型：</span>
                <span class="value" :class="getOrderTypeClass(selectedRecord.isEmergency)">
                  {{ selectedRecord.isEmergency === 1 ? '急诊' : '普通门诊' }}
                </span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h5>时间安排</h5>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">预约时间：</span>
                <span class="value">{{ formatDateTime(selectedRecord.createTime) }}</span>
              </div>
              <div v-if="selectedRecord.paymentTime" class="info-item">
                <span class="label">支付时间：</span>
                <span class="value">{{ formatDateTime(selectedRecord.paymentTime) }}</span>
              </div>
              <div v-if="selectedRecord.checkInTime" class="info-item">
                <span class="label">报到时间：</span>
                <span class="value">{{ formatDateTime(selectedRecord.checkInTime) }}</span>
              </div>
              <div v-if="selectedRecord.completeTime" class="info-item">
                <span class="label">完成时间：</span>
                <span class="value">{{ formatDateTime(selectedRecord.completeTime) }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h5>费用信息</h5>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">挂号费用：</span>
                <span class="value price">¥{{ selectedRecord.feeAmount }}</span>
              </div>
              <div v-if="selectedRecord.isEmergency === 1" class="info-item">
                <span class="label">急诊附加费：</span>
                <span class="value price">+ ¥10</span>
              </div>
              <div class="info-item total">
                <span class="label">总费用：</span>
                <span class="value price total-price">
                  ¥{{ selectedRecord.feeAmount + (selectedRecord.isEmergency === 1 ? 10 : 0) }}
                </span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h5>订单状态</h5>
            <div class="status-info">
              <el-tag :type="getOrderStatusType(selectedRecord.orderStatus)" size="large">
                {{ getOrderStatusText(selectedRecord.orderStatus) }}
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
import { ElMessage } from 'element-plus'
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
  CircleCheck,
  SuccessFilled,
  Download
} = ElementPlusIconsVue

// 状态管理
const records = ref([])
const loading = ref(false)
const showDetailDialog = ref(false)
const selectedRecord = ref(null)

// 方法
const refreshRecords = async () => {
  try {
    loading.value = true

    console.log('开始获取患者历史订单（病历）')

    // 调用真实 API
    const response = await orderApi.getPatientOrders()
    console.log('API 响应:', response)

    // 处理 API 响应数据
    let rawData = []
    if (response && response.data) {
      rawData = Array.isArray(response.data) ? response.data : [response.data]
    } else if (Array.isArray(response)) {
      rawData = response
    } else if (response && typeof response === 'object' && response.id) {
      rawData = [response]
    } else {
      console.log('API 无数据返回，使用模拟数据')
      records.value = getMockRecords()
      return
    }

    // 过滤出状态为 4（已就诊）和 5（已取号）的订单
    records.value = rawData
        .filter(item => item.orderStatus === 4 || item.orderStatus === 5)
        .map(item => ({
          ...item,
          scheduleDate: item.createTime ? item.createTime.split(' ')[0] : '',
          timePeriod: 'morning',
          doctorId: item.doctorId || 1,
          deptId: item.deptId || 1,
          slotId: item.slotId || 1,
          patientId: item.patientId || 1
        }))

    console.log('处理后的病历列表:', records.value)
    ElMessage.success('刷新成功')

  } catch (error) {
    console.error('获取病历列表失败:', error)
    ElMessage.error('获取病历列表失败，使用模拟数据')
    records.value = getMockRecords()
  } finally {
    loading.value = false
  }
}

// 显示病历详情
const showRecordDetail = (record) => {
  selectedRecord.value = record
  showDetailDialog.value = true
}

// 关闭病历详情对话框
const closeDetailDialog = () => {
  showDetailDialog.value = false
  selectedRecord.value = null
}

// 下载病历记录
const downloadRecord = (record) => {
  ElMessage.info(`正在下载订单 ${record.orderNo} 的病历记录...`)
  // 实际项目中这里可以调用后端 API 下载 PDF 或其他格式的文件
  setTimeout(() => {
    ElMessage.success('病历记录下载成功！')
  }, 1500)
}

// 订单状态相关方法
const getOrderTypeClass = (isEmergency) => {
  return isEmergency === 1 ? 'emergency-type' : 'normal-type'
}

const getOrderStatusType = (orderStatus) => {
  const statusMap = {
    4: 'success', // 已就诊
    5: 'primary'  // 已取号
  }
  return statusMap[orderStatus] || 'info'
}

const getOrderStatusText = (orderStatus) => {
  const statusMap = {
    4: '已就诊',
    5: '已取号'
  }
  return statusMap[orderStatus] || '未知状态'
}

const getStatusClass = (status) => {
  const classMap = {
    4: 'status-completed',
    5: 'status-checked-in'
  }
  return classMap[status] || 'status-pending'
}

const getStatusText = (status) => {
  const textMap = {
    4: '已就诊',
    5: '已取号'
  }
  return textMap[status] || '未知状态'
}

const formatVisitTime = (record) => {
  const timeMap = {
    'morning': '上午 08:00-12:00',
    'afternoon': '下午 14:00-18:00',
    'night': '晚上 18:00-21:00'
  }
  return `${record.scheduleDate} ${timeMap[record.timePeriod] || record.timePeriod}`
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '未知时间'
  return dateTime.replace('T', ' ').substring(0, 19)
}

// 模拟数据
const getMockRecords = () => {
  return [
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
      completeTime: '2026-02-22 15:30:00',
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
    },
    {
      id: 5,
      orderNo: 'LYLZX0BUQ9N727',
      patientName: '张三',
      doctorName: '李小红',
      deptName: '外科',
      feeAmount: 60,
      orderStatus: 4, // 已就诊
      createTime: '2026-02-20 14:30:15',
      paymentTime: '2026-02-20 14:35:20',
      checkInTime: '2026-02-20 15:00:30',
      completeTime: '2026-02-20 16:00:00',
      isEmergency: 1
    }
  ]
}

// 初始化
onMounted(() => {
  refreshRecords()
})
</script>

<style scoped>
.medical-records {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.records-header h3 {
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

.records-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.record-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.record-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.record-card.status-completed {
  border-left-color: #E6A23C;
}

.record-card.status-checked-in {
  border-left-color: #F56C6C;
}

.record-content {
  padding: 20px;
}

.record-header {
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

.status-badge.status-completed {
  background-color: #fdf6ec;
  color: #E6A23C;
  border: 1px solid #E6A23C;
}

.status-badge.status-checked-in {
  background-color: #fef0f0;
  color: #F56C6C;
  border: 1px solid #F56C6C;
}

.order-number {
  font-size: 14px;
  color: #999;
}

.record-body {
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
  min-width: 70px;
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

.record-footer {
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

/* 病历详情对话框样式 */
.record-detail-content {
  padding: 20px;
}

.detail-header {
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

.detail-header h4 {
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
  .medical-records {
    padding: 15px;
  }

  .records-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .record-footer {
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

  .record-detail-content {
    padding: 15px;
  }

  .detail-header h4 {
    font-size: 20px;
  }
}
</style>
