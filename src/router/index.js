// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Doctor from '@/views/Doctor.vue'
import Patient from '@/views/Patient.vue' // 添加患者界面导入

const routes = [
  {
    path: '/',
    redirect: '/login'  // 根路径重定向到登录页
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/doctor',
    name: 'Doctor',
    component: Doctor,
    meta: { requiresAuth: true }
  },
  {
    path: '/patient',
    name: 'Patient',
    component: Patient,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('userRole')

  console.log('路由守卫检查:', {
    to: to.path,
    token: token ? '存在' : '不存在',
    userRole: userRole,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest
  })

  // 如果访问需要认证的页面但没有认证信息
  if (to.meta.requiresAuth) {
    // 检查token和userRole是否存在
    if (!token || !userRole) {
      console.log('缺少认证信息，跳转到登录页')
      next('/login')
      return
    }

    // 检查token格式是否有效
    if (token === 'undefined' || token === '[object Object]') {
      console.log('token格式无效，清除认证信息并跳转到登录页')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('userRole')
      next('/login')
      return
    }
  }

  // 如果已登录用户访问登录页
  if (to.meta.requiresGuest && token) {
    console.log('已登录用户访问登录页，根据角色跳转')
    // 根据用户角色跳转到对应页面
    switch(userRole) {
      case 'admin':
        next('/dashboard')
        break
      case 'doctor':
        next('/doctor')
        break
      case 'patient':
        next('/patient') // 患者页面暂时注释
        break
      default:
        next('/dashboard')
    }
    return
  }

  next()
})

export default router
