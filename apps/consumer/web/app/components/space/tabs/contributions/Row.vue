<script setup lang="ts">
  import { Center, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { Image as ImageIcon, User } from '@lucide/vue'
  import {
    contributionDetailPath,
    contributionResourceLabel,
    type SpaceContribution,
  } from '~/features/space/space'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  defineOptions({ name: 'SpaceTabsContributionsRow' })

  const props = defineProps<{ item: SpaceContribution }>()
  const NuxtLink = resolveComponent('NuxtLink')

  const isEntity = computed(() =>
    ['PERSON', 'CHARACTER', 'PRODUCER'].includes(props.item.resource_type),
  )
  const to = computed(() => contributionDetailPath(props.item.change_request_id))
  const mediaClass = computed(() => (isEntity.value ? 'size-10 rounded-full' : 'h-12 w-9 rounded'))
  const mediaImageClass = computed(() =>
    isEntity.value ? 'size-full object-cover object-top' : 'size-full object-cover',
  )
  const mediaProcessing = computed(() =>
    isEntity.value
      ? { width: 80, height: 80, fit: 'cover' as const, gravity: 'face' as const, quality: 82 }
      : { width: 96, height: 128, fit: 'cover' as const, quality: 78 },
  )
</script>

<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to ?? undefined"
    :target="to ? '_blank' : undefined"
    class="group flex items-start gap-3.5 border-b border-line py-3.5 last:border-b-0"
  >
    <HikariImage
      v-if="item.resource?.cover"
      :src="item.resource.cover"
      alt=""
      class="shrink-0 bg-inset"
      :class="mediaClass"
      :image-class="mediaImageClass"
      :processing="mediaProcessing"
    />
    <Center v-else :class="cn('shrink-0 bg-inset text-muted', mediaClass)">
      <component :is="isEntity ? User : ImageIcon" class="size-4" />
    </Center>

    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline gap="sm" :wrap="false">
        <Text weight="semibold" truncate class="transition-colors group-hover:text-accent-text">
          {{ item.resource?.title ?? `#${item.resource_id}` }}
        </Text>
        <Text as="span" size="xs" tone="muted" class="shrink-0">
          {{ contributionResourceLabel(item.resource_type) }}
        </Text>
      </Inline>
      <Text size="sm" tone="muted" truncate>{{ item.summary }}</Text>
    </Stack>

    <Stack gap="xs" align="end" class="shrink-0">
      <Inline gap="xs" :wrap="false">
        <Tag size="sm">v{{ item.version }}</Tag>
        <Tag size="sm" tone="accent">已合并</Tag>
      </Inline>
      <Text as="span" size="xs" tone="muted">
        {{ datePartFormat(item.created_at, TimeFormatEnum.M_D_CN) }}
      </Text>
    </Stack>
  </component>
</template>
