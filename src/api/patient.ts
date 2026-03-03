// @ts-nocheck
import http from './http'

// 患者注册
export interface PatientRegisterDTO {
    name: string
    phone: string
    password: string
    gender: number
    card: string
    email?: string
    address?: string
}

// 患者登录
export interface PatientLoginDTO {
    phone: string
    password: string
}

//患者忘记密码
export interface PatientForgotPasswordDTO {
    phone: string
    newPassword: string
}

// 登录响应数据
export interface LoginResponse {
    token: string
    patient: {
        id: number
        name: string
        phone: string
        // ... 其他患者信息
    }
}

// 患者更新信息
export interface PatientUpdateDTO {
    id: number
    name: string
    gender: number
    card: string
    phone: string
    email?: string
    address?: string
}

// 患者分页查询DTO - 根据API文档完善
export interface PatientPageQueryDTO {
    id?: number
    name?: string
    phone?: string
    gender?: number
    page: number
    pageSize: number
    sortBy?: string
    sortDir?: string
}

export const patientApi = {
    // 患者注册
    register: (data) => {
        return http.post('/patient/register', data)
    },

    // 患者登录
    login: (data) => {
        return http.post('/patient/login', data)
    },

    // 患者忘记密码
    forgotPassword: (data: PatientForgotPasswordDTO) => {
        return http.post('/patient/forgot-password', data)
    },

    // 分页查询患者 - 根据API文档完善
    pageQuery: (data: PatientPageQueryDTO) => {
        return http.post('/patient/page', data)
    },

    // 获取患者信息
    getById: (id) => {
        return http.get(`/patient/getById/${id}`)
    },

    // 更新患者信息
    update: (data) => {
        return http.put('/patient/update', data)
    },

    // 患者注销
    logout: () => {
        return http.delete('/patient/logout')
    },

    // 删除患者
    delete: (id) => {
        return http.delete(`/patient/delete/${id}`)
    }
}
