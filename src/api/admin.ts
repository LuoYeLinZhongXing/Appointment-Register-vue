import http from './http'

// 管理员注册
export interface AdminRegisterDTO {
    name: string
    password: string
    gender: number
    card: string
    phone: string
}

// 管理员登录
export interface AdminLoginDTO {
    phone: string
    password: string
}

// 管理员忘记密码
export interface AdminForgotPasswordDTO {
    phone: string
    newPassword: string
}

// 管理员更新
export interface AdminUpdateDTO {
    name: string
    phone: string
    gender: number
    card: string
}

export const adminApi = {
    // 管理员注册
    register: (data: AdminRegisterDTO) => {
        return http.post('/admin/register', data)
    },

    // 管理员登录
    login: (data: AdminLoginDTO) => {
        return http.post('/admin/login', data)
    },

    // 管理员忘记密码
    forgotPassword: (data: AdminForgotPasswordDTO) => {
        return http.post('/admin/forgot-password', data)
    },

    // 获取管理员详情
    getById: (id: number) => {
        return http.get(`/admin/${id}`)
    },

    // 获取当前登录管理员
    getCurrent: () => {
        return http.get('/admin/current')
    },

    // 更新管理员信息
    update: (data: AdminUpdateDTO) => {
        return http.put('/admin/update', data)
    }
}
