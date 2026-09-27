import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import legalBenchPreset from './theme/legalBenchPreset'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: legalBenchPreset,
    options: {
      darkModeSelector: false,
    },
  },
})

app.mount('#app')
