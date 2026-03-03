import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 引入自定义背景样式
import './assets/styles/background.css'
// 添加中文语言包导入
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(ElementPlus, {
    locale: zhCn,  // 现在 zhCn 变量可以正常使用了
})
app.use(router)  // 路由要在 mount 之前使用
app.mount('#app')
