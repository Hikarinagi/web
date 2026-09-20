<script setup lang="ts">
  import {
    AtSign,
    Bell,
    BookOpen,
    GitPullRequest,
    Heart,
    Megaphone,
    MessageCircle,
    Shirt,
    UserCheck,
    UserPlus,
    Users,
  } from '@lucide/vue'
  import type { SystemMessageItem } from '~/features/notifications/notifications'

  defineOptions({ name: 'NotificationsActorAvatars' })

  const props = defineProps<{
    actor: SystemMessageItem['actor']
    actors: SystemMessageItem['actors']
    templateKey: SystemMessageItem['template_key']
    type: SystemMessageItem['type']
  }>()

  const stack = computed(() =>
    props.actors?.length ? props.actors : props.actor ? [props.actor] : [],
  )
  const primary = computed(() => stack.value[0] ?? null)
  const isStack = computed(() => stack.value.length > 1)

  const icon = computed(() => {
    switch (props.templateKey) {
      case 'interaction.like':
        return Heart
      case 'interaction.reply':
      case 'interaction.comment':
        return MessageCircle
      case 'interaction.follow':
        return UserPlus
      case 'interaction.mention':
        return AtSign
      case 'contribution.submitted':
      case 'contribution.updated':
      case 'contribution.merged':
      case 'contribution.rejected':
      case 'contribution.commented':
        return GitPullRequest
      case 'application.approved':
      case 'application.rejected':
        return UserCheck
      case 'group.added':
      case 'group.removed':
        return Users
      case 'epub.result':
        return BookOpen
      case 'achievement.unlock':
        return Shirt
      default:
        return props.type === 'SYSTEM' ? Megaphone : Bell
    }
  })
</script>

<template>
  <div class="relative shrink-0">
    <div v-if="isStack" class="flex items-center">
      <Avatar
        v-for="(u, i) in stack"
        :key="u.id"
        :user="u"
        card
        shape="circle"
        class="size-8! ring-2 ring-surface-0 dark:ring-surface-900"
        :class="i > 0 ? '-ms-3.5' : ''"
        :style="{ zIndex: stack.length - i }"
      />
    </div>
    <Avatar v-else-if="primary" :user="primary" card shape="circle" class="size-10!" />
    <span v-else class="grid size-10 place-items-center rounded-full bg-emphasis text-muted-color">
      <component :is="icon" class="size-5" aria-hidden="true" />
    </span>
    <span
      v-if="primary"
      class="absolute -inset-e-1 -bottom-1 z-10 grid size-5 place-items-center rounded-full bg-surface-0 text-primary ring-2 ring-surface-0 dark:bg-surface-900 dark:ring-surface-900"
    >
      <component :is="icon" class="size-3" aria-hidden="true" />
    </span>
  </div>
</template>
