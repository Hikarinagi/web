<script setup lang="ts">
  import { Card, Center, Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { Circle, CircleDot, FileText } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { timeFromNow } from '~/utils/time-format'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'ArticleEditorDraftChooserItem' })

  defineProps<{
    draft: ApiData<'/api/v3/user/me/drafts', 'get'>['items'][number]
    selected: boolean
  }>()
  defineEmits<{ select: [] }>()
</script>

<template>
  <Card
    as="button"
    type="button"
    :padded="false"
    :aria-pressed="selected"
    :class="
      cn(
        'hn-state-layer w-full hn-interactive p-2.5 text-start hn-press-lg',
        selected && 'border-accent bg-accent-soft',
      )
    "
    @click="$emit('select')"
  >
    <Ripple />
    <Inline gap="sm" align="center" class="min-w-0">
      <component
        :is="selected ? CircleDot : Circle"
        aria-hidden="true"
        :class="cn('size-4.5 shrink-0', selected ? 'text-accent' : 'text-faint')"
      />

      <Stack gap="xs" class="min-w-0 flex-1">
        <Text as="span" size="sm" weight="medium" truncate>{{ draft.title || '无标题' }}</Text>
        <Text as="span" size="xs" tone="muted" class="line-clamp-2">
          {{ draft.excerpt || '暂无内容' }}
        </Text>
        <Text as="span" size="xs" tone="faint">
          {{ timeFromNow(draft.updated_at) }} · {{ draft.char_count }} 字
        </Text>
      </Stack>

      <HikariImage
        v-if="draft.cover"
        :src="draft.cover.src"
        alt=""
        class="aspect-2/1 w-20 shrink-0 overflow-hidden rounded-md border border-line"
        image-class="size-full object-cover"
        :processing="{ q: 60 }"
      />
      <Center v-else class="aspect-2/1 w-20 shrink-0 rounded-md bg-inset text-faint">
        <FileText class="size-4.5" aria-hidden="true" />
      </Center>
    </Inline>
  </Card>
</template>
