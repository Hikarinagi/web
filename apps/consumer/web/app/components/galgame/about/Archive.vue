<script setup lang="ts">
  import { DescriptionDetails, DescriptionList, DescriptionTerm, Inline, Link } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { langLabel } from '~/features/galgame/labels'

  defineOptions({ name: 'GalgameAboutArchive' })
  const props = defineProps<{
    galgame: GalgamePageData['galgame']
    facts: GalgamePageData['facts']
    display: GalgamePageData['display']
    contributors: GalgamePageData['contributors']
  }>()

  const values = (property: string) =>
    props.facts.find(fact => fact.property === property)?.values ?? []
  const joined = (property: string) =>
    values(property)
      .map(value => (property === 'LANGUAGE' ? langLabel(value.code ?? value.text) : value.text))
      .join('、')
  const external = computed(() =>
    values('EXTERNAL_LINK').flatMap(value =>
      value.code === 'VNDB'
        ? [{ label: 'VNDB', href: `https://vndb.org/${value.text}` }]
        : value.code === 'BANGUMI'
          ? [{ label: 'Bangumi', href: `https://bgm.tv/subject/${value.text}` }]
          : [],
    ),
  )
  const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')
</script>

<template>
  <ResourceArchiveCard>
    <DescriptionList orientation="horizontal" class="px-5 py-4 text-sm [&>dt]:text-muted">
      <template v-if="values('GENRE_TEXT').length">
        <DescriptionTerm>类型说明</DescriptionTerm>
        <DescriptionDetails lang="ja">{{ joined('GENRE_TEXT') }}</DescriptionDetails>
      </template>
      <template v-if="values('RELEASE_DATE').length">
        <DescriptionTerm>发售日</DescriptionTerm>
        <DescriptionDetails>{{ joined('RELEASE_DATE') }}</DescriptionDetails>
      </template>
      <template v-if="values('LANGUAGE').length">
        <DescriptionTerm>语言</DescriptionTerm>
        <DescriptionDetails>{{ joined('LANGUAGE') }}</DescriptionDetails>
      </template>
      <template v-if="display.brands.length">
        <DescriptionTerm>开发</DescriptionTerm>
        <DescriptionDetails v-for="(brand, index) in display.brands" :key="index">
          <Link
            v-if="brand.producer_id"
            :as="NuxtLink"
            :to="`/producers/${brand.producer_id}`"
            tone="accent"
          >
            {{ brand.text }}
          </Link>
          <template v-else>{{ brand.text }}</template>
        </DescriptionDetails>
      </template>
      <template v-if="values('WEBSITE').length">
        <DescriptionTerm>官网</DescriptionTerm>
        <DescriptionDetails
          v-for="(value, index) in values('WEBSITE')"
          :key="index"
          class="min-w-0 truncate"
        >
          <Link as="a" :href="value.text" target="_blank" rel="noopener noreferrer" tone="accent">
            {{ host(value.text) }}
          </Link>
        </DescriptionDetails>
      </template>
      <template v-if="values('ALIAS').length">
        <DescriptionTerm>别名</DescriptionTerm>
        <DescriptionDetails class="wrap-anywhere">{{ joined('ALIAS') }}</DescriptionDetails>
      </template>
    </DescriptionList>

    <Inline v-if="external.length" gap="sm" class="px-5 pb-4">
      <ResourceArchiveExternalChip v-for="item in external" :key="item.label" :href="item.href">
        {{ item.label }}
      </ResourceArchiveExternalChip>
    </Inline>

    <template #footer>
      <ResourceArchiveContributorFooter
        :contributors="contributors"
        resource-type="galgame"
        :resource-id="galgame.id"
        :updated-at="galgame.revised_at ?? galgame.created_at"
      />
    </template>
  </ResourceArchiveCard>
</template>
