<script setup lang="ts">
  import {
    Button,
    Dialog,
    Inline,
    Section,
    Stack,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { BookImage, BookOpen, CircleHelp, History } from '@lucide/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import { useContributeKind } from '~/features/contribute/useContributeKind'
  import { useNovelIntake } from '~/features/contribute/useNovelIntake'
  import NovelSlip from './novel/Slip.vue'

  defineProps<{ data: ContributePageData; dragging: boolean }>()
  const emit = defineEmits<{ selected: [value: boolean]; active: [value: boolean] }>()

  const kind = useContributeKind()
  const intake = useNovelIntake()
  const help = ref(false)
  const novel = useTemplateRef<InstanceType<typeof NovelSlip>>('novel')
  const SLIP = 'lg:sticky lg:top-(--contribute-slip-top) lg:w-88 lg:shrink-0'

  watchEffect(() => emit('selected', kind.value === 'novel' && intake.items.value.length > 0))

  async function receive(files: File[]) {
    kind.value = 'novel'
    const upload = await until(novel).toBeTruthy({ timeout: 2000 })
    upload?.receive(files)
  }

  defineExpose({ receive })
</script>

<template>
  <Tabs
    :model-value="kind"
    size="lg"
    @update:model-value="value => (kind = value === 'manga' ? 'manga' : 'novel')"
  >
    <Inline align="stretch" gap="none" :wrap="false">
      <TabsList label="投稿类型" class="min-w-0 flex-1">
        <TabsTrigger value="novel" class="text-base [&_svg]:size-5"><BookOpen />小说</TabsTrigger>
        <TabsTrigger value="manga" class="text-base [&_svg]:size-5"><BookImage />漫画</TabsTrigger>
      </TabsList>
      <Inline align="center" gap="xs" :wrap="false" class="border-b border-line">
        <Button :as="NuxtLink" to="/create/projects" variant="ghost" tone="neutral" size="sm">
          <History />
          <Text as="span" size="sm" class="max-sm:sr-only">我的投稿</Text>
        </Button>
        <Button variant="ghost" tone="neutral" size="sm" @click="help = true">
          <CircleHelp />
          <Text as="span" size="sm" class="max-sm:sr-only">投稿指南</Text>
        </Button>
      </Inline>
    </Inline>

    <TabsContent value="novel" class="pt-6">
      <Stack gap="xl" class="lg:flex-row lg:items-start">
        <ContributeUploadDesk :dragging="dragging" :class="SLIP" @active="emit('active', $event)">
          <NovelSlip ref="novel" :intake="intake" :dragging="dragging" />
        </ContributeUploadDesk>
        <Stack gap="xl" class="min-w-0 flex-1">
          <Section title="正在征集">
            <ContributeNovelList :volumes="data.volumes" :target="data.target" />
          </Section>
          <ContributeContributors :contributors="data.contributors.novel" />
        </Stack>
      </Stack>
    </TabsContent>

    <TabsContent value="manga" class="pt-6">
      <Stack gap="xl" class="lg:flex-row lg:items-start">
        <ContributeUploadDesk :class="SLIP" @active="emit('active', $event)">
          <ContributeMangaSlip :series="data.manga" />
        </ContributeUploadDesk>
        <Stack gap="xl" class="min-w-0 flex-1">
          <Section title="正在征集">
            <ContributeMangaList :chapters="data.chapters" :volumes="data.manga_volumes" />
          </Section>
          <ContributeContributors :contributors="data.contributors.manga" />
        </Stack>
      </Stack>
    </TabsContent>
  </Tabs>

  <Dialog v-model:open="help" :title="kind === 'manga' ? '漫画投稿指南' : '小说投稿指南'" size="lg">
    <template #content>
      <ContributeGuide :kind="kind" />
    </template>
  </Dialog>
</template>
