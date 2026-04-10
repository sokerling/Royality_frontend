import "./polyfills/abortController"
import { createApp } from 'nativescript-vue'
import { init as initBackgroundHttp } from '@nativescript/background-http'
import App from './App.vue'

initBackgroundHttp()
createApp(App).start()
