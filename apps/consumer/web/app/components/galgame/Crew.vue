<script setup lang="ts">
  import { Button as HnButton, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { creditGroupLabel, sharedSongKind, titleText } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameCrew' })
  const props = defineProps<{ credits: GalgamePageData['credits'] }>()

  const all = ref(false)
  const groups = computed(() =>
    props.credits.groups.filter(group => !['DEVELOPER', 'PUBLISHER'].includes(group.code)),
  )
  const others = computed(() => groups.value.find(group => group.code === 'OTHER'))
  const shown = computed(() =>
    all.value ? groups.value : groups.value.filter(group => group.code !== 'OTHER'),
  )
  const hasContent = computed(() => groups.value.length > 0 || props.credits.translators.length > 0)
</script>

<template>
  <template v-if="hasContent">
    <EntrySectionHead id="credits" title="制作信息">
      <template v-if="credits.product" #actions>
        <Text size="sm" tone="muted">
          取自首发版
          <Link
            :as="NuxtLink"
            :to="{ query: { product: String(credits.product.id) } }"
            replace
            tone="neutral"
            lang="ja"
          >
            {{ titleText(credits.product.title) }}
          </Link>
        </Text>
      </template>
    </EntrySectionHead>
    <Stack gap="sm" class="sm:block sm:columns-2 sm:gap-x-8">
      <Inline
        v-for="group in shown"
        :key="group.code"
        gap="md"
        align="baseline"
        :wrap="false"
        class="break-inside-avoid sm:pb-2.5"
      >
        <Text size="sm" tone="muted" class="w-20 shrink-0">
          {{ creditGroupLabel(group.code, group.credits) }}
        </Text>
        <Inline gap="none" class="min-w-0 gap-x-3 text-sm">
          <GalgameCrewName
            v-for="(credit, index) in group.credits"
            :key="index"
            :credit="credit"
            :plain="Boolean(sharedSongKind(group.credits))"
          />
        </Inline>
      </Inline>
      <Inline
        v-if="credits.translators.length"
        gap="md"
        align="baseline"
        :wrap="false"
        class="break-inside-avoid sm:pb-2.5"
      >
        <Text size="sm" tone="muted" class="w-20 shrink-0">非官方翻译</Text>
        <Inline gap="none" class="min-w-0 gap-x-3 text-sm">
          <GalgameCrewName
            v-for="(credit, index) in credits.translators"
            :key="index"
            :credit="credit"
          />
        </Inline>
      </Inline>
    </Stack>
    <HnButton v-if="others" variant="link" size="sm" class="self-start" @click="all = !all">
      {{ all ? '收起其他制作人员' : `其他制作人员 ${others.credits.length}` }}
    </HnButton>
  </template>
</template>
