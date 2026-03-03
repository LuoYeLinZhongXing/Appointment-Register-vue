<template>
  <div class="patient-dashboard">
    <!-- 顶部导航栏 -->
    <el-container class="header">
      <el-header class="top-bar">
        <div class="logo-section">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 class="system-title">患者服务平台</h1>
        </div>

        <div class="user-info">
          <el-dropdown trigger="click" @command="handleUserCommand">
            <span class="user-avatar">
              <el-avatar :size="32" :src="patientAvatar" />
              <span class="welcome-text">欢迎您，{{ currentUser.name }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="settings">系统设置</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
    </el-container>

    <!-- 主体内容 -->
    <el-container class="main-content">
      <!-- 左侧菜单栏 -->
      <el-aside width="200px" class="sidebar">
        <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            mode="vertical"
            background-color="#2d3a4b"
            text-color="#fff"
            active-text-color="#409EFF"
            :collapse="isCollapse"
        >
          <el-menu-item index="1" @click="goToHome">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-menu-item index="2" @click="goTo('appointment')">
            <el-icon><Calendar /></el-icon>
            <span>预约挂号</span>
          </el-menu-item>

          <el-menu-item index="3" @click="goTo('my-orders')">
            <el-icon><DataAnalysis /></el-icon>
            <span>我的预约</span>
          </el-menu-item>

          <el-menu-item index="4" @click="goTo('medical-record')">
            <el-icon><Document /></el-icon>
            <span>病历记录</span>
          </el-menu-item>

          <el-menu-item index="5" @click="goTo('queue-status')">
            <el-icon><List /></el-icon>
            <span>排队状态</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-main class="content-area">
        <!-- 预约挂号 -->
        <div v-if="activeMenu === 'appointment'" class="appointment-section">
          <h2 class="section-title">预约挂号</h2>
          <!-- 使用预约挂号组件 -->
          <AppointmentRegistration />
        </div>

        <!-- 我的预约 -->
        <div v-else-if="activeMenu === 'my-orders'" class="my-orders-section">
          <h2 class="section-title">我的预约</h2>
          <!-- 使用我的预约组件 -->
          <MyAppointments />
        </div>

        <!-- 病历记录 -->
        <div v-else-if="activeMenu === 'medical-record'" class="medical-record-section">
          <h2 class="section-title">病历记录</h2>
          <el-card>
            <div class="medical-record-content">
              <p>病历记录功能正在开发中...</p>
            </div>
          </el-card>
        </div>

        <!-- 排队状态 -->
        <div v-else-if="activeMenu === 'queue-status'" class="queue-status-section">
          <h2 class="section-title">排队状态</h2>
          <!-- 使用排队状态组件，传递查询函数 -->
          <QueueStatus
            :get-patient-by-id="getPatientById"
            :get-doctor-by-id="getDoctorById"
            :get-dept-by-id="getDeptById"
          />
        </div>

        <!-- 默认首页 -->
        <div v-else class="dashboard-home">
          <div class="stats-cards">
            <el-card class="stat-card" shadow="hover">
              <div class="card-content">
                <div class="icon-section">
                  <el-icon class="stat-icon"><Calendar /></el-icon>
                </div>
                <div class="info-section">
                  <div class="stat-title">今日预约</div>
                  <div class="stat-value">{{ stats.todayAppointments }} 个</div>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card" shadow="hover">
              <div class="card-content">
                <div class="icon-section">
                  <el-icon class="stat-icon"><User /></el-icon>
                </div>
                <div class="info-section">
                  <div class="stat-title">待就诊</div>
                  <div class="stat-value">{{ stats.pendingVisits }} 个</div>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card" shadow="hover">
              <div class="card-content">
                <div class="icon-section">
                  <el-icon class="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </el-icon>
                </div>
                <div class="info-section">
                  <div class="stat-title">历史就诊</div>
                  <div class="stat-value">{{ stats.historyVisits }} 次</div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 患者个人信息展示 -->
          <el-card class="patient-profile-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>我的信息</span>
              </div>
            </template>
            <div class="patient-info">
              <div class="info-item">
                <label>姓名：</label>
                <span>{{ currentUser.name }}</span>
              </div>
              <div class="info-item">
                <label>性别：</label>
                <span>{{ getGenderText(currentUser.gender) }}</span>
              </div>
              <div class="info-item">
                <label>年龄：</label>
                <span>{{ currentUser.age || '未填写' }}</span>
              </div>
              <div class="info-item">
                <label>手机号：</label>
                <span>{{ currentUser.phone }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入组件
import AppointmentRegistration from '@/components/patient/AppointmentRegistration.vue'
import MyAppointments from '@/components/patient/MyAppointments.vue'
import QueueStatus from '@/components/patient/QueueStatus.vue'  // 导入排队状态组件

// 导入API
import { patientApi } from '@/api/patient'
import { doctorApi } from '@/api/doctor'
import { deptApi } from '@/api/dept'

// 导入图标
const {
  HomeFilled,
  User,
  Calendar,
  DataAnalysis,
  Document,
  List
} = ElementPlusIconsVue

// 导入图片
import patientManAvatar from '@/assets/images/PatientMan.png'
import patientWomanAvatar from '@/assets/images/PatientWoman.png'

const router = useRouter()
const route = useRoute()

// 状态管理
const activeMenu = ref('1')
const isCollapse = ref(false)
const currentUser = ref({
  name: '患者',
  gender: 1,
  age: '',
  phone: ''
})
const stats = ref({
  todayAppointments: 0,
  pendingVisits: 0,
  historyVisits: 0
})

// 添加缓存映射，避免重复请求
const patientCache = ref(new Map())
const doctorCache = ref(new Map())
const deptCache = ref(new Map())

// 根据ID获取患者信息
const getPatientById = async (patientId) => {
  if (!patientId) return null

  // 先从缓存查找
  if (patientCache.value.has(patientId)) {
    return patientCache.value.get(patientId)
  }

  try {
    const response = await patientApi.getById(patientId)
    if (response && response.data) {
      const patientInfo = response.data
      patientCache.value.set(patientId, patientInfo)
      return patientInfo
    }
  } catch (error) {
    console.error('获取患者信息失败:', error)
  }
  return null
}

// 根据ID获取医生信息
const getDoctorById = async (doctorId) => {
  if (!doctorId) return null

  // 先从缓存查找
  if (doctorCache.value.has(doctorId)) {
    return doctorCache.value.get(doctorId)
  }

  try {
    const response = await doctorApi.getById(doctorId)
    if (response && response.data) {
      const doctorInfo = response.data
      doctorCache.value.set(doctorId, doctorInfo)
      return doctorInfo
    }
  } catch (error) {
    console.error('获取医生信息失败:', error)
  }
  return null
}

// 根据ID获取科室信息
const getDeptById = async (deptId) => {
  if (!deptId) return null

  // 先从缓存查找
  if (deptCache.value.has(deptId)) {
    return deptCache.value.get(deptId)
  }

  try {
    const response = await deptApi.getById(deptId)
    if (response && response.data) {
      const deptInfo = response.data
      deptCache.value.set(deptId, deptInfo)
      return deptInfo
    }
  } catch (error) {
    console.error('获取科室信息失败:', error)
  }
  return null
}

// 添加计算属性：根据性别选择不同的头像
const patientAvatar = computed(() => {
  if (currentUser.value.gender === 0) {
    return patientWomanAvatar
  } else {
    return patientManAvatar
  }
})

// 方法
const goToHome = () => {
  activeMenu.value = '1'
}

const goTo = (path) => {
  console.log('跳转到:', path)
  activeMenu.value = path
  console.log('当前菜单:', activeMenu.value)
}

const handleUserCommand = (command) => {
  switch(command) {
    case 'profile':
      ElMessage.info('个人资料功能正在开发中')
      break
    case 'settings':
      ElMessage.info('系统设置功能正在开发中')
      break
    case 'logout':
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('userRole')
      router.push('/login')
      break
  }
}

const getGenderText = (gender) => {
  return gender === 0 ? '女' : '男'
}

// 初始化
onMounted(() => {
  // 从localStorage获取患者信息
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const parsedInfo = JSON.parse(userInfo)
      currentUser.value = {
        ...currentUser.value,
        ...parsedInfo
      }
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }

  // 初始化统计数据
  stats.value = {
    todayAppointments: 2,
    pendingVisits: 1,
    historyVisits: 5
  }
})

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/appointment') {
      activeMenu.value = '2'
    } else if (newPath === '/my-orders') {
      activeMenu.value = '3'
    } else if (newPath === '/medical-record') {
      activeMenu.value = '4'
    } else if (newPath === '/queue-status') {
      activeMenu.value = '5'
    } else {
      activeMenu.value = '1'
    }
  },
  { immediate: true }
)

</script>

<style scoped>
/* 患者工作台整体样式 */
.patient-dashboard {
  height: 100vh;
  overflow: hidden;
}

/* 顶部导航栏样式 */
.header {
  height: 60px;
  background-color: #3a7bd5;
  color: white;
}

.top-bar {
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 !important;
  background-color: #3a7bd5;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: white;
}

.system-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.welcome-text {
  font-size: 14px;
  color: white;
}

/* 主体内容区域 */
.main-content {
  height: calc(100vh - 60px);
}

/* 左侧菜单栏 */
.sidebar {
  background-color: #2d3a4b;
  border-right: 1px solid #3a4a5e;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  padding-left: 20px;
}

/* 右侧内容区域 */
.content-area {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
  overflow-y: auto;
}

/* 标题样式 */
.section-title {
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #4db6ac;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 24px;
}

.icon-section {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.stat-icon {
  font-size: 32px;
  color: white;
}

.info-section {
  flex: 1;
}

.stat-title {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: white;
}

/* 患者信息卡片 */
.patient-profile-card {
  max-width: 600px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.patient-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #666;
  margin-right: 10px;
  min-width: 60px;
}

.info-item span {
  color: #333;
}

/* 各功能区域内容样式 */
.appointment-content,
.my-orders-content,
.medical-record-content,
.queue-status-content {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    padding: 0 15px;
  }

  .system-title {
    font-size: 18px;
  }

  .content-area {
    padding: 15px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .patient-info {
    grid-template-columns: 1fr;
  }
}
</style>
