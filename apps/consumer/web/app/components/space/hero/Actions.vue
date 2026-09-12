<script setup lang="ts">
  import { Button, Flex } from '@hina-ui/vue'
  import { MessageCircle, SquarePen } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceHeroActions' })

  const props = defineProps<{
    profile: SpacePageData['profile']
    isSelf: boolean
    settingTo: string
    variant: 'inline' | 'stacked'
  }>()

  const inline = computed(() => props.variant === 'inline')
  const btnClass = computed(() => (inline.value ? '' : 'min-w-0 flex-1'))
</script>

<template>
  <Flex align="stretch" :class="inline ? 'gap-2.5' : 'w-full gap-2'">
    <Button
      v-if="isSelf"
      :as="NuxtLink"
      :to="settingTo"
      size="md"
      variant="outline"
      tone="neutral"
      :class="btnClass"
    >
      <template #icon><SquarePen /></template>
      编辑资料
    </Button>
    <template v-else>
      <CommunityFollowButton
        :user-id="profile.id"
        :initial-following="profile.is_following"
        size="md"
        :class="btnClass"
      />
      <Button
        :as="NuxtLink"
        :to="`/messages?peer=${profile.id}`"
        size="md"
        variant="outline"
        tone="neutral"
        :icon-only="!inline"
        :aria-label="inline ? undefined : '私信'"
        :class="inline ? btnClass : 'shrink-0'"
      >
        <template #icon><MessageCircle /></template>
        <template v-if="inline" #default>私信</template>
      </Button>
    </template>
    <ShareButton size="md" variant="outline" tooltip="分享主页" :class="inline ? '' : 'shrink-0'" />
  </Flex>
</template>
