import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PrimeVue from 'primevue/config'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: 'authentication required' }),
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('redirects unauthenticated users to login', async () => {
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router, PrimeVue],
      },
    })

    expect(wrapper.text()).toContain('Legal Roster')
    expect(wrapper.text()).toContain('Sign in')
  })
})
