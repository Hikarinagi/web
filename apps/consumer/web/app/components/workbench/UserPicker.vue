<script setup lang="ts">
  import { Combobox } from '@hina-ui/vue'
  import { displayName } from '~/utils/user'

  const userId = defineModel<number | null>({ required: true })

  const search = ref('')
  const keyword = refDebounced(search, 250)
  const loading = ref(false)
  const options = ref<{ value: number; label: string }[]>([])

  watch(keyword, async value => {
    const text = value.trim()
    if (!text) {
      options.value = []
      return
    }
    loading.value = true
    try {
      const result = await hikariRequest('/api/v3/user', {
        query: { search: text, page: 1, page_size: 8 },
        toast: false,
      })
      options.value = result.items.map(user => ({
        value: user.id,
        label: `${displayName(user)}（@${user.name}）`,
      }))
    } catch {
      options.value = []
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <Combobox
    v-model="userId"
    v-model:search="search"
    :options="options"
    :loading="loading"
    ignore-filter
    clearable
    placeholder="按用户名或昵称搜索"
    aria-label="用户"
  />
</template>
