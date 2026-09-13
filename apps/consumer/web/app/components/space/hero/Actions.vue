<script setup lang="ts">
  import { MessageCircle, SquarePen } from '@lucide/vue'
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceHeroActions' })

  const props = defineProps<{
    profile: SpacePageData['profile']
    isSelf: boolean
    settingTo: string
    variant: 'inline' | 'stacked'
  }>()

  const inline = computed(() => props.variant === 'inline')
  const btnClass = computed(() =>
    inline.value
      ? 'sm:px-(--p-button-lg-padding-x)! sm:py-(--p-button-lg-padding-y)! sm:text-(--p-button-lg-font-size)!'
      : 'min-w-0 flex-1',
  )
  const shareClass = computed(() =>
    inline.value
      ? 'sm:w-(--p-button-lg-icon-only-width)! sm:px-0! sm:py-(--p-button-lg-padding-y)! sm:text-(--p-button-lg-font-size)!'
      : 'shrink-0',
  )
</script>

<template>
  <div class="items-stretch" :class="inline ? 'gap-2.5' : 'w-full gap-2'">
    <Button
      v-if="isSelf"
      as="router-link"
      :to="settingTo"
      label="编辑资料"
      size="small"
      severity="secondary"
      outlined
      :class="btnClass"
    >
      <template #icon><SquarePen class="size-4" /></template>
    </Button>
    <template v-else>
      <CommunityFollowButton
        :user-id="profile.id"
        :initial-following="profile.is_following"
        size="small"
        :class="btnClass"
      />
      <Button
        as="router-link"
        :to="`/messages?peer=${profile.id}`"
        :label="inline ? '私信' : undefined"
        :aria-label="inline ? undefined : '私信'"
        size="small"
        severity="secondary"
        outlined
        :class="inline ? btnClass : shareClass"
      >
        <template #icon><MessageCircle class="size-4" /></template>
      </Button>
    </template>
    <ShareButton
      severity="secondary"
      size="small"
      outlined
      tooltip="分享主页"
      :class="shareClass"
    />
  </div>
</template>
