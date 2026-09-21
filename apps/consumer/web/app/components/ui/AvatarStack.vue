<script setup lang="ts">
  import { Avatar as HnAvatar, Inline } from '@hina-ui/vue'
  import type { UserAvatarData } from '~/types/user'
  import type { NamedUser } from '~/utils/user'

  defineOptions({ name: 'HikariAvatarStack' })

  const props = withDefaults(
    defineProps<{
      users: (NamedUser & UserAvatarData)[]
      max?: number
      total?: number
      card?: boolean
      size?: 'sm' | 'md' | 'lg'
    }>(),
    { max: 0, total: undefined, card: false, size: 'md' },
  )

  const AVATAR_SIZE = { sm: 'size-5!', md: 'size-6!', lg: 'size-8!' }
  const OVERLAP = { sm: '[&>*]:-me-2', md: '[&>*]:-me-2', lg: '[&>*]:-me-3.5' }

  const visible = computed(() => (props.max > 0 ? props.users.slice(0, props.max) : props.users))
  const rest = computed(() => (props.total ?? props.users.length) - visible.value.length)
  const painted = computed(() => [...visible.value].reverse())
</script>

<template>
  <Inline
    gap="none"
    align="center"
    :wrap="false"
    :class="cn('flex-row-reverse justify-end [&>*:first-child]:me-0', OVERLAP[size])"
  >
    <HnAvatar
      v-if="rest > 0"
      :class="
        cn(AVATAR_SIZE[size], 'bg-subtle text-xs font-semibold text-muted ring-2 ring-surface')
      "
    >
      +{{ rest }}
    </HnAvatar>
    <Avatar
      v-for="u in painted"
      :key="u.id"
      :user="u"
      :card="card"
      :class="cn(AVATAR_SIZE[size], 'ring-2 ring-surface')"
    />
  </Inline>
</template>
