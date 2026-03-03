import http from './http'

// 医生注册
export interface DoctorRegisterDTO {
    name: string
    phone: string
    password: string
    gender: number
    card: string
    post: number
    introduction?: string
    deptId: number
}

// 医生登录
export interface DoctorLoginDTO {
    phone: string
    password: string
}

// 医生忘记密码
export interface DoctorForgotPasswordDTO {
    phone: string
    newPassword: string
}

// 医生更新
export interface DoctorUpdateDTO {
    id: number
    name: string
    phone: string
    gender: number
    card: string
    post: number
    introduction?: string
    deptId: number
    status: number
}

// 医生状态更新
export interface DoctorStatusUpdateDTO {
    id: number
    status: number
}

// 医生分页查询
export interface DoctorPageQueryDTO {
    id?: number
    name?: string
    post?: number
    status?: number
    deptId?: number
    page: number
    pageSize: number
    sortBy?: string
    sortDir?: string
}

export const doctorApi = {
    // 医生注册
    register: (data: DoctorRegisterDTO) => {
        return http.post('/doctor/register', data)
    },

    // 医生登录
    login: (data: DoctorLoginDTO) => {
        return http.post('/doctor/login', data)
    },

    // 医生忘记密码
    forgotPassword: (data: DoctorForgotPasswordDTO) => {
        return http.post('/doctor/forgot-password', data)
    },

    // 分页查询医生 - 修复路径
    pageQuery: (data: DoctorPageQueryDTO) => {
        return http.post('/doctor/page', data)
    },

    // 获取医生详情
    getById: (id: number) => {
        return http.get(`/doctor/getById/${id}`)
    },

    // 根据科室ID获取医生列表
    getDoctorsByDeptId: (deptId: number) => {
        return http.get(`/doctor/getDoctorsByDeptId/${deptId}`)
    },

    // 更新医生信息
    update: (data: DoctorUpdateDTO) => {
        return http.put('/doctor/update', data)
    },

    // 更新医生状态
    updateStatus: (data: DoctorStatusUpdateDTO) => {
        return http.patch('/doctor/status', data)
    },

    // 删除医生
    delete: (id: number) => {
        return http.delete(`/doctor/delete/${id}`)
    }
}
