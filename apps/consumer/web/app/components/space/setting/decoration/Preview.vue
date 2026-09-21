<script setup lang="ts">
  import { Card, Inline, Stack, Text } from '@hina-ui/vue'
  import type { OwnedDecoration } from '~/features/space/useDecoration'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingDecorationPreview' })

  const props = defineProps<{
    me: CurrentUser
    frame: OwnedDecoration | null
    badges: OwnedDecoration[]
    points: number
  }>()

  const previewUser = computed(() => ({
    id: props.me.id,
    name: props.me.name,
    avatar: props.me.avatar,
    equipped_frame: props.frame
      ? {
          id: props.frame.id,
          key: props.frame.key,
          name: props.frame.name,
          scale: props.frame.scale,
          image: props.frame.image,
        }
      : null,
  }))

  const displayedName = computed(() => displayName(props.me))
</script>

<template>
  <Card>
    <Inline gap="lg" align="center" :wrap="false">
      <Avatar :user="previewUser" class="size-24!" />
      <Stack gap="none" class="min-w-0 flex-1">
        <Inline gap="xs" align="center" :wrap="false">
          <Text size="lg" weight="semibold" truncate>{{ displayedName }}</Text>
          <UserBadges :badges="badges" height="h-5" full />
        </Inline>
        <Text size="sm" weight="medium" class="mt-1">{{ frame?.name ?? '未佩戴头像框' }}</Text>
        <Text size="xs" tone="muted" class="mt-0.5 line-clamp-2 h-8 leading-4">
          {{ frame?.description }}
        </Text>
        <Inline gap="xs" align="baseline" class="mt-3" :wrap="false">
          <HikariPoint class="size-4.5 self-center" aria-hidden="true" />
          <Text weight="semibold">{{ points }}</Text>
          <Text size="xs" tone="muted">光点</Text>
        </Inline>
      </Stack>
    </Inline>
  </Card>
</template>
