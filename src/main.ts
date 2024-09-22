import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from "@/App.vue"
import router from '@/router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import "@/styles/index.scss"
import type {Pinia} from "pinia"
import type {App as _App} from "vue"

const pinia: Pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app: _App<Element> = createApp(App)
app.use(router).use(pinia)
app.mount('#app')