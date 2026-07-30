<script setup lang="ts">
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
  <div class="flex items-center gap-5 rounded-2xl border border-surface p-5">
    <Avatar :user="previewUser" shape="circle" class="size-24!" />
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5">
        <p class="truncate text-lg font-semibold text-color">{{ displayedName }}</p>
        <UserBadges :badges="badges" height="h-5" full />
      </div>
      <p class="mt-1 text-sm font-medium text-color">{{ frame?.name ?? '未佩戴头像框' }}</p>
      <p class="mt-0.5 line-clamp-2 h-8 text-xs leading-4 text-muted-color">
        {{ frame?.description }}
      </p>
      <div class="mt-3 flex items-baseline gap-1.5">
        <HikariPoint class="size-[18px] self-center" aria-hidden="true" />
        <span class="text-base font-bold text-color">{{ points }}</span>
        <span class="text-[13px] text-muted-color">光点</span>
      </div>
    </div>
  </div>
</template>
