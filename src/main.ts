import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initPlatform } from '@pindou/app-shared'
import App from './App.vue'
import router from './router'
import { createWebPlatform } from './platform/web'
import './styles/global.scss'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
initPlatform(createWebPlatform(router))
app.mount('#app')
