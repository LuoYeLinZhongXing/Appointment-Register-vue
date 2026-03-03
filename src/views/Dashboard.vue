<template>
  <div class="admin-dashboard">
    <!-- 顶部导航栏 -->
    <el-container class="header">
      <el-header class="top-bar">
        <div class="logo-section">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 class="system-title">医院预约挂号系统</h1>
        </div>

        <div class="user-info">
          <el-dropdown trigger="click" @command="handleUserCommand">
            <span class="user-avatar">
              <el-avatar :size="32" :src="adminAvatar" />
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

          <el-menu-item index="2" @click="goTo('doctor')">
            <el-icon><User /></el-icon>
            <span>医生信息管理</span>
          </el-menu-item>

          <el-menu-item index="3" @click="goTo('patient')">
            <el-icon><User /></el-icon>
            <span>患者信息管理</span>
          </el-menu-item>

          <el-menu-item index="4" @click="goTo('dept')">
            <el-icon><Calendar /></el-icon>
            <span>科室信息管理</span>
          </el-menu-item>

          <el-menu-item index="6" @click="goTo('slot')">
            <el-icon><Calendar /></el-icon>
            <span>号源信息管理</span>
          </el-menu-item>

          <el-menu-item index="5" @click="goTo('order')">
            <el-icon><DataAnalysis /></el-icon>
            <span>订单信息管理</span>
          </el-menu-item>

        </el-menu>
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-main class="content-area">
        <!-- 使用医生管理组件 -->
        <DoctorManagement
          v-if="activeMenu === 'doctor'"
          :dept-map="deptMap"
          @update-doctors="handleDoctorsUpdate"
          ref="doctorManagementRef"
        />

        <!-- 使用患者管理组件 - 添加这部分 -->
        <PatientManagement
          v-else-if="activeMenu === 'patient'"
          @update-patients="handlePatientsUpdate"
          ref="patientManagementRef"
        />

        <!-- 使用科室管理组件 -->
        <DeptManagement
            v-else-if="activeMenu === 'dept'"
            @update-depts="handleDeptsUpdate"
            ref="deptManagementRef"
        />

        <!-- 使用号源管理组件 -->
        <SlotManagement
          v-else-if="activeMenu === 'slot'"
          :dept-map="deptMap"
          @update-slots="handleSlotsUpdate"
          ref="slotManagementRef"
        />

        <!-- 使用订单管理组件 -->
        <OrderManagement
          v-else-if="activeMenu === 'order'"
          :dept-map="deptMap"
          @update-orders="handleOrdersUpdate"
          ref="orderManagementRef"
        />

        <!-- 原有的统计卡片区域 -->
        <div v-else class="stats-cards">
          <el-card class="stat-card" shadow="hover">
            <div class="card-content">
              <div class="icon-section">
                <el-icon class="stat-icon"><User /></el-icon>
              </div>
              <div class="info-section">
                <div class="stat-title">就诊概况</div>
                <div class="stat-value">今天预约挂号总人数：{{ stats.appointmentCount }}</div>
              </div>
            </div>
          </el-card>

          <el-card class="stat-card" shadow="hover">
            <div class="card-content">
              <div class="icon-section">
                <el-icon class="stat-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="6" width="16" height="12" rx="2" ry="2"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                  </svg>
                </el-icon>
              </div>
              <div class="info-section">
                <div class="stat-title">住院概况</div>
                <div class="stat-value">今天住院总人数：{{ stats.hospitalizationCount }}</div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 插画区域 - 仅在非编辑模式且不在医生、患者、科室列表时显示 -->
        <div v-if="activeMenu !== 'doctor' && activeMenu !== 'patient' && activeMenu !== 'dept' && activeMenu !== 'slot' && activeMenu !== 'order'" class="illustration-section">
          <div class="illustration-container">
            <div class="vet-illustration">
              <div class="staff-group">
                <div class="staff-member">
                  <div class="staff-avatar"></div>
                  <div class="staff-name">护士</div>
                </div>
                <div class="staff-member">
                  <div class="staff-avatar"></div>
                  <div class="staff-name">医生</div>
                </div>
                <div class="staff-member">
                  <div class="staff-avatar"></div>
                  <div class="staff-name">兽医</div>
                </div>
              </div>
              <div class="desk">
                <div class="desk-top"></div>
                <div class="desk-legs"></div>
              </div>
              <div class="pets">
                <div class="pet cat"></div>
                <div class="pet dog"></div>
              </div>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { doctorApi } from '@/api/doctor'
import { deptApi } from '@/api/dept'
import DoctorManagement from '@/components/admin/DoctorManagement.vue'
import PatientManagement from '@/components/admin/PatientManagement.vue'
import DeptManagement from '@/components/admin/DeptManagement.vue'
import SlotManagement from '@/components/admin/SlotManagement.vue'
import OrderManagement from '@/components/admin/OrderManagement.vue' // 添加订单管理组件导入


// 导入图片
import adminAvatar from '@/assets/images/Admin.png'

const {
  HomeFilled,
  User,
  Calendar,
  DataAnalysis
} = ElementPlusIconsVue

const MedicineBox = ElementPlusIconsVue.MedicineBoxLine || ElementPlusIconsVue.MedicineBoxFilled || ElementPlusIconsVue.MedicineBox
const Bed = ElementPlusIconsVue.BedLine || ElementPlusIconsVue.BedFilled || ElementPlusIconsVue.Bed

const router = useRouter()

// 状态管理
const activeMenu = ref('1')
const isCollapse = ref(false)
const currentUser = ref({
  name: 'admin',
  role: '管理员'
})
const stats = ref({
  appointmentCount: 1,
  hospitalizationCount: 0
})

// 科室缓存 - 存储所有科室ID和名称的映射
const deptMap = ref(new Map())

// 添加组件引用
const doctorManagementRef = ref(null)
const patientManagementRef = ref(null)
const deptManagementRef = ref(null)
const slotManagementRef = ref(null)
const orderManagementRef = ref(null) // 添加订单管理组件引用

// 处理医生数据更新
const handleDoctorsUpdate = (doctors) => {
  console.log('医生数据已更新:', doctors)
}

// 处理患者数据更新
const handlePatientsUpdate = (patients) => {
  console.log('患者数据已更新:', patients)
}

// 处理科室数据更新 - 添加这行
const handleDeptsUpdate = (depts) => {
  console.log('科室数据已更新:', depts)
}

// 处理号源数据更新 - 添加这行
const handleSlotsUpdate = (slots) => {
  console.log('号源数据已更新:', slots)
}

// 添加订单数据更新处理
const handleOrdersUpdate = (orders) => {
  console.log('订单数据已更新:', orders)
}

// 方法
const goToHome = () => {
  activeMenu.value = '1'
}

const goTo = (path) => {
  activeMenu.value = path
  // 如果进入医生管理页面，确保显示医生列表
  if (path === 'doctor' && doctorManagementRef.value) {
    doctorManagementRef.value.fetchDoctors()
  }
  // 如果进入患者管理页面，确保显示患者列表
  if (path === 'patient' && patientManagementRef.value) {
    patientManagementRef.value.fetchPatients()
  }
  // 如果进入科室管理页面，确保显示科室列表
  if (path === 'dept' && deptManagementRef.value) {
    deptManagementRef.value.fetchDepts()
  }
  // 如果进入号源管理页面，确保显示号源列表
  if (path === 'slot' && slotManagementRef.value) {
    slotManagementRef.value.fetchSlots()
  }
  // 如果进入订单管理页面，确保显示订单列表
  if (path === 'order' && orderManagementRef.value) {
    orderManagementRef.value.fetchOrders()
  }
  // 如果离开医生管理页面，重置编辑状态
  if (path !== 'doctor' && doctorManagementRef.value) {
    doctorManagementRef.value.isEditing = false
    doctorManagementRef.value.currentEditingDoctor = null
  }
  // 如果离开患者管理页面，重置编辑状态
  if (path !== 'patient' && patientManagementRef.value) {
    patientManagementRef.value.isEditing = false
    patientManagementRef.value.currentEditingPatient = null
  }
  // 如果离开科室管理页面，重置编辑状态
  if (path !== 'dept' && deptManagementRef.value) {
    deptManagementRef.value.isEditing = false
    deptManagementRef.value.isAdding = false
    deptManagementRef.value.currentEditingDept = null
    deptManagementRef.value.newDept = {
      name: '',
      type: 1,
      location: '',
      description: '',
      directorId: null,
      status: 1
    }
  }
  // 如果离开号源管理页面，重置状态
  if (path !== 'slot' && slotManagementRef.value) {
    slotManagementRef.value.isAdding = false
  }
}

const handleUserCommand = (command) => {
  switch(command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('userRole')
      router.push('/login')
      break
  }
}

// 获取所有科室信息
const fetchAllDepts = async () => {
  try {
    const response = await deptApi.getAllIdAndName()
    console.log('科室API原始响应:', response)

    // 清空现有缓存
    deptMap.value.clear()

    // 正确处理API响应格式
    if (response && response.data && Array.isArray(response.data)) {
      response.data.forEach((item) => {
        const id = item.id
        const name = item.name
        if (id !== undefined && name) {
          deptMap.value.set(id, name)
        }
      })
    }
  } catch (error) {
    console.error('获取科室信息失败:', error)
    ElMessage.error('获取科室信息失败')
  }
}

// 在onMounted中添加用户角色检查和初始化
onMounted(() => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  console.log('Dashboard挂载时的认证信息:')
  console.log('token:', token)
  console.log('userRole:', userRole)
  console.log('token类型:', typeof token)
  console.log('token长度:', token ? token.length : 'null')

  // 检查基本的登录状态
  if (!token || !userRole) {
    console.log('用户未登录，跳转到登录页')
    router.push('/login')
    return
  }

  // 检查token是否为有效字符串
  if (token === 'undefined' || token === '[object Object]') {
    console.log('token格式无效，清除认证信息并跳转到登录页')
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userRole')
    router.push('/login')
    return
  }

  // 从localStorage获取登录用户的姓名
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const parsedInfo = JSON.parse(userInfo)
      currentUser.value.name = parsedInfo.name || 'admin'
      currentUser.value.role = parsedInfo.role || '管理员'
    } catch (e) {
      console.error('解析用户信息失败:', e)
    }
  }

  // 初始化科室数据
  fetchAllDepts()
})


</script>

<style scoped>
/* 修改 admin-dashboard 样式，确保高度正确 */
.admin-dashboard {
  height: 100vh;
  overflow: hidden;
}

/* 修改 el-main 样式，让内容区域自适应 */
.el-main {
  padding: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  height: calc(100vh - 60px); /* 减去顶部导航栏高度 */
  overflow-y: auto; /* 添加滚动条 */
}

/* 修改 content-area 样式 */
.content-area {
  padding: 10px 0;
  background-color: #f5f7fa;
  margin: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 确保医生管理组件和统计卡片占满可用空间 */
.doctor-management, .stats-cards {
  flex: 1;
  min-height: 0;
}

/* 修复分页容器样式 */
.pagination-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  flex-shrink: 0; /* 防止分页被压缩 */
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

.admin-text {
  font-size: 24px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #4facfe 0%, #00f2d1 100%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.welcome-text {
  font-size: 14px;
  color: white;
}

/* 左侧菜单栏样式 */
.sidebar {
  background-color: #2d3a4b;
  border-right: 1px solid #3a4a5e;
}

.sidebar-menu {
  border-right: none;
  height: 100%; /* 这行确保了菜单高度自适应 */
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  padding-left: 20px;
  padding-right: 20px;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  font-weight: normal;
}

/* 主内容区域样式 - 减少内边距让列表更贴近边缘 */
.el-main {
  padding: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.content-area {
  padding: 10px 0;
  background-color: #f5f7fa;
  margin: 0;
}

/* 查询卡片样式 - 减少外边距 */
.search-card {
  margin-bottom: 15px; /* 从原来的 20px 减少到 15px */
  background-color: #ffffff;
  text-align: left; /* 关键：在这里设置 */
}

/* 让表格充分利用容器宽度 */
.el-table {
  width: calc(100% + 20px) !important;
  margin-left: -10px;
  margin-right: -10px;
}

.content-area {
  padding: 10px 0;
  background-color: #f5f7fa;
}

/* 移除表格的默认外边距 */
.el-table {
  margin: 0;
}

/* 让查询卡片也充分利用宽度 */
.search-card {
  margin-bottom: 15px;
  background-color: #ffffff;
  width: 100%;
}

/* 确保表格容器没有额外的内边距 */
.content-area > .el-card,
.content-area > .el-table {
  width: 100%;
}

/* 分页容器样式 - 减少顶部边距 */
.pagination-container {
  margin-top: 15px; /* 从原来的 20px 减少到 15px */
  display: flex;
  justify-content: center;
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

/* 修复分页文本显示问题 */
.pagination-container :deep(.el-pagination__total) {
  font-size: 14px;
  color: #606266;
}

.pagination-container :deep(.el-pagination__jump) {
  font-size: 14px;
  color: #606266;
}

/* 统计卡片样式 - 修改为图片中的青绿色 */
.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  flex: 1;
  min-width: 0;
  background-color: #4db6ac; /* 图片中的青绿色 */
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 24px;
  height: 100%;
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
  font-size: 18px;
  font-weight: 600;
  color: white;
}

/* 插画区域样式 - 使用CSS绘制医护人员和宠物场景 */
.illustration-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  margin-top: 20px;
}

.illustration-container {
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.vet-illustration {
  position: relative;
  width: 100%;
  height: 300px;
  background-color: #fff9f9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.staff-group {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.staff-member {
  text-align: center;
}

.staff-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2d1 100%);
  border-radius: 50%;
  margin: 0 auto 10px;
  position: relative;
}

.staff-avatar::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
}

.staff-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.desk {
  position: relative;
  width: 400px;
  height: 120px;
  margin: 0 auto 20px;
}

.desk-top {
  width: 100%;
  height: 20px;
  background: #f9d5b2;
  border-radius: 4px;
  position: absolute;
  top: 0;
  left: 0;
}

.desk-legs {
  position: absolute;
  top: 20px;
  width: 100%;
  height: 100%;
}

.desk-legs::before,
.desk-legs::after {
  content: "";
  position: absolute;
  width: 12px;
  height: 80px;
  background: #d4b89c;
  border-radius: 4px;
}

.desk-legs::before {
  left: 40px;
}

.desk-legs::after {
  right: 40px;
}

.pets {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.pet {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  position: relative;
}

.cat {
  background: #f5e6d3;
}

.cat::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 10px;
  width: 12px;
  height: 12px;
  background: #f5e6d3;
  border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
  transform: rotate(45deg);
}

.cat::after {
  content: "";
  position: absolute;
  top: -10px;
  right: 10px;
  width: 12px;
  height: 12px;
  background: #f5e6d3;
  border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
  transform: rotate(-45deg);
}

.dog {
  background: #c9c9c9;
}

.dog::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 15px;
  width: 10px;
  height: 10px;
  background: #c9c9c9;
  border-radius: 50%;
}

.dog::after {
  content: "";
  position: absolute;
  top: -10px;
  right: 15px;
  width: 10px;
  height: 10px;
  background: #c9c9c9;
  border-radius: 50%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-cards {
    flex-direction: column;
  }

  .top-bar {
    padding: 0 12px;
  }

  .logo-section {
    gap: 8px;
  }

  .system-title {
    font-size: 16px;
  }

  .user-info {
    gap: 8px;
  }

  .welcome-text {
    display: none;
  }
}

.search-card {
  margin-bottom: 15px;
  background-color: #ffffff;
}

.search-card :deep(.el-card__body) {
  padding: 20px;
}

/* 医生信息列表标题字体加大 */
.section-title {
  margin-bottom: 20px;
  font-size: 24px; /* 从 20px 增加到 24px */
  font-weight: 600;
  color: #333;
}

/* 表格字体加大 */
.el-table {
  font-size: 14px; /* 增加表格字体大小 */
}

.el-table th,
.el-table td {
  font-size: 14px;
  padding: 12px 8px; /* 调整单元格内边距 */
}

/* 让查询条件真正靠左显示 */
.search-card :deep(.el-form) {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: flex-start;
  text-align: left;
}

.search-card :deep(.el-form-item) {
  margin-right: 2px;
  flex-shrink: 0;
  text-align: left;
}

.search-card :deep(.el-form-item:last-child) {
  margin-right: 0;
}

/* 查询按钮保持在同一行 */
.search-card :deep(.el-form-item:last-child) {
  display: flex;
  align-items: flex-end;
}
/* 编辑表单样式 */
.edit-card {
  margin-bottom: 20px;
}

.edit-form {
  padding: 20px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.edit-card :deep(.el-card__body) {
  padding: 0;
}

/* 确保表单元素间距合理 */
.edit-form .el-form-item {
  margin-bottom: 22px;
}
</style>
