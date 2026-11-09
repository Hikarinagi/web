<script setup lang="ts">
  import { Button, Divider, Flex, Heading, IconButton, Inline, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ChevronLeft, PanelRight } from '@lucide/vue'
  import { projectKind } from '~/features/workbench/manga/labels'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { projectEpisode, seriesTitle } from '~/features/workbench/manga/series'

  defineProps<{ narrow: boolean; approving: boolean }>()
  const emit = defineEmits<{ reject: []; approve: []; aside: [] }>()

  const { project } = useMangaReview()
  const reviewing = computed(
    () => project.value.status === 'REVIEW' && project.value.viewer_reviewer,
  )
</script>

<template>
  <Inline
    as="header"
    gap="sm"
    align="center"
    :wrap="false"
    class="h-14 shrink-0 border-b border-line bg-surface pr-4 pl-2 lg:gap-3"
  >
    <IconButton
      :as="NuxtLink"
      to="/create/manga-review"
      label="返回审核列表"
      variant="ghost"
      tone="neutral"
    >
      <ChevronLeft />
    </IconButton>
    <Flex direction="col" class="min-w-0 shrink">
      <Heading :level="1" size="sm" class="truncate">{{ seriesTitle(project.series) }}</Heading>
      <Text size="sm" tone="muted" truncate>{{ projectEpisode(project) }}</Text>
    </Flex>
    <Inline gap="xs" align="center" :wrap="false" class="shrink-0 max-md:hidden">
      <Tag size="sm" variant="soft" tone="neutral">{{ projectKind(project) }}</Tag>
      <Tag v-if="project.replaces" size="sm" variant="soft" tone="info">替换现有版本</Tag>
    </Inline>
    <Inline gap="sm" align="center" justify="end" :wrap="false" class="ml-auto min-w-0">
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0 max-lg:hidden">
        <Avatar :user="project.owner" size="sm" />
        <UserName :user="project.owner" :handle="false" class="truncate text-sm" />
        <Text v-if="project.submitted_at" size="sm" tone="muted" class="whitespace-nowrap">
          提交于 {{ timeBrief(project.submitted_at) }}
        </Text>
      </Inline>
      <IconButton
        v-if="narrow"
        label="检查与批注"
        variant="ghost"
        tone="neutral"
        @click="emit('aside')"
      >
        <PanelRight />
      </IconButton>
      <template v-if="reviewing">
        <Divider orientation="vertical" class="h-6 max-lg:hidden" />
        <Button variant="soft" tone="danger" :disabled="approving" @click="emit('reject')">
          退回
        </Button>
        <Button :loading="approving" @click="emit('approve')">
          {{ project.replaces ? '通过并替换' : '通过' }}
        </Button>
      </template>
    </Inline>
  </Inline>
</template>
