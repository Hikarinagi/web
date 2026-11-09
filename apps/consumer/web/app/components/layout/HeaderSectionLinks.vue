<script setup lang="ts">
  import {
    Button,
    DropdownMenu,
    DropdownMenuItem,
    IconButton,
    Inline,
    Spinner,
    Text,
  } from '@hina-ui/vue'
  import { Library, SlidersHorizontal } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'

  type Bunko = ApiData<'/api/v3/light-novels/stats', 'get'>['top_bunko'][number]

  defineOptions({ name: 'LayoutHeaderSectionLinks' })

  const route = useRoute()
  const auth = useAuthStore()
  const browse = computed(() =>
    ['/galgames', '/light-novels', '/mangas'].includes(route.path) ? `${route.path}/browse` : null,
  )
  const novels = computed(() => route.path === '/light-novels')
  const open = ref(false)
  const bunko = shallowRef<Bunko[] | null>(null)

  watch(open, async next => {
    if (!next || bunko.value) return
    try {
      bunko.value = (
        await hikariRequest<'/api/v3/light-novels/stats', 'get'>('/api/v3/light-novels/stats', {
          method: 'get',
        })
      ).top_bunko
    } catch {
      open.value = false
    }
  })
</script>

<template>
  <Inline
    v-if="browse"
    gap="xs"
    align="center"
    :wrap="false"
    :class="auth.isAuthenticated ? '' : 'lg:max-xl:hidden'"
  >
    <DropdownMenu v-if="novels" v-model:open="open" label="文库" align="end" class="w-56">
      <Button variant="ghost" tone="neutral" size="sm" aria-label="文库">
        <template #icon><Library /></template>
        <Text as="span" size="inherit" class="hidden xl:inline">文库</Text>
      </Button>
      <template #content>
        <DropdownMenuItem v-if="!bunko" disabled>
          <Spinner size="sm" />
        </DropdownMenuItem>
        <DropdownMenuItem
          v-for="item in bunko ?? []"
          :key="item.id"
          @select="navigateTo(`/light-novels/bunko/${item.id}`)"
        >
          {{ item.name }}
          <template #trailing>
            <Text as="span" size="xs" tone="faint" class="tabular-nums">{{ item.count }}</Text>
          </template>
        </DropdownMenuItem>
      </template>
    </DropdownMenu>
    <Button
      :as="NuxtLink"
      :to="browse"
      variant="ghost"
      tone="neutral"
      size="sm"
      class="hidden xl:inline-flex"
    >
      <template #icon><SlidersHorizontal /></template>
      图鉴
    </Button>
    <IconButton :as="NuxtLink" :to="browse" label="图鉴" pill class="xl:hidden">
      <SlidersHorizontal />
    </IconButton>
  </Inline>
</template>
