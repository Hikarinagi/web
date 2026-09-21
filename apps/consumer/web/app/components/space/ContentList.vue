<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import { Eye, FileText, Heart } from '@lucide/vue'
  import { contentPath, type SpaceContent } from '~/features/space/space'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

  defineOptions({ name: 'SpaceContentList' })

  defineProps<{ items: SpaceContent[]; emptyText: string }>()
</script>

<template>
  <Stack v-if="items.length" gap="none">
    <NuxtLink
      v-for="item in items"
      :key="`${item.content_type}:${item.id}`"
      :to="contentPath(item)"
      class="group flex gap-4 border-b border-line py-4 last:border-b-0"
    >
      <Stack gap="xs" class="min-w-0 flex-1">
        <Text
          weight="semibold"
          class="line-clamp-2 leading-snug transition-colors group-hover:text-accent-text"
        >
          {{ item.title }}
        </Text>
        <Text v-if="item.excerpt" size="sm" tone="muted" class="line-clamp-2 leading-relaxed">
          {{ item.excerpt }}
        </Text>
        <Inline gap="md" class="mt-auto pt-1">
          <Inline as="span" gap="xs">
            <Eye class="size-3.5 text-muted" />
            <Text as="span" size="xs" tone="muted">{{ item.view_count }}</Text>
          </Inline>
          <Inline as="span" gap="xs">
            <Heart class="size-3.5 text-muted" />
            <Text as="span" size="xs" tone="muted">{{ item.like_count }}</Text>
          </Inline>
          <Text as="span" size="xs" tone="muted">
            {{ datePartFormat(item.created_at, TimeFormatEnum.M_D_CN) }}
          </Text>
        </Inline>
      </Stack>
      <HikariImage
        v-if="item.cover"
        :src="item.cover.src"
        :alt="item.title"
        class="h-24 w-36 shrink-0 rounded-lg bg-inset"
        image-class="size-full object-cover"
        :processing="{ width: 288, height: 192, fit: 'cover', quality: 80 }"
      />
    </NuxtLink>
  </Stack>
  <SpaceEmptyState v-else :icon="FileText" :text="emptyText" />
</template>
