// @ts-nocheck
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const http = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  response => {
    console.log('HTTP拦截器收到响应:', response)
    console.log('返回response.data:', response.data)
    return response.data  // 这应该返回 {token: "...", admin: {...}}
  },
  error => {
    // 处理401未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('userRole')
      // 跳转到登录页面
      window.location.href = '/login'
      ElMessage.error('登录已过期，请重新登录')
    } 
    // 处理500服务器内部错误
    else if (error.response && error.response.status === 500) {
      const errorMessage = error.response.data?.msg || error.response.data?.message || '服务器内部错误'
      ElMessageBox.alert(errorMessage, '服务器错误', {
        confirmButtonText: '确定',
        type: 'error',
        dangerouslyUseHTMLString: false
      })
    }
    // 处理其他错误
    else {
      ElMessage.error('网络请求失败')
    }
    return Promise.reject(error)
  }
)

export default http
