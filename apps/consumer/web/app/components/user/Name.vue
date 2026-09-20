<script setup lang="ts">
  import { cn } from '~/utils/cn'
  import { displayName, isAutoUsername, type NamedUser } from '~/utils/user'

  defineOptions({ name: 'UserName', inheritAttrs: false })

  withDefaults(
    defineProps<{
      user?: NamedUser | null
      handle?: boolean
      fallback?: string
      handleClass?: string
      full?: boolean
    }>(),
    { user: null, handle: true, fallback: '匿名用户', handleClass: '' },
  )

  const attrs = useAttrs()
</script>

<template>
  <span v-if="user" :class="cn('inline-flex min-w-0 items-baseline gap-1', attrs.class as string)">
    <span class="min-w-0 truncate">{{ displayName(user) }}</span>
    <span
      v-if="handle && !isAutoUsername(user.name) && displayName(user) !== user.name"
      :class="cn('shrink-0 font-normal text-muted-color', !full && 'hidden sm:inline', handleClass)"
    >
      @{{ user.name }}
    </span>
  </span>
  <span v-else :class="cn('truncate', attrs.class as string)">{{ fallback }}</span>
</template>
