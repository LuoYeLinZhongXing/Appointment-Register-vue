<template>
  <div class="doctor-dashboard">
    <!-- 顶部导航栏 -->
    <el-container class="header">
      <el-header class="top-bar">
        <div class="logo-section">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <h1 class="system-title">医师工作站</h1>
        </div>

        <div class="user-info">
          <el-dropdown trigger="click" @command="handleUserCommand">
            <span class="user-avatar">
              <el-avatar :size="32" :src="doctorAvatar" />
              <span class="welcome-text">欢迎您，{{ currentUser.name }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="schedule">排班管理</el-dropdown-item>
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
            <span>工作台</span>
          </el-menu-item>

          <el-menu-item index="2" @click="goTo('schedule')">
            <el-icon><Calendar /></el-icon>
            <span>我的号源</span>
          </el-menu-item>

          <el-menu-item index="3" @click="goTo('patient')">
            <el-icon><User /></el-icon>
            <span>患者队列管理</span>
          </el-menu-item>

          <el-menu-item index="4" @click="goTo('order')">
            <el-icon><DataAnalysis /></el-icon>
            <span>我的订单</span>
          </el-menu-item>

        </el-menu>
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-main class="content-area">
        <!-- 我的号源管理 -->
        <div v-if="activeMenu === 'schedule'" class="schedule-management">
          <MySlots
              @update-my-slots="handleMySlotsUpdate"
              ref="mySlotsRef"
          />
        </div>

        <!-- 队列管理 -->
        <div v-else-if="activeMenu === 'patient'" class="patient-management">
          <QueueManagement ref="queueManagementRef" />
        </div>

        <!-- 订单管理 -->
        <div v-else-if="activeMenu === 'order'" class="order-management">
          <h2 class="section-title">我的订单列表</h2>
          <!-- 这里可以添加订单管理的具体内容 -->
          <el-card>
            <div class="order-content">
              <p>订单管理功能正在开发中...</p>
            </div>
          </el-card>
        </div>

        <!-- 默认工作台 -->
        <div v-else class="dashboard-home">
          <div class="stats-cards">
            <el-card class="stat-card" shadow="hover">
              <div class="card-content">
                <div class="icon-section">
                  <el-icon class="stat-icon"><User /></el-icon>
                </div>
                <div class="info-section">
                  <div class="stat-title">今日接诊</div>
                  <div class="stat-value">{{ stats.todayPatients }} 人次</div>
                </div>
              </div>
            </el-card>

            <el-card class="stat-card" shadow="hover">
              <div class="card-content">
                <div class="icon-section">
                  <el-icon class="stat-icon"><Calendar /></el-icon>
                </div>
                <div class="info-section">
                  <div class="stat-title">待处理预约</div>
                  <div class="stat-value">{{ stats.pendingAppointments }} 个</div>
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
                  <div class="stat-title">本周工时</div>
                  <div class="stat-value">{{ stats.weeklyHours }} 小时</div>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 医生个人信息展示 -->
          <el-card class="doctor-profile-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>我的信息</span>
              </div>
            </template>
            <div class="doctor-info">
              <div class="info-item">
                <label>姓名：</label>
                <span>{{ currentUser.name }}</span>
              </div>
              <div class="info-item">
                <label>科室：</label>
                <span>{{ currentUser.deptName || '未分配' }}</span>
              </div>
              <div class="info-item">
                <label>职称：</label>
                <span>{{ getPostText(currentUser.post) }}</span>
              </div>
              <div class="info-item">
                <label>工号：</label>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import MySlots from '@/components/doctor/MySlots.vue'
import QueueManagement from "@/components/doctor/QueueManagement.vue";

// 导入图标
const { HomeFilled, User, Calendar, DataAnalysis,Bell,VideoPlay,
  CircleCheck,Warning,List,DocumentRemove,Refresh } = ElementPlusIconsVue

// 导入图片
import doctorAvatarMale from '@/assets/images/DoctorMan.png'
import doctorAvatarFemale from '@/assets/images/DoctorWoman.png'

const router = useRouter()

// 状态管理
const activeMenu = ref('1')
const isCollapse = ref(false)
const currentUser = ref({
  name: '医生',
  post: 1,
  deptName: '',
  phone: '',
  gender: 1 // 默认男性
})
const stats = ref({
  todayPatients: 0,
  pendingAppointments: 0,
  weeklyHours: 0
})
const queueManagementRef = ref(null)

// 添加组件引用
const mySlotsRef = ref(null)

// 处理我的号源数据更新
const handleMySlotsUpdate = (slots) => {
  console.log('我的号源数据已更新:', slots)
}

// 方法
const goToHome = () => {
  activeMenu.value = '1'
}

const goTo = (path) => {
  activeMenu.value = path
}

const handleUserCommand = (command) => {
  switch(command) {
    case 'profile':
      // 处理个人资料
      ElMessage.info('个人资料功能正在开发中')
      break
    case 'schedule':
      // 跳转到排班管理
      activeMenu.value = 'schedule'
      break
    case 'logout':
      // 退出登录
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('userRole')
      router.push('/login')
      break
  }
}

const getPostText = (post) => {
  const postMap = {
    0: '普通医生',
    1: '主任医师',
    2: '副主任医师',
    3: '主治医师',
    4: '住院医师',
    5: '医士'
  }
  return postMap[post] || '未知'
}

// 初始化
onMounted(() => {
  // 从localStorage获取医生信息
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

  // 初始化统计数据（这里可以根据实际API获取数据）
  stats.value = {
    todayPatients: 12,
    pendingAppointments: 5,
    weeklyHours: 24
  }
})

// 添加获取头像路径的计算属性
const doctorAvatar = computed(() => {
  if (currentUser.value.gender === 0) {
    return doctorAvatarFemale
  } else {
    return doctorAvatarMale
  }
})

</script>

<style scoped>
/* 医生工作台整体样式 */
.doctor-dashboard {
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

/* 医生信息卡片 */
.doctor-profile-card {
  max-width: 600px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.doctor-info {
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

  .doctor-info {
    grid-template-columns: 1fr;
  }
}
</style>
