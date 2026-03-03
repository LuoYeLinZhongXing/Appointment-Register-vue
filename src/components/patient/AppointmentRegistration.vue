<template>
  <div class="appointment-registration">
    <!-- 步骤指示器 -->
    <div class="steps-container">
      <el-steps :active="currentStep" finish-status="success" simple>
        <el-step title="选择科室" />
        <el-step title="选择医生" />
        <el-step title="选择号源" />
        <el-step title="急诊确认" />
        <el-step title="订单详情" />
      </el-steps>
    </div>

    <!-- 第一步：选择科室 -->
    <div v-show="currentStep === 0" class="step-content">
      <h3 class="step-title">请选择您要就诊的科室</h3>

      <!-- 下一步按钮移到这里 -->
      <div class="step-actions top-actions">
        <el-button
          type="primary"
          @click="nextStep"
          :disabled="!selectedDept"
          size="large"
          class="next-button"
        >
          下一步：选择医生
        </el-button>
      </div>

      <div class="dept-grid">
        <el-card
            v-for="dept in departments"
            :key="dept.id"
            class="dept-card"
            :class="{ 'selected': selectedDept?.id === dept.id }"
            @click="selectDepartment(dept)"
            shadow="hover"
        >
          <div class="dept-content">
            <div class="dept-icon">
              <!-- 使用内联SVG确保图标显示 -->
              <el-icon size="32" :class="dept.type === 0 ? 'icon-clinical' : 'icon-tech'">
                <svg v-if="dept.type === 0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
                  <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"/>
                  <path d="M704 480H544V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v160H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h160v160c0 17.7 14.3 32 32 32s32-14.3 32-32V544h160c17.7 0 32-14.3 32-32s-14.3-32-32-32z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
                  <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zM320 528c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V320c0-17.7 14.3-32 32-32h48c17.7 0 32 14.3 32 32v208zm352 0c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V320c0-17.7 14.3-32 32-32h48c17.7 0 32 14.3 32 32v208z"/>
                </svg>
              </el-icon>
            </div>
            <div class="dept-info">
              <h4 class="dept-name">{{ dept.name }}</h4>
              <p class="dept-type">{{ getDeptTypeText(dept.type) }}</p>
              <p class="dept-location" v-if="dept.location">{{ dept.location }}</p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 原来的底部按钮可以保留或移除 -->
      <!-- <div class="step-actions">
        <el-button type="primary" @click="nextStep" :disabled="!selectedDept" size="large">
          下一步：选择医生
        </el-button>
      </div> -->
    </div>

    <!-- 第二步：选择医生 -->
    <div v-show="currentStep === 1" class="step-content">
      <h3 class="step-title">请选择医生</h3>

      <!-- 返回上一步按钮 -->
      <div class="back-section">
        <el-button @click="prevStep" type="primary" link>
          <el-icon><ArrowLeft /></el-icon>
          返回选择科室
        </el-button>
        <div class="selected-dept-info">
          已选择科室：<strong>{{ selectedDept?.name }}</strong>
        </div>
      </div>

      <!-- 医生列表 -->
      <div class="doctors-list">
        <div v-if="doctors.length === 0" class="no-doctors">
          <el-empty description="该科室暂无可用医生" />
        </div>

        <el-card
            v-for="doctor in doctors"
            :key="doctor.id"
            class="doctor-card"
            :class="{ 'selected': selectedDoctor?.id === doctor.id }"
            @click="selectDoctor(doctor)"
        >
          <div class="doctor-content">
            <div class="doctor-avatar">
              <el-avatar :size="60" :src="getDoctorAvatar(doctor.gender)" />
            </div>
            <div class="doctor-info">
              <h4 class="doctor-name">{{ doctor.name }}</h4>
              <p class="doctor-post">{{ getPostText(doctor.post) }}</p>
              <p class="doctor-intro" v-if="doctor.introduction">
                {{ doctor.introduction }}
              </p>
              <div class="doctor-stats">
                <span class="stat-item">
                  <el-icon><Star /></el-icon>
                  评分：4.8
                </span>
                <span class="stat-item">
                  <el-icon><User /></el-icon>
                  接诊量：{{ Math.floor(Math.random() * 1000) + 500 }}次
                </span>
              </div>

              <!-- 号源信息显示 -->
              <div v-if="selectedDoctor?.id === doctor.id && loadingSlots" class="slots-loading">
                <el-icon class="is-loading"><Loading /></el-icon>
                正在查询号源信息...
              </div>

              <div v-else-if="selectedDoctor?.id === doctor.id" class="slots-info">
                <div class="slots-header">今日号源信息：</div>
                <div class="slots-list">
                  <div
                    v-for="slot in slots.filter(s => s.doctorId === doctor.id)"
                    :key="slot.id"
                    class="slot-item"
                  >
                    <span class="time-period">{{ getTimePeriodText(slot.timePeriod) }}</span>
                    <span class="remaining">
                      剩余:
                      <el-tag :type="getSlotStatusTagType(slot)" size="small">
                        {{ slot.remainingCount }}/{{ slot.totalCount }}
                      </el-tag>
                    </span>
                    <span class="fee">¥{{ slot.feeAmount }}</span>
                    <span class="status" :class="getSlotStatusClass(slot)">
                      {{ getSlotStatusText(slot) }}
                    </span>
                  </div>
                </div>

                <!-- 如果没有有效号源显示提示 -->
                <div v-if="slots.filter(s => s.doctorId === doctor.id).length === 0" class="no-slots-debug">
                  暂无可用号源
                  <div style="font-size: 12px; color: #999; margin-top: 5px;">
                    当前有效号源数: {{ slots.filter(s => s.doctorId === doctor.id).length }}
                  </div>
                </div>
              </div>

              <div v-else-if="selectedDoctor?.id === doctor.id && slots.length === 0 && !loadingSlots" class="no-slots">
                今日暂无号源
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <div class="step-actions">
        <el-button type="primary" @click="nextStep" :disabled="!selectedDoctor" size="large">
          下一步：选择号源
        </el-button>
      </div>
    </div>

    <!-- 第三步：选择号源 -->
    <div v-show="currentStep === 2" class="step-content">
      <h3 class="step-title">请选择号源</h3>

      <div class="back-section">
        <el-button @click="prevStep" type="primary" link>
          <el-icon><ArrowLeft /></el-icon>
          返回选择医生
        </el-button>
        <div class="selected-info">
          <span>科室：<strong>{{ selectedDept?.name }}</strong></span>
          <span>医生：<strong>{{ selectedDoctor?.name }}</strong></span>
        </div>
      </div>

      <!-- 号源加载状态 -->
      <div v-if="loadingSlots" class="slots-loading-full">
        <el-skeleton animated>
          <template #template>
            <el-skeleton-item variant="p" style="width: 30%" />
            <div style="margin-top: 20px">
              <el-skeleton-item variant="rect" style="width: 100%; height: 100px; margin-bottom: 15px" />
              <el-skeleton-item variant="rect" style="width: 100%; height: 100px; margin-bottom: 15px" />
              <el-skeleton-item variant="rect" style="width: 100%; height: 100px" />
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 号源列表 -->
      <div v-else-if="slots.length > 0" class="slots-selection">
        <el-alert
          title="请选择合适的号源进行预约"
          type="info"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <div class="slots-grid">
          <el-card
            v-for="slot in slots"
            :key="slot.id"
            class="slot-card"
            :class="{ 'selected': selectedSlot?.id === slot.id }"
            @click="selectSlot(slot)"
            shadow="hover"
          >
            <div class="slot-content">
              <div class="slot-header">
                <div class="time-period-tag">
                  {{ getTimePeriodText(slot.timePeriod) }}
                </div>
                <div class="slot-status" :class="getSlotStatusClass(slot)">
                  {{ getSlotStatusText(slot) }}
                </div>
              </div>

              <div class="slot-details">
                <div class="detail-row">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatSlotTime(slot.timePeriod) }}</span>
                </div>

                <div class="detail-row">
                  <el-icon><User /></el-icon>
                  <span>剩余号源: {{ slot.remainingCount }}/{{ slot.totalCount }}</span>
                </div>

                <div class="detail-row">
                  <el-icon><PriceTag /></el-icon>
                  <span class="fee-amount">¥{{ slot.feeAmount }}</span>
                </div>

                <div v-if="slot.remarks" class="detail-row">
                  <el-icon><InfoFilled /></el-icon>
                  <span>{{ slot.remarks }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 无号源提示 -->
      <div v-else class="no-slots-available">
        <el-empty description="暂无可预约号源">
          <el-button type="primary" @click="refreshSlots">刷新号源</el-button>
        </el-empty>
      </div>

      <div class="step-actions">
        <el-button
          type="primary"
          @click="nextStep"
          :disabled="!selectedSlot"
          size="large"
        >
          下一步：是否为急诊
        </el-button>
      </div>
    </div>

    <!-- 第四步：急诊确认 -->
    <div v-show="currentStep === 3" class="step-content">
      <h3 class="step-title">是否为急诊</h3>

      <div class="back-section">
        <el-button @click="prevStep" type="primary" link>
          <el-icon><ArrowLeft /></el-icon>
          返回修改号源
        </el-button>
      </div>

      <el-card class="emergency-card">
        <div class="emergency-content">
          <div class="emergency-question">
            <el-icon class="question-icon"><QuestionFilled /></el-icon>
            <h4>本次就诊是否为急诊？</h4>
          </div>

          <div class="emergency-info">
            <p>请根据您的实际情况选择：</p>
            <ul>
              <li><strong>急诊：</strong>病情紧急，需要立即就医</li>
              <li><strong>普通门诊：</strong>非紧急情况，按预约时间就诊</li>
            </ul>
          </div>

          <div class="emergency-selection">
            <el-radio-group v-model="isEmergency" size="large">
              <el-radio :value="true" border>
                <div class="radio-content">
                  <el-icon class="emergency-icon"><Warning /></el-icon>
                  <span>急诊</span>
                </div>
              </el-radio>
              <el-radio :value="false" border>
                <div class="radio-content">
                  <el-icon class="normal-icon"><Checked /></el-icon>
                  <span>普通门诊</span>
                </div>
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 急诊说明 -->
          <div v-if="isEmergency" class="emergency-notice">
            <el-alert
              title="急诊提醒"
              type="warning"
              description="选择急诊后将优先安排就诊，可能会产生额外的急诊费用"
              show-icon
              :closable="false"
            />
          </div>
        </div>
      </el-card>

      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button
          type="success"
          @click="confirmAppointment"
          :loading="submitting"
          size="large"
        >
          确定预约
        </el-button>
      </div>
    </div>

    <!-- 第五步：订单详情 -->
    <div v-show="currentStep === 4" class="step-content">
      <h3 class="step-title">预约订单详情</h3>

      <el-card class="order-detail-card">
        <div v-if="loadingOrder" class="order-loading">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="h3" style="width: 60%; margin-bottom: 20px;" />
              <el-skeleton-item variant="p" style="width: 80%; margin-bottom: 10px;" />
              <el-skeleton-item variant="p" style="width: 70%; margin-bottom: 10px;" />
              <el-skeleton-item variant="p" style="width: 90%; margin-bottom: 10px;" />
            </template>
          </el-skeleton>
        </div>

        <div v-else-if="orderDetail" class="order-content">
          <div class="order-header">
            <el-icon class="success-icon"><SuccessFilled /></el-icon>
            <h4>预约成功！</h4>
            <p class="order-id">订单号：{{ orderDetail.orderNo }}</p>
          </div>

          <div class="order-info">
            <div class="info-section">
              <h5>基本信息</h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">患者姓名：</span>
                  <span class="value">{{ orderDetail.patientName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">就诊科室：</span>
                  <span class="value">{{ orderDetail.deptName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">主治医生：</span>
                  <span class="value">{{ orderDetail.doctorName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">就诊类型：</span>
                  <span class="value" :class="getOrderTypeClass(orderDetail.isEmergency)">
                    {{ orderDetail.isEmergency === 1 ? '急诊' : '普通门诊' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h5>时间安排</h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">预约时间：</span>
                  <span class="value">{{ formatDateTime(orderDetail.createTime) }}</span>
                </div>
                <div v-if="orderDetail.paymentTime" class="info-item">
                  <span class="label">支付时间：</span>
                  <span class="value">{{ formatDateTime(orderDetail.paymentTime) }}</span>
                </div>
                <div v-if="orderDetail.checkInTime" class="info-item">
                  <span class="label">报到时间：</span>
                  <span class="value">{{ formatDateTime(orderDetail.checkInTime) }}</span>
                </div>
                <div v-if="orderDetail.cancelTime" class="info-item">
                  <span class="label">取消时间：</span>
                  <span class="value">{{ formatDateTime(orderDetail.cancelTime) }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h5>费用信息</h5>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">挂号费用：</span>
                  <span class="value price">¥{{ orderDetail.feeAmount }}</span>
                </div>
                <div v-if="orderDetail.isEmergency === 1" class="info-item">
                  <span class="label">急诊费用：</span>
                  <span class="value price">+ ¥10</span>
                </div>
                <div class="info-item total">
                  <span class="label">总费用：</span>
                  <span class="value price total-price">
                    ¥{{ orderDetail.feeAmount + (orderDetail.isEmergency === 1 ? 10 : 0) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h5>订单状态</h5>
              <div class="status-info">
                <el-tag :type="getOrderStatusType(orderDetail.orderStatus)" size="large">
                  {{ getOrderStatusText(orderDetail.orderStatus) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="order-error">
          <el-empty description="订单信息获取失败">
            <el-button type="primary" @click="retryFetchOrder">重新获取</el-button>
          </el-empty>
        </div>
      </el-card>

      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button
          v-if="orderDetail && orderDetail.orderStatus === 1"
          type="success"
          @click="handlePayment"
          :loading="paying"
          size="large"
        >
          支付订单
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { deptApi } from '@/api/dept'
import { doctorApi } from '@/api/doctor'
import { slotApi } from '@/api/slot'
import { orderApi } from '@/api/order'

// 导入图标组件
import {
  OfficeBuilding,
  FirstAidKit,
  ArrowLeft,
  Star,
  User,
  Loading,
  Clock,
  PriceTag,
  InfoFilled,
  QuestionFilled,
  Warning,
  Checked,
  SuccessFilled
} from '@element-plus/icons-vue'

// 导入头像图片
import doctorManAvatar from '@/assets/images/DoctorMan.png'
import doctorWomanAvatar from '@/assets/images/DoctorWoman.png'

const router = useRouter()

// 状态管理
const currentStep = ref(0)
const departments = ref([])
const doctors = ref([])
const selectedDept = ref(null)
const selectedDoctor = ref(null)
const selectedSlot = ref(null)
const submitting = ref(false)

// 号源相关状态
const slots = ref([])
const loadingSlots = ref(false)

// 急诊选择状态
const isEmergency = ref(false)

// 订单相关状态
const orderDetail = ref(null)
const loadingOrder = ref(false)
const orderId = ref(null)  // 存储订单ID

// 支付状态
const paying = ref(false)

// 当前用户信息
const currentUser = ref({
  name: '患者',
  gender: 1,
  phone: ''
})

// 计算属性
const appointmentFee = computed(() => {
  return selectedSlot.value ? selectedSlot.value.feeAmount : 0
})

// 方法
const nextStep = async () => {
  if (currentStep.value === 0 && selectedDept.value) {
    // 从科室选择步骤进入医生选择步骤时，查询医生列表
    try {
      await fetchDoctorsByDept(selectedDept.value.id)
      currentStep.value++
    } catch (error) {
      ElMessage.error('获取医生列表失败，请重试')
    }
  } else if (currentStep.value === 1 && selectedDoctor.value) {
    // 从医生选择步骤进入号源选择步骤时，查询号源
    try {
      await fetchSlotsByDoctor(selectedDoctor.value.id)
      currentStep.value++
    } catch (error) {
      ElMessage.error('获取号源信息失败，请重试')
    }
  } else if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    // 重置相关选择
    if (currentStep.value === 1) {
      selectedSlot.value = null
    } else if (currentStep.value === 0) {
      selectedDoctor.value = null
      doctors.value = []
    }
  }
}

const selectDepartment = (dept) => {
  selectedDept.value = dept
  selectedDoctor.value = null
  selectedSlot.value = null
  doctors.value = []
  slots.value = []
}

const selectDoctor = (doctor) => {
  selectedDoctor.value = doctor
  selectedSlot.value = null
  slots.value = []

  // 查询号源信息
  if (doctor.id) {
    // 延迟一点执行，确保selectedDoctor已经更新
    setTimeout(() => {
      fetchSlotsByDoctor(doctor.id)
    }, 100)
  }
}

// 新增：选择号源
const selectSlot = (slot) => {
  if (slot.remainingCount > 0) {
    selectedSlot.value = slot
  } else {
    ElMessage.warning('该号源已满，请选择其他时段')
  }
}

// 新增：刷新号源
const refreshSlots = async () => {
  if (selectedDoctor.value?.id) {
    await fetchSlotsByDoctor(selectedDoctor.value.id)
  }
}

// 获取科室列表
const fetchDepartments = async () => {
  try {
    const response = await deptApi.getAllEnabled()
    departments.value = response.data || response || []
  } catch (error) {
    console.error('获取科室列表失败:', error)
    ElMessage.error('获取科室列表失败')
  }
}

// 获取科室下的医生列表
const fetchDoctorsByDept = async (deptId) => {
  try {
    const response = await doctorApi.getDoctorsByDeptId(deptId)
    console.log('API响应:', response)

    if (response && response.data) {
      doctors.value = Array.isArray(response.data) ? response.data : []
    } else if (Array.isArray(response)) {
      doctors.value = response
    } else {
      doctors.value = []
    }

    console.log('医生列表:', doctors.value)
    return doctors.value
  } catch (error) {
    console.error('获取医生列表失败:', error)
    ElMessage.error('获取医生列表失败')
    doctors.value = []
    throw error
  }
}

// 根据医生ID和日期查询号源信息 - 并获取实时库存
const fetchSlotsByDoctor = async (doctorId) => {
  try {
    loadingSlots.value = true
    const today = new Date().toISOString().split('T')[0]

    console.log('查询医生ID:', doctorId, '日期:', today)

    // 先获取号源基本信息
    const response = await slotApi.getByDoctorAndDate(doctorId, today)
    console.log('原始号源查询响应:', response)

    let slotData = []

    if (response && response.data) {
      slotData = Array.isArray(response.data) ? response.data : [response.data]
    } else if (Array.isArray(response)) {
      slotData = response
    } else {
      slotData = []
    }

    console.log('原始号源数据:', slotData)

    // 处理基本号源信息
    const basicSlots = slotData.map(slot => {
      // 处理日期格式
      let scheduleDate = slot.scheduleDate
      if (Array.isArray(slot.scheduleDate) && slot.scheduleDate.length === 3) {
        const [year, month, day] = slot.scheduleDate
        scheduleDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }

      return {
        ...slot,
        scheduleDate: scheduleDate,
        deptName: slot.deptName || selectedDept.value?.name || '未知科室',
        doctorName: slot.doctorName || selectedDoctor.value?.name || '未知医生',
        doctorPost: slot.doctorPost !== undefined ? slot.doctorPost : (selectedDoctor.value?.post || 0),
        doctorIntroduction: slot.doctorIntroduction || selectedDoctor.value?.introduction || '',
        // 临时数量信息，后续会被库存接口覆盖
        totalCount: slot.totalCount || 0,
        bookedCount: slot.bookedCount || 0,
        remainingCount: slot.remainingCount !== undefined ? slot.remainingCount : (slot.totalCount - (slot.bookedCount || 0))
      }
    })

    console.log('基础号源数据:', basicSlots)

    // 并发获取每个号源的实时库存信息
    const inventoryPromises = basicSlots.map(async (slot) => {
      try {
        console.log(`正在获取号源ID ${slot.id} 的库存信息`)
        const inventoryResponse = await slotApi.getInventoryInfo(slot.id)
        console.log(`号源ID ${slot.id} 库存响应:`, inventoryResponse)

        if (inventoryResponse && inventoryResponse.data) {
          const inventory = inventoryResponse.data
          return {
            ...slot,
            totalCount: inventory.totalCount || 0,
            bookedCount: inventory.bookedCount || 0,
            remainingCount: inventory.remainingCount !== undefined ? inventory.remainingCount : (inventory.totalCount - (inventory.bookedCount || 0)),
            status: inventory.status
          }
        }
        return slot // 如果获取失败，返回原始数据
      } catch (error) {
        console.error(`获取号源ID ${slot.id} 库存信息失败:`, error)
        return slot // 出错时返回原始数据
      }
    })

    // 等待所有库存信息获取完成
    const slotsWithInventory = await Promise.all(inventoryPromises)
    console.log('带库存信息的号源数据:', slotsWithInventory)

    // 过滤条件：只显示有效的号源（总数量大于0且有剩余）
    slots.value = slotsWithInventory.filter(slot => {
      const isValid = slot.totalCount > 0 && slot.remainingCount > 0
      console.log(`号源ID ${slot.id}: 总数=${slot.totalCount}, 已约=${slot.bookedCount}, 剩余=${slot.remainingCount}, 有效=${isValid}`)
      return isValid
    })

    console.log('最终显示的号源列表:', slots.value)
    return slots.value
  } catch (error) {
    console.error('查询号源信息失败:', error)
    ElMessage.error('查询号源信息失败')
    slots.value = []
    throw error
  } finally {
    loadingSlots.value = false
  }
}

// 时间段文本转换
const getTimePeriodText = (timePeriod) => {
  const periodMap = {
    'morning': '上午',
    'afternoon': '下午',
    'night': '晚上'
  }
  return periodMap[timePeriod] || timePeriod
}

// 新增：号源时间段格式化
const formatSlotTime = (timePeriod) => {
  const timeMap = {
    'morning': '08:00-12:00',
    'afternoon': '14:00-18:00',
    'night': '18:00-21:00'
  }
  return timeMap[timePeriod] || timePeriod
}

// 新增：号源状态类 - 基于实时库存信息
const getSlotStatusClass = (slot) => {
  if (!slot) return 'status-unavailable'

  const totalCount = slot.totalCount || 0
  const remainingCount = slot.remainingCount || 0

  // 未配置的号源
  if (totalCount === 0) {
    return 'status-unavailable'
  }

  // 基于实时库存的状态判断
  if (remainingCount === 0) return 'status-full'
  if (remainingCount <= 3) return 'status-low'
  return 'status-available'
}

// 新增：号源状态文本 - 基于实时库存信息
const getSlotStatusText = (slot) => {
  if (!slot) return '不可用'

  const totalCount = slot.totalCount || 0
  const remainingCount = slot.remainingCount || 0

  // 未配置的号源
  if (totalCount === 0) {
    return '未配置'
  }

  // 基于实时库存的状态文本
  if (remainingCount === 0) return '已满'
  if (remainingCount <= 3) return '紧张'
  return '充足'
}

// 新增：号源状态标签类型 - 基于实时库存信息
const getSlotStatusTagType = (slot) => {
  if (!slot) return 'info'

  const totalCount = slot.totalCount || 0
  const remainingCount = slot.remainingCount || 0

  // 未配置的号源
  if (totalCount === 0) return 'info'

  // 基于实时库存的标签类型
  if (remainingCount === 0) return 'danger'
  if (remainingCount <= 3) return 'warning'
  return 'success'
}

const getDeptIcon = (type) => {
  return type === 0 ? 'Medical' : 'OfficeBuilding'
}

const getDeptTypeText = (type) => {
  return type === 0 ? '临床科室' : '医技科室'
}

const getPostText = (post) => {
  return post === 0 ? '普通医生' : '科室主任'
}

const getDoctorAvatar = (gender) => {
  return gender === 0 ? doctorWomanAvatar : doctorManAvatar
}

const formatDate = (dateStr) => {
  return dateStr || '未选择'
}

const confirmAppointment = async () => {
  if (!selectedDept.value || !selectedDoctor.value || !selectedSlot.value) {
    ElMessage.warning('请选择完整的预约信息')
    return
  }

  try {
    // 计算总费用
    const baseFee = selectedSlot.value.feeAmount
    const emergencyFee = isEmergency.value ? 10 : 0
    const totalFee = baseFee + emergencyFee

    // 构建预约信息
    const appointmentInfo = `
      科室：${selectedDept.value.name}
      医生：${selectedDoctor.value.name} (${getPostText(selectedDoctor.value.post)})
      时间：${selectedSlot.value.scheduleDate} ${formatSlotTime(selectedSlot.value.timePeriod)}
      类型：${isEmergency.value ? '急诊' : '普通门诊'}
      费用：¥${baseFee}${isEmergency.value ? ' + 急诊费¥10' : ''}
      总计：¥${totalFee}
      剩余号源：${selectedSlot.value.remainingCount}/${selectedSlot.value.totalCount}
    `.trim()

    await ElMessageBox.confirm(
        `请确认以下预约信息：\n\n${appointmentInfo}`,
        '确定预约',
        {
          confirmButtonText: '确定预约',
          cancelButtonText: '取消',
          type: isEmergency.value ? 'warning' : 'info'
        }
    )

    submitting.value = true

    // 调用挂号API
    const registerData = {
      slotId: selectedSlot.value.id,
      isEmergency: isEmergency.value ? 1 : 0  // 1: 急诊, 0: 普通门诊
    }

    console.log('挂号请求数据:', registerData)

    const response = await orderApi.register(registerData)
    console.log('挂号响应:', response)

    // 检查响应结果并获取订单ID
    if (response && (response.code === 200 || response === 200 || typeof response === 'number')) {
      orderId.value = response.data || response
      ElMessage.success(`${isEmergency.value ? '急诊' : '普通门诊'}预约成功！订单号：${orderId.value}`)

      // 进入下一步（订单详情）
      currentStep.value++

      // 获取订单详情
      await fetchOrderDetail(orderId.value)
    } else {
      throw new Error('挂号失败')
    }

  } catch (error) {
    console.error('挂号失败:', error)
    ElMessage.error('预约失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 获取订单详情
const fetchOrderDetail = async (id) => {
  try {
    loadingOrder.value = true
    console.log('获取订单详情，订单ID:', id)

    const response = await orderApi.getOrderById(id)
    console.log('订单详情响应:', response)

    if (response && response.data) {
      orderDetail.value = response.data
    } else if (typeof response === 'object' && response.id) {
      orderDetail.value = response
    } else {
      throw new Error('订单详情获取失败')
    }

    console.log('订单详情:', orderDetail.value)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
    orderDetail.value = null
  } finally {
    loadingOrder.value = false
  }
}

// 重新获取订单详情
const retryFetchOrder = async () => {
  if (orderId.value) {
    await fetchOrderDetail(orderId.value)
  }
}

// 完成预约
const finishAppointment = () => {
  ElMessage.success('预约流程已完成！')
  resetForm()
  router.push('/patient')
}

// 重置表单方法
const resetForm = () => {
  currentStep.value = 0
  selectedDept.value = null
  selectedDoctor.value = null
  selectedSlot.value = null
  isEmergency.value = false
  orderId.value = null
  orderDetail.value = null
  doctors.value = []
  slots.value = []
}

// 订单状态相关方法
const getOrderTypeClass = (isEmergency) => {
  return isEmergency === 1 ? 'emergency-type' : 'normal-type'
}

const getOrderStatusType = (status) => {
  const statusMap = {
    1: 'info',    // 待支付
    2: 'success', // 已支付
    3: 'warning', // 已取消
    4: 'primary', // 已就诊
    5: 'warning'  // 已取号
  }
  return statusMap[status] || 'info'
}

const getOrderStatusText = (status) => {
  const statusMap = {
    1: '待支付',
    2: '已支付',
    3: '已取消',
    4: '已就诊',
    5: '已取号'
  }
  return statusMap[status] || '未知状态'
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '未知时间'
  // 根据实际返回的时间格式进行处理
  return dateTime.replace('T', ' ').substring(0, 19)
}

// 调试方法：手动触发号源查询
const debugFetchSlots = async () => {
  if (selectedDoctor.value?.id) {
    console.log('手动查询号源，医生ID:', selectedDoctor.value.id)
    await fetchSlotsByDoctor(selectedDoctor.value.id)
  } else {
    console.log('没有选中的医生')
  }
}

// 调试用：显示所有slots信息
const showAllSlotsDebug = () => {
  console.log('=== 所有号源调试信息 ===')
  console.log('slots数组:', slots.value)
  console.log('slots长度:', slots.value.length)
  slots.value.forEach((slot, index) => {
    console.log(`号源${index + 1}:`, {
      id: slot.id,
      doctorId: slot.doctorId,
      timePeriod: slot.timePeriod,
      totalCount: slot.totalCount,
      bookedCount: slot.bookedCount,
      remainingCount: slot.remainingCount,
      scheduleDate: slot.scheduleDate
    })
  })
}

// 新增：处理支付
const handlePayment = async () => {
  if (!orderId.value) {
    ElMessage.error('订单信息不完整')
    return
  }

  try {
    paying.value = true

    // 显示支付确认对话框
    await ElMessageBox.confirm(
        '确认支付该订单吗？',
        '支付确认',
        {
          confirmButtonText: '确认支付',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    // 调用支付API
    console.log('开始支付，订单ID:', orderId.value)
    const response = await orderApi.payOrder(orderId.value)
    console.log('支付响应:', response)

    // 检查支付结果
    if (response && (response.code === 200 || response.data === true || response === true)) {
      ElMessage.success('支付成功！')

      // 重新获取订单详情以更新状态
      await fetchOrderDetail(orderId.value)
    } else {
      throw new Error('支付失败')
    }

  } catch (error) {
    if (error !== 'cancel') {
      console.error('支付失败:', error)
      ElMessage.error('支付失败，请稍后重试')
    }
  } finally {
    paying.value = false
  }
}


// 在模板中添加调试按钮（仅用于开发）
// <el-button @click="debugFetchSlots" size="small" type="warning">调试查询号源</el-button>

// 监听医生选择变化
watch(() => selectedDoctor.value, (newVal) => {
  if (newVal && currentStep.value === 2) {
    fetchSlotsByDoctor(newVal.id)
  }
})

// 初始化
onMounted(() => {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      currentUser.value = { ...currentUser.value, ...JSON.parse(userInfo) }
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }

  fetchDepartments()
})
</script>

<style scoped>
.appointment-registration {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.steps-container {
  margin-bottom: 30px;
}

.step-content {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

/* 科室选择样式 */
.dept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.dept-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.dept-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.dept-card.selected {
  border-color: #409EFF;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.dept-content {
  display: flex;
  align-items: center;
  padding: 20px;
}

.dept-icon {
  margin-right: 15px;
  color: #409EFF;
}

.dept-info {
  flex: 1;
}

.dept-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.dept-type {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #666;
}

.dept-location {
  margin: 0;
  font-size: 12px;
  color: #999;
}

/* 医生选择样式 */
.back-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.selected-dept-info, .selected-info {
  font-size: 14px;
  color: #666;
}

.selected-info span {
  margin-right: 20px;
}

.doctors-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.doctor-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.doctor-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.doctor-card.selected {
  border-color: #67C23A;
  box-shadow: 0 0 0 3px rgba(103, 194, 58, 0.2);
}

.doctor-content {
  display: flex;
  padding: 20px;
}

.doctor-avatar {
  margin-right: 15px;
}

.doctor-info {
  flex: 1;
}

.doctor-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.doctor-post {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #409EFF;
  font-weight: 500;
}

.doctor-intro {
  margin: 0 0 15px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.doctor-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.stat-item .el-icon {
  margin-right: 4px;
  font-size: 14px;
}

/* 号源信息样式 */
.slots-loading {
  margin-top: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.slots-info {
  margin-top: 15px;
  padding: 12px;
  background-color: #f0f9ff;
  border: 1px solid #b3e0ff;
  border-radius: 6px;
}

.slots-header {
  font-weight: 600;
  color: #409EFF;
  margin-bottom: 10px;
  font-size: 14px;
}

.slots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: white;
  border-radius: 4px;
  font-size: 13px;
  border: 1px solid #e6f7ff;
}

.time-period {
  font-weight: 500;
  color: #333;
}

.remaining {
  color: #666;
}

.fee {
  font-weight: 600;
  color: #F56C6C;
}

.no-slots {
  margin-top: 15px;
  padding: 10px;
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  font-size: 13px;
  color: #d48806;
  text-align: center;
}

/* 号源选择样式 */
.slots-loading-full {
  padding: 30px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.slots-selection {
  margin-bottom: 30px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.slot-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.slot-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.slot-card.selected {
  border-color: #67C23A;
  box-shadow: 0 0 0 3px rgba(103, 194, 58, 0.2);
}

.slot-content {
  padding: 20px;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.time-period-tag {
  background-color: #409EFF;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 500;
}

.slot-status {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.slot-status.status-available {
  background-color: #f0f9ff;
  color: #409EFF;
  border: 1px solid #409EFF;
}

.slot-status.status-low {
  background-color: #fffbe6;
  color: #faad14;
  border: 1px solid #faad14;
}

.slot-status.status-full {
  background-color: #fff2f0;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
}

.slot-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.detail-row .el-icon {
  font-size: 16px;
  color: #999;
}

.fee-amount {
  color: #F56C6C;
  font-weight: 600;
  font-size: 16px;
}

.no-slots-available {
  text-align: center;
  padding: 50px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 急诊确认样式 */
.emergency-card {
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.emergency-content {
  padding: 30px;
}

.emergency-question {
  text-align: center;
  margin-bottom: 25px;
}

.question-icon {
  font-size: 48px;
  color: #409EFF;
  margin-bottom: 15px;
}

.emergency-question h4 {
  margin: 0;
  font-size: 22px;
  color: #333;
  font-weight: 600;
}

.emergency-info {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.emergency-info p {
  margin: 0 0 10px 0;
  font-weight: 500;
  color: #666;
}

.emergency-info ul {
  margin: 0;
  padding-left: 20px;
}

.emergency-info li {
  margin-bottom: 8px;
  color: #666;
}

.emergency-selection {
  text-align: center;
  margin-bottom: 25px;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.emergency-icon {
  color: #F56C6C;
  font-size: 18px;
}

.normal-icon {
  color: #67C23A;
  font-size: 18px;
}

.emergency-notice {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .appointment-registration {
    padding: 15px;
  }

  .dept-grid {
    grid-template-columns: 1fr;
  }

  .doctors-list {
    grid-template-columns: 1fr;
  }

  .back-section {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .selected-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .step-actions {
    flex-direction: column;
  }

  .info-row {
    flex-direction: column;
    gap: 5px;
  }

  .date-options {
    justify-content: center;
  }

  .slot-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .slot-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .emergency-content {
    padding: 20px;
  }

  .emergency-question h4 {
    font-size: 18px;
  }

  .emergency-selection {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
}

/* 添加图标样式 */
.icon-clinical {
  color: #409EFF; /* 蓝色 */
}

.icon-tech {
  color: #67C23A; /* 绿色 */
}
/* 订单详情样式 */
.order-detail-card {
  margin-bottom: 30px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.order-loading {
  padding: 30px;
}

.order-content {
  padding: 30px;
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

.order-error {
  text-align: center;
  padding: 50px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .order-content {
    padding: 20px;
  }

  .order-header h4 {
    font-size: 20px;
  }
}
</style>
