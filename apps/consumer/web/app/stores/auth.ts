import { defineStore } from 'pinia'

import type { CurrentUser } from '~/types/auth'
import { emitAuthChange } from '~/utils/auth-cleanup'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<CurrentUser | null>(null)
  const loading = ref(false)
  const loaded = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  function setUser(nextUser: CurrentUser | null) {
    const prevId = user.value?.id ?? null
    const nextId = nextUser?.id ?? null
    user.value = nextUser
    loaded.value = true
    if (prevId !== nextId) emitAuthChange()
  }

  function setLoading(nextLoading: boolean) {
    loading.value = nextLoading
  }

  return {
    isAuthenticated,
    loaded,
    loading,
    setLoading,
    setUser,
    user,
  }
})
