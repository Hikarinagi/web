<script setup lang="ts">
  import { Button, Card, Heading, Inline, Progress, Stack, Tag, Text } from '@hina-ui/vue'
  import { ExternalLink, Volume2 } from '@lucide/vue'
  import type { GalgameSteamData } from '~~/server/api/pages/galgames/[id]/steam.get'

  defineOptions({ name: 'GalgameAboutSteamCard' })
  const props = defineProps<{ app: GalgameSteamData['apps'][number] }>()

  const credit = computed(() => {
    const publishers = props.app.publishers.filter(name => !props.app.developers.includes(name))
    return [props.app.release_date, props.app.developers.join('、'), publishers.join('、')]
      .filter(Boolean)
      .join(' · ')
  })

  const reviewTone = computed(() => {
    const percent = props.app.review?.percent ?? 0
    if (percent >= 80) return 'success' as const
    if (percent >= 40) return 'warning' as const
    return 'danger' as const
  })

  const tags = computed(() => {
    const plain = [
      ...props.app.platforms,
      props.app.achievements > 0 ? `${props.app.achievements} 个成就` : '',
      props.app.has_demo ? '有体验版' : '',
    ].filter(Boolean)

    return [
      ...props.app.languages.map(language => ({
        key: `language-${language.name}`,
        label: language.name,
        highlight: language.name.includes('中文'),
        audio: language.full_audio,
      })),
      ...plain.map(label => ({ key: label, label, highlight: false, audio: false })),
    ]
  })
</script>

<template>
  <Card as="article" :padded="false" class="overflow-hidden">
    <Inline gap="none" align="stretch" :wrap="false" class="flex-col gap-4 p-4 sm:flex-row">
      <HikariImage
        :src="app.header_image"
        :alt="app.name"
        class="aspect-92/43 w-full shrink-0 overflow-hidden rounded-lg sm:w-64"
        image-class="size-full object-cover"
      />

      <Stack gap="sm" class="min-w-0 flex-1">
        <Inline gap="none" align="start" justify="between" :wrap="false" class="gap-3">
          <Heading :level="4" size="base" class="min-w-0">{{ app.name }}</Heading>
          <Inline gap="sm" align="center" :wrap="false" class="shrink-0">
            <Tag v-if="app.region_locked" tone="warning">国区不可用</Tag>
            <template v-else-if="app.is_free || app.price">
              <Tag v-if="app.price && app.price.discount_percent > 0" tone="success">
                -{{ app.price.discount_percent }}%
              </Tag>
              <Text
                v-if="app.price?.original"
                as="span"
                size="xs"
                tone="faint"
                class="line-through"
              >
                {{ app.price.original }}
              </Text>
              <Text as="span" size="sm" weight="semibold">
                {{ app.price ? app.price.final : '免费' }}
              </Text>
            </template>
          </Inline>
        </Inline>

        <Text v-if="app.short_description" as="p" size="sm" tone="muted" class="line-clamp-2">
          {{ app.short_description }}
        </Text>

        <Text v-if="credit" as="p" size="sm" tone="muted">{{ credit }}</Text>

        <Button
          as="a"
          :href="app.url"
          target="_blank"
          rel="noopener noreferrer"
          variant="soft"
          tone="neutral"
          size="sm"
          class="mt-auto self-start"
        >
          <template #icon><ExternalLink /></template>
          在 Steam 上查看
        </Button>
      </Stack>
    </Inline>

    <Stack v-if="app.review || tags.length" gap="sm" class="border-t border-line bg-subtle p-4">
      <Progress
        v-if="app.review"
        :value="app.review.percent"
        :label="app.review.desc"
        :tone="reviewTone"
        show-value
        size="sm"
      />

      <Inline gap="sm" align="center" justify="between" wrap>
        <Inline v-if="tags.length" gap="xs" wrap>
          <Tag v-for="tag in tags" :key="tag.key" :tone="tag.highlight ? 'accent' : 'neutral'">
            {{ tag.label }}
            <Volume2 v-if="tag.audio" v-tooltip="'含完整语音'" :size="11" />
          </Tag>
        </Inline>

        <Text v-if="app.review" as="p" size="xs" tone="muted">
          {{ app.review.total.toLocaleString('zh-CN') }} 条评价
        </Text>
      </Inline>
    </Stack>
  </Card>
</template>
