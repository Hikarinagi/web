<script setup lang="ts">
  import {
    Button as HnButton,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { langLabel } from '~/features/galgame/labels'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameFacts' })
  const props = defineProps<{
    data: GalgamePageData
    website?: string
    languages: string[]
  }>()

  const { t } = useLocaleText()
  const values = (property: string) =>
    props.data.facts.find(fact => fact.property === property)?.values ?? []
  const scopeOf = (publisher: GalgamePageData['display']['publishers'][number]) =>
    formatList([...publisher.platforms.map(platformLabel), ...publisher.languages.map(langLabel)])
  const genre = computed(() => values('GENRE_TEXT')[0]?.text)
  const aliases = computed(() => values('ALIAS').map(value => value.text))
  const allAliases = ref(false)
  const shownAliases = computed(() =>
    allAliases.value ? aliases.value : aliases.value.slice(0, 3),
  )
  const host = computed(() => props.website?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))
</script>

<template>
  <DescriptionList
    orientation="horizontal"
    class="gap-x-4 gap-y-2 text-sm [&_dd]:text-fg [&_dt]:text-muted"
  >
    <template v-if="data.display.brands.length">
      <DescriptionTerm>{{ t('galgame.facts.developer') }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <template v-for="brand in data.display.brands" :key="brand.text">
            <Link
              v-if="brand.producer_id"
              :as="NuxtLink"
              :to="`/producers/${brand.producer_id}`"
              tone="neutral"
              class="self-start"
              lang="ja"
            >
              {{ brand.text }}
            </Link>
            <Text v-else as="span" size="sm" lang="ja">{{ brand.text }}</Text>
          </template>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="data.display.publishers.length">
      <DescriptionTerm>{{ t('galgame.facts.publisher') }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="xs">
          <Stack
            v-for="publisher in data.display.publishers"
            :key="`${publisher.producer_id ?? ''}|${publisher.text}`"
            gap="none"
          >
            <Link
              v-if="publisher.producer_id"
              :as="NuxtLink"
              :to="`/producers/${publisher.producer_id}`"
              tone="neutral"
              class="self-start"
              lang="ja"
            >
              {{ publisher.text }}
            </Link>
            <Text v-else as="span" size="sm" lang="ja">{{ publisher.text }}</Text>
            <Text v-if="!publisher.original && scopeOf(publisher)" as="span" size="xs" tone="muted">
              {{ scopeOf(publisher) }}
            </Text>
          </Stack>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="data.display.release?.text">
      <DescriptionTerm>{{ t('galgame.facts.release') }}</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ data.display.release?.text }}</DescriptionDetails>
    </template>
    <template v-if="genre">
      <DescriptionTerm>{{ t('galgame.facts.genre') }}</DescriptionTerm>
      <DescriptionDetails :lang="data.galgame.origin_lang || undefined">{{
        genre
      }}</DescriptionDetails>
    </template>
    <template v-if="data.display.platforms.length">
      <DescriptionTerm>{{ t('galgame.facts.platform') }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Text v-for="code in data.display.platforms" :key="code" as="span" size="sm">
            {{ platformLabel(code) }}
          </Text>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="languages.length">
      <DescriptionTerm>{{ t('galgame.facts.language') }}</DescriptionTerm>
      <DescriptionDetails>{{ formatList(languages) }}</DescriptionDetails>
    </template>
    <template v-if="website">
      <DescriptionTerm>{{ t('galgame.facts.website') }}</DescriptionTerm>
      <DescriptionDetails class="min-w-0">
        <Link
          as="a"
          :href="website"
          target="_blank"
          rel="noopener noreferrer"
          tone="neutral"
          class="block truncate"
        >
          {{ host }}
        </Link>
      </DescriptionDetails>
    </template>
    <template v-if="aliases.length">
      <DescriptionTerm>{{ t('galgame.facts.alias') }}</DescriptionTerm>
      <DescriptionDetails class="wrap-anywhere">
        <Stack gap="none">
          <Text v-for="alias in shownAliases" :key="alias" as="span" size="sm">{{ alias }}</Text>
          <HnButton
            v-if="aliases.length > 3"
            variant="link"
            size="sm"
            class="self-start"
            @click="allAliases = !allAliases"
          >
            {{
              allAliases
                ? t('galgame.facts.collapse')
                : t('galgame.facts.moreAliases', { count: aliases.length - 3 })
            }}
          </HnButton>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
