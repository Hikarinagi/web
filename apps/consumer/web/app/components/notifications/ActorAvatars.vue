<script setup lang="ts">
  import { Badge, Center } from '@hina-ui/vue'
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
  <Badge
    :content="primary ? templateKey : null"
    bare
    placement="bottom-end"
    :shape="isStack ? 'rect' : 'circle'"
  >
    <template #content>
      <Center as="span" class="size-5 rounded-full bg-surface text-accent-text">
        <component :is="icon" class="size-3" aria-hidden="true" />
      </Center>
    </template>

    <AvatarStack v-if="isStack" :users="stack" size="lg" card />
    <Avatar v-else-if="primary" :user="primary" card class="size-10!" />
    <Center v-else as="span" class="size-10 rounded-full bg-subtle text-muted">
      <component :is="icon" class="size-5" aria-hidden="true" />
    </Center>
  </Badge>
</template>
