<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
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
  <Inline
    v-if="user"
    as="span"
    gap="xs"
    align="baseline"
    :wrap="false"
    :class="cn('min-w-0', attrs.class as string)"
  >
    <span class="min-w-0 truncate">{{ displayName(user) }}</span>
    <span
      v-if="handle && !isAutoUsername(user.name) && displayName(user) !== user.name"
      :class="cn('shrink-0 font-normal text-muted', !full && 'hidden sm:inline', handleClass)"
    >
      @{{ user.name }}
    </span>
  </Inline>
  <span v-else :class="cn('truncate', attrs.class as string)">{{ fallback }}</span>
</template>
