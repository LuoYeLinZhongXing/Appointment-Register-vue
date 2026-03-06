<!-- src/views/Login.vue -->
<template>
  <div class="app-wrapper">
    <div class="background-pattern"></div>

    <div class="login-container">
      <!-- 角色切换按钮 -->
      <div class="role-switcher" @click="toggleRoleMenu">

      </div>

      <!-- 角色选择菜单 -->
      <div class="role-menu" :class="{ show: showRoleMenu }">
        <button
            class="role-btn"
            :class="{ active: currentRole === 'patient' }"
            @click="switchRole('patient')"
            :disabled="currentRole === 'patient'"
        >
          <div class="role-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <span>患者</span>
        </button>

        <button
            class="role-btn"
            :class="{ active: currentRole === 'doctor' }"
            @click="switchRole('doctor')"
            :disabled="currentRole === 'doctor'"
        >
          <div class="role-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <span>医生</span>
        </button>

        <button
            class="role-btn"
            :class="{ active: currentRole === 'admin' }"
            @click="switchRole('admin')"
            :disabled="currentRole === 'admin'"
        >
          <div class="role-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
          </div>
          <span>管理员</span>
        </button>
      </div>

      <div class="login-header">
        <!-- 实时时间显示 -->
        <div class="real-time">
          {{ currentTime }}
        </div>

        <div class="hospital-icon">
          <img
              :src="loginImage"
              :alt="roleTitles[currentRole]"
              class="role-image"
          >
        </div>
        <h1>医院预约挂号系统</h1>
        <p>{{ roleTitles[currentRole] }}</p>
      </div>

      <!-- 可滚动的表单容器 -->
      <div class="form-scroll-container">
        <!-- 登录表单 -->
        <form v-if="!showForgotPasswordForm && !showRegisterForm" class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label :for="`login-${currentRole}-username`">{{ rolePlaceholders[currentRole].username }}</label>
            <input
                :id="`login-${currentRole}-username`"
                type="text"
                v-model="formData.username"
                :placeholder="rolePlaceholders[currentRole].usernamePlaceholder"
                required
            >
          </div>

          <div class="form-group">
            <label for="login-password">密码</label>
            <input
                type="password"
                id="login-password"
                v-model="formData.password"
                placeholder="请输入密码"
                required
            >
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            {{ loading ? '登录中...' : `${roleTitles[currentRole]}登录` }}
          </button>
        </form>

        <!-- 忘记密码表单 -->
        <form v-else-if="showForgotPasswordForm" class="login-form forgot-password-form" @submit.prevent="handleForgotPassword">
          <div class="form-group">
            <label for="forgot-phone">手机号</label>
            <input
                type="tel"
                id="forgot-phone"
                v-model="forgotPasswordForm.phone"
                placeholder="请输入注册时的手机号"
                required
            >
          </div>

          <div class="form-group">
            <label for="forgot-new-password">新密码</label>
            <input
                type="password"
                id="forgot-new-password"
                v-model="forgotPasswordForm.newPassword"
                placeholder="请输入新密码"
                required
            >
          </div>

          <div class="form-group">
            <label for="forgot-confirm-password">确认新密码</label>
            <input
                type="password"
                id="forgot-confirm-password"
                v-model="forgotPasswordForm.confirmPassword"
                placeholder="请再次输入新密码"
                required
            >
          </div>

          <div v-if="passwordMismatch" class="password-error">
            两次输入的密码不一致
          </div>

          <button type="submit" class="login-btn" :disabled="forgotPasswordLoading || passwordMismatch">
            {{ forgotPasswordLoading ? '重置中...' : '重置密码' }}
          </button>

          <div class="back-to-login">
            <a href="#" @click.prevent="showForgotPasswordForm = false">← 返回登录</a>
          </div>
        </form>

        <!-- 注册表单 -->
        <form v-else class="login-form register-form" @submit.prevent="handleRegister">
          <!-- 患者注册表单 -->
          <template v-if="currentRole === 'patient'">
            <div class="form-row">
              <div class="form-group half">
                <label for="patient-name">姓名 *</label>
                <input
                    type="text"
                    id="patient-name"
                    v-model="registerForm.patient.name"
                    placeholder="请输入真实姓名"
                    required
                >
              </div>
              <div class="form-group half">
                <label for="patient-gender">性别 *</label>
                <select
                    id="patient-gender"
                    v-model="registerForm.patient.gender"
                    class="custom-select"
                    required
                >
                  <option value="" disabled selected>请选择性别</option>
                  <option value="1">男</option>
                  <option value="0">女</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="patient-phone">手机号 *</label>
              <input
                  type="tel"
                  id="patient-phone"
                  v-model="registerForm.patient.phone"
                  placeholder="请输入手机号"
                  required
              >
            </div>

            <div class="form-group">
              <label for="patient-card">身份证号 *</label>
              <input
                  type="text"
                  id="patient-card"
                  v-model="registerForm.patient.card"
                  placeholder="请输入身份证号码"
                  required
              >
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="patient-password">密码 *</label>
                <input
                    type="password"
                    id="patient-password"
                    v-model="registerForm.patient.password"
                    placeholder="请输入密码"
                    required
                >
              </div>
              <div class="form-group half">
                <label for="patient-confirm-password">确认密码 *</label>
                <input
                    type="password"
                    id="patient-confirm-password"
                    v-model="registerForm.patient.confirmPassword"
                    placeholder="请再次输入密码"
                    required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="patient-email">邮箱地址</label>
              <input
                  type="email"
                  id="patient-email"
                  v-model="registerForm.patient.email"
                  placeholder="请输入邮箱地址（可选）"
              >
            </div>

            <div class="form-group">
              <label for="patient-address">联系地址</label>
              <textarea
                  id="patient-address"
                  v-model="registerForm.patient.address"
                  placeholder="请输入联系地址（可选）"
                  rows="3"
                  class="custom-textarea"
              ></textarea>
            </div>
          </template>

          <!-- 医生注册表单 -->
          <template v-else-if="currentRole === 'doctor'">
            <div class="form-row">
              <div class="form-group half">
                <label for="doctor-name">姓名 *</label>
                <input
                    type="text"
                    id="doctor-name"
                    v-model="registerForm.doctor.name"
                    placeholder="请输入真实姓名"
                    required
                >
              </div>
              <div class="form-group half">
                <label for="doctor-gender">性别 *</label>
                <select
                    id="doctor-gender"
                    v-model="registerForm.doctor.gender"
                    class="custom-select"
                    required
                >
                  <option value="" disabled selected>请选择性别</option>
                  <option value="1">男</option>
                  <option value="0">女</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="doctor-phone">手机号 *</label>
              <input
                  type="tel"
                  id="doctor-phone"
                  v-model="registerForm.doctor.phone"
                  placeholder="请输入手机号"
                  required
              >
            </div>

            <div class="form-group">
              <label for="doctor-card">身份证号 *</label>
              <input
                  type="text"
                  id="doctor-card"
                  v-model="registerForm.doctor.card"
                  placeholder="请输入身份证号码"
                  required
              >
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="doctor-password">密码 *</label>
                <input
                    type="password"
                    id="doctor-password"
                    v-model="registerForm.doctor.password"
                    placeholder="请输入密码"
                    required
                >
              </div>
              <div class="form-group half">
                <label for="doctor-confirm-password">确认密码 *</label>
                <input
                    type="password"
                    id="doctor-confirm-password"
                    v-model="registerForm.doctor.confirmPassword"
                    placeholder="请再次输入密码"
                    required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="doctor-token">令牌 *</label>
              <input
                  type="text"
                  id="doctor-token"
                  v-model="registerForm.doctor.token"
                  placeholder="请输入令牌"
                  required
              >
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="doctor-post">职位 *</label>
                <select
                    id="doctor-post"
                    v-model="registerForm.doctor.post"
                    class="custom-select"
                    required
                >
                  <option value="" disabled selected>请选择职位</option>
                  <option value="0">普通医生</option>
                  <option value="1">科室主任</option>
                </select>
              </div>
              <div class="form-group half">
                <label for="doctor-dept">所属科室 *</label>
                <select
                    id="doctor-dept"
                    v-model="registerForm.doctor.deptId"
                    class="custom-select"
                    required
                >
                  <option value="" disabled selected>请选择科室</option>
                  <option
                      v-for="dept in departments"
                      :key="dept.id"
                      :value="dept.id"
                  >
                    {{ dept.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="doctor-introduction">个人简介</label>
              <textarea
                  id="doctor-introduction"
                  v-model="registerForm.doctor.introduction"
                  placeholder="请输入个人简介（可选）"
                  rows="4"
                  class="custom-textarea"
              ></textarea>
            </div>
          </template>

          <!-- 管理员注册表单 -->
          <template v-else>
            <div class="form-row">
              <div class="form-group half">
                <label for="admin-name">姓名 *</label>
                <input
                    type="text"
                    id="admin-name"
                    v-model="registerForm.admin.name"
                    placeholder="请输入真实姓名"
                    required
                >
              </div>
              <div class="form-group half">
                <label for="admin-gender">性别 *</label>
                <select
                    id="admin-gender"
                    v-model="registerForm.admin.gender"
                    class="custom-select"
                    required
                >
                  <option value="" disabled selected>请选择性别</option>
                  <option value="1">男</option>
                  <option value="0">女</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="admin-phone">手机号 *</label>
              <input
                  type="tel"
                  id="admin-phone"
                  v-model="registerForm.admin.phone"
                  placeholder="请输入手机号"
                  required
              >
            </div>

            <div class="form-group">
              <label for="admin-card">身份证号 *</label>
              <input
                  type="text"
                  id="admin-card"
                  v-model="registerForm.admin.card"
                  placeholder="请输入身份证号码"
                  required
              >
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="admin-password">密码 *</label>
                <input
                    type="password"
                    id="admin-password"
                    v-model="registerForm.admin.password"
                    placeholder="请输入密码"
                    required
                >
              </div>
              <div class="form-group half">
                <label for="admin-confirm-password">确认密码 *</label>
                <input
                    type="password"
                    id="admin-confirm-password"
                    v-model="registerForm.admin.confirmPassword"
                    placeholder="请再次输入密码"
                    required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="admin-token">令牌 *</label>
              <input
                  type="text"
                  id="admin-token"
                  v-model="registerForm.admin.token"
                  placeholder="请输入令牌"
                  required
              >
            </div>
          </template>

          <div v-if="registerPasswordMismatch" class="password-error">
            两次输入的密码不一致
          </div>

          <button type="submit" class="login-btn" :disabled="registerLoading || registerPasswordMismatch">
            {{ registerLoading ? '注册中...' : `${roleTitles[currentRole]}注册` }}
          </button>

          <div class="back-to-login">
            <a href="#" @click.prevent="showRegisterForm = false">← 返回登录</a>
          </div>
        </form>
      </div>

      <div class="login-footer">
        <p>© 2024 智慧医疗系统 · 安全可靠</p>
        <div class="footer-links">
          <a href="#" @click.prevent="showRegisterForm = true">注册账号</a>
          <span class="divider">|</span>
          <a href="#" @click.prevent="showForgotPasswordForm = true">忘记密码</a>
        </div>
      </div>
    </div>

    <!-- 错误弹窗 -->
    <div class="error-modal" :class="{ show: showErrorModal }" @click="closeErrorModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>系统提示</h3>
          <button class="close-btn" @click="closeErrorModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="error-icon">⚠️</div>
          <p>{{ errorMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="confirm-btn" @click="closeErrorModal">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { patientApi, doctorApi, adminApi, deptApi } from '../api'
import loginImage from '../assets/images/login.png'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const currentRole = ref('patient')
    const showRoleMenu = ref(false)
    const loading = ref(false)
    const registerLoading = ref(false)
    const currentTime = ref('')
    const showErrorModal = ref(false)
    const errorMessage = ref('')
    const showForgotPasswordForm = ref(false)
    const showRegisterForm = ref(false)
    const forgotPasswordLoading = ref(false)
    const departments = ref([])

    const formData = reactive({
      username: '',
      password: ''
    })

    const forgotPasswordForm = reactive({
      phone: '',
      newPassword: '',
      confirmPassword: ''
    })

    const registerForm = reactive({
      patient: {
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gender: '',
        card: '',
        email: ''
      },
      doctor: {
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gender: '',
        card: '',
        post: '',
        deptId: '',
        introduction: '',
        token: ''
      },
      admin: {
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        gender: '',
        card: '',
        token: ''
      }
    })

    // 计算属性
    const passwordMismatch = computed(() => {
      return forgotPasswordForm.newPassword &&
          forgotPasswordForm.confirmPassword &&
          forgotPasswordForm.newPassword !== forgotPasswordForm.confirmPassword
    })

    const registerPasswordMismatch = computed(() => {
      const currentForm = registerForm[currentRole.value]
      return currentForm.password &&
          currentForm.confirmPassword &&
          currentForm.password !== currentForm.confirmPassword
    })

    const roleTitles = {
      patient: '患者服务 · 便捷预约',
      doctor: '医师工作站 · 专业诊疗',
      admin: '管理系统 · 高效运营'
    }

    const rolePlaceholders = {
      patient: {
        username: '手机号',
        usernamePlaceholder: '请输入手机号'
      },
      doctor: {
        username: '工号',
        usernamePlaceholder: '请输入工号'
      },
      admin: {
        username: '管理员账号',
        usernamePlaceholder: '请输入管理员账号'
      }
    }

    // 获取科室数据 - 添加防重复请求和权限检查
    const isLoadingDepartments = ref(false)
    const loadDepartments = async () => {
      // 防止重复请求
      if (isLoadingDepartments.value) {
        console.log('科室数据正在加载中...')
        return
      }

      // 检查是否需要加载科室数据（只有医生注册时需要）
      if (currentRole.value !== 'doctor') {
        return
      }

      // 检查是否有有效的token（用户是否已登录）
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('用户未登录，暂不加载科室数据')
        return
      }

      try {
        isLoadingDepartments.value = true
        console.log('开始加载科室数据...')
        const result = await deptApi.getAllEnabled()
        departments.value = result || []
        console.log('科室数据加载完成:', departments.value)
      } catch (error) {
        console.error('加载科室数据失败:', error)
        // 不显示错误提示，避免影响用户体验
      } finally {
        isLoadingDepartments.value = false
      }
    }

    // 登录处理
    const handleLogin = async () => {
      if (!formData.username.trim() || !formData.password.trim()) {
        showError('请输入用户名和密码')
        return
      }

      loading.value = true
      try {
        let response
        switch(currentRole.value) {
          case 'patient':
            response = await patientApi.login({
              phone: formData.username,
              password: formData.password
            })
            break
          case 'doctor':
            response = await doctorApi.login({
              phone: formData.username,
              password: formData.password
            })
            break
          case 'admin':
            response = await adminApi.login({
              phone: formData.username,
              password: formData.password
            })
            break
        }

        console.log('原始响应:', response)
        console.log('response.data:', response.data)
        console.log('response.data.token:', response.data?.token)

        // 检查是否有错误码和 msg
        if (response.code === 500 && response.msg) {
          showError(response.msg)
          return
        }

        // 从正确的嵌套结构中提取数据
        const token = response.data?.token
        const userInfo = response.data?.[currentRole.value]

        console.log('提取的 token:', token)
        console.log('用户信息:', userInfo)

        if (!token) {
          showError('登录失败：未获取到有效的 token')
          return
        }

        // 存储用户信息
        localStorage.setItem('token', token)
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        localStorage.setItem('userRole', currentRole.value)

        console.log('成功存储 token，长度:', token.length)

        // 根据不同角色跳转到对应页面
        switch(currentRole.value) {
          case 'admin':
            router.push('/dashboard') // 管理员跳转到控制台
            break
          case 'doctor':
            router.push('/doctor') // 医生跳转到医生界面
            break
          case 'patient':
            router.push('/patient') // 患者跳转到患者界面
            break
          default:
            router.push('/dashboard') // 默认跳转到工作台
        }

      } catch (error) {
        showError(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }

    // 忘记密码处理
    const handleForgotPassword = async () => {
      // 密码一致性检查
      if (passwordMismatch.value) {
        showError('两次输入的密码不一致')
        return
      }

      if (!forgotPasswordForm.phone.trim()) {
        showError('请输入手机号')
        return
      }

      if (!forgotPasswordForm.newPassword.trim()) {
        showError('请输入新密码')
        return
      }

      // 简单的手机号验证
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(forgotPasswordForm.phone)) {
        showError('请输入正确的手机号')
        return
      }

      forgotPasswordLoading.value = true
      try {
        let result
        switch(currentRole.value) {
          case 'patient':
            result = await patientApi.forgotPassword({
              phone: forgotPasswordForm.phone,
              newPassword: forgotPasswordForm.newPassword
            })
            break
          case 'doctor':
            result = await doctorApi.forgotPassword({
              phone: forgotPasswordForm.phone,
              newPassword: forgotPasswordForm.newPassword
            })
            break
          case 'admin':
            result = await adminApi.forgotPassword({
              phone: forgotPasswordForm.phone,
              newPassword: forgotPasswordForm.newPassword
            })
            break
        }

        console.log('忘记密码成功:', result)
        showMessage('密码重置成功，请使用新密码登录')
        showForgotPasswordForm.value = false
        forgotPasswordForm.phone = ''
        forgotPasswordForm.newPassword = ''
        forgotPasswordForm.confirmPassword = ''

      } catch (error) {
        console.error('忘记密码失败:', error)
        showError(error.message || '密码重置失败')
      } finally {
        forgotPasswordLoading.value = false
      }
    }

    // 注册处理
    const handleRegister = async () => {
      // 密码一致性检查
      if (registerPasswordMismatch.value) {
        showError('两次输入的密码不一致')
        return
      }

      const currentForm = registerForm[currentRole.value]

      // 基本字段验证
      if (!currentForm.name.trim()) {
        showError('请输入姓名')
        return
      }
      if (!currentForm.phone.trim()) {
        showError('请输入手机号')
        return
      }
      if (!currentForm.password.trim()) {
        showError('请输入密码')
        return
      }

      // 角色特定验证
      if (currentRole.value === 'patient') {
        if (!currentForm.card.trim()) {
          showError('请输入身份证号')
          return
        }
      } else if (currentRole.value === 'doctor') {
        if (!currentForm.deptId) {
          showError('请选择所属科室')
          return
        }
        if (!currentForm.post) {
          showError('请选择职位')
          return
        }
      }

      registerLoading.value = true
      try {
        let result
        switch(currentRole.value) {
          case 'patient':
            result = await patientApi.register({
              name: currentForm.name,
              phone: currentForm.phone,
              password: currentForm.password,
              gender: parseInt(currentForm.gender),
              card: currentForm.card,
              email: currentForm.email
            })
            break
          case 'doctor':
            result = await doctorApi.register({
              name: currentForm.name,
              phone: currentForm.phone,
              password: currentForm.password,
              gender: parseInt(currentForm.gender),
              card: currentForm.card,
              post: parseInt(currentForm.post),
              deptId: parseInt(currentForm.deptId),
              introduction: currentForm.introduction,
              token: currentForm.token
            })
            break
          case 'admin':
            result = await adminApi.register({
              name: currentForm.name,
              phone: currentForm.phone,
              password: currentForm.password,
              gender: parseInt(currentForm.gender),
              card: currentForm.card,
              token: currentForm.token
            })
            break
        }

        console.log('注册成功:', result)

        // 检查响应码，只有 code 为 200 或 0 才表示成功
        if (result && (result.code === 200 || result.code === 0 || result.success)) {
          showMessage(`${roleTitles[currentRole.value]}注册成功！`)
          showRegisterForm.value = false
          // 重置表单
          currentForm.name = ''
          currentForm.phone = ''
          currentForm.password = ''
          currentForm.confirmPassword = ''
          currentForm.gender = ''
          currentForm.card = ''
          if (currentRole.value === 'patient') {
            currentForm.email = ''
          } else if (currentRole.value === 'doctor') {
            currentForm.post = ''
            currentForm.deptId = ''
            currentForm.introduction = ''
          }
        } else {
          // 注册失败的提示
          const errorMsg = result?.msg || result?.message || '注册失败，请检查输入信息'
          showError(errorMsg)
        }

      } catch (error) {
        console.error('注册失败:', error)
        showError(error.message || '注册失败，请检查输入信息')
      } finally {
        registerLoading.value = false
      }
    }

    // 其他辅助函数
    const updateTime = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }

    const showError = (message) => {
      errorMessage.value = message
      showErrorModal.value = true
    }

    const showMessage = (message) => {
      // 使用 alert 显示成功消息
      alert(message)
      // 延迟返回登录页面
      setTimeout(() => {
        showRegisterForm.value = false
      }, 100)
    }

    const closeErrorModal = () => {
      showErrorModal.value = false
      errorMessage.value = ''
    }

    const toggleRoleMenu = (event) => {
      // 阻止事件冒泡和默认行为
      event.preventDefault()
      event.stopPropagation()
      showRoleMenu.value = !showRoleMenu.value
      console.log('角色菜单切换状态:', showRoleMenu.value)
    }

    const switchRole = (role) => {
      console.log('切换角色到:', role, '当前角色:', currentRole.value)

      // 总是执行角色切换逻辑
      currentRole.value = role
      formData.username = ''
      formData.password = ''
      showRoleMenu.value = false
      showForgotPasswordForm.value = false
      showRegisterForm.value = false

      // 重置注册表单
      resetRegisterForm()

      // 注意：不再在角色切换时立即加载科室数据
      // 科室数据将在用户实际需要时（如点击注册医生）再加载
      console.log('角色切换完成，当前角色:', currentRole.value)
    }

    // 重置注册表单
    const resetRegisterForm = () => {
      // 重置患者表单
      registerForm.patient.name = ''
      registerForm.patient.phone = ''
      registerForm.patient.password = ''
      registerForm.patient.confirmPassword = ''
      registerForm.patient.gender = ''
      registerForm.patient.card = ''
      registerForm.patient.email = ''
      registerForm.patient.address = ''

      // 重置医生表单
      registerForm.doctor.name = ''
      registerForm.doctor.phone = ''
      registerForm.doctor.password = ''
      registerForm.doctor.confirmPassword = ''
      registerForm.doctor.gender = ''
      registerForm.doctor.card = ''
      registerForm.doctor.post = ''
      registerForm.doctor.deptId = ''
      registerForm.doctor.introduction = ''
      registerForm.doctor.token = ''

      // 重置管理员表单
      registerForm.admin.name = ''
      registerForm.admin.phone = ''
      registerForm.admin.password = ''
      registerForm.admin.confirmPassword = ''
      registerForm.admin.gender = ''
      registerForm.admin.card = ''
      registerForm.admin.token = ''
    }

    // 生命周期 - 移除了自动加载科室数据的调用
    let timer = null
    onMounted(() => {
      updateTime()
      timer = setInterval(updateTime, 1000)
    })

    onUnmounted(() => {
      if (timer) {
        clearInterval(timer)
      }
    })

    return {
      currentRole,
      showRoleMenu,
      loading,
      registerLoading,
      currentTime,
      showErrorModal,
      errorMessage,
      showForgotPasswordForm,
      showRegisterForm,
      forgotPasswordLoading,
      formData,
      forgotPasswordForm,
      registerForm,
      passwordMismatch,
      registerPasswordMismatch,
      departments,
      roleTitles,
      rolePlaceholders,
      handleLogin,
      handleForgotPassword,
      handleRegister,
      showError,
      closeErrorModal,
      toggleRoleMenu,
      switchRole,
      resetRegisterForm,
      loginImage
    }
  }
}
</script>

<style scoped>
/* 应用包装器 */
.app-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景图案 */
.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.85;
  z-index: -1;
}

.background-pattern::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* 登录容器 */
.login-container {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
  margin: 20px;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 角色切换器 */
.role-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 20;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.role-switcher:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(180deg) scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.switcher-icon svg {
  width: 20px;
  height: 20px;
  color: white;
  transition: all 0.3s ease;
}

.role-switcher:hover .switcher-icon svg {
  transform: rotate(180deg);
}

/* 角色菜单 */
.role-menu {
  position: absolute;
  top: 70px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 10px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 15;
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 120px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.role-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.role-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 15px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 5px;
  font-size: 14px;
  text-align: left;
}

.role-btn:last-child {
  margin-bottom: 0;
}

.role-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.role-btn.active {
  background: rgba(255, 255, 255, 0.3);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.role-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.role-icon svg {
  width: 18px;
  height: 18px;
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.real-time {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
}

.hospital-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.role-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.login-header h1 {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.login-header p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
}

/* 表单滚动容器 */
.form-scroll-container {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 5px;
}

.form-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.form-scroll-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.form-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* 登录表单 */
.login-form {
  width: 100%;
}

/* 表单组样式 */
.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(5px);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

/* 自定义下拉框样式 */
.custom-select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  cursor: pointer;
}

.custom-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
}

.custom-select option {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  border: none;
}

/* 自定义文本域样式 */
.custom-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  resize: vertical;
  min-height: 80px;
}

.custom-textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.custom-textarea:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
}

/* 表单行布局 */
.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.form-group.half {
  flex: 1;
  margin-bottom: 0;
}

/* 登录按钮样式 */
.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.2) 100%);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.3) 100%);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 密码不一致错误提示样式 */
.password-error {
  color: #ff6b6b;
  font-size: 14px;
  margin-top: -15px;
  margin-bottom: 15px;
  text-align: left;
  animation: shake 0.5s ease-in-out;
  display: flex;
  align-items: center;
  gap: 5px;
}

.password-error::before {
  content: '⚠';
  font-size: 16px;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 返回登录链接样式 */
.back-to-login {
  text-align: center;
  margin-top: 20px;
}

.back-to-login a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
}

.back-to-login a:hover {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 登录页脚样式 */
.login-footer {
  text-align: center;
  padding: 15px 30px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  flex-shrink: 0;
  border-radius: 0 0 20px 20px;
  margin: 0;
  padding-bottom: 20px;
}

.footer-links {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.footer-links a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 13px;
  padding: 5px 10px;
  border-radius: 15px;
}

.footer-links a:hover {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  text-decoration: none;
}

.divider {
  margin: 0 10px;
  color: rgba(255, 255, 255, 0.5);
}

/* 错误弹窗样式 */
.error-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.error-modal.show {
  opacity: 1;
  visibility: visible;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transform: scale(0.9);
  transition: transform 0.3s ease;
  animation: modalEnter 0.3s ease-out;
}

@keyframes modalEnter {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.error-modal.show .modal-content {
  transform: scale(1);
}

.modal-header {
  padding: 20px 25px 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: white;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  padding: 25px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 15px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-10px);}
  60% {transform: translateY(-5px);}
}

.modal-body p {
  margin: 0;
  color: #666;
  font-size: 16px;
  line-height: 1.5;
}

.modal-footer {
  padding: 15px 25px 25px;
  text-align: center;
}

.confirm-btn {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #337ecc 0%, #2d6cba 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 20px;
    margin: 10px;
    max-width: calc(100% - 20px);
  }

  .login-header h1 {
    font-size: 20px;
  }

  .role-switcher {
    top: 15px;
    right: 15px;
    width: 35px;
    height: 35px;
  }

  .role-menu {
    top: 60px;
    right: 15px;
  }

  .login-footer {
    margin: -20px -20px -20px -20px;
    padding: 12px 20px;
    font-size: 12px;
  }

  .footer-links {
    flex-direction: column;
    gap: 8px;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 12px 14px;
    font-size: 14px;
  }
}

/* 加载状态样式 */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* 输入框验证状态 */
.form-group.success input {
  border-color: #67c23a;
  box-shadow: 0 0 0 3px rgba(103, 194, 58, 0.1);
}

.form-group.error input {
  border-color: #f56c6c;
  box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.1);
}

/* 表单切换动画 */
.form-transition-enter-active,
.form-transition-leave-active {
  transition: all 0.3s ease;
}

.form-transition-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.form-transition-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>

