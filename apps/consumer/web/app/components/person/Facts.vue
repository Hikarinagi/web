<script setup lang="ts">
  import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Inline,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type { PeoplePageData } from '~~/server/api/pages/people/[id].get'
  import { websiteLabel } from '~/features/person/site'

  defineOptions({ name: 'PersonFacts' })
  defineProps<{ person: PeoplePageData['person']; years: string | null }>()

  const { t } = useLocaleText()
</script>

<template>
  <DescriptionList
    orientation="horizontal"
    class="gap-x-4 gap-y-2 text-sm [&_dd]:text-fg [&_dt]:text-muted"
  >
    <DescriptionTerm>{{ t('entity.person.name') }}</DescriptionTerm>
    <DescriptionDetails lang="ja">{{ person.name }}</DescriptionDetails>
    <template v-if="person.trans_name">
      <DescriptionTerm>{{ t('entity.person.chineseName') }}</DescriptionTerm>
      <DescriptionDetails>{{ person.trans_name }}</DescriptionDetails>
    </template>
    <template v-if="person.aliases.length">
      <DescriptionTerm>{{ t('entity.person.aliases') }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Text v-for="alias in person.aliases" :key="alias" as="span" size="sm" lang="ja">
            {{ alias }}
          </Text>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="person.gender">
      <DescriptionTerm>{{ t('entity.person.gender') }}</DescriptionTerm>
      <DescriptionDetails>{{ person.gender }}</DescriptionDetails>
    </template>
    <template v-if="years">
      <DescriptionTerm>{{ t('entity.person.years') }}</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ years }}</DescriptionDetails>
    </template>
    <template v-if="person.websites.length">
      <DescriptionTerm>{{ t('entity.person.websites') }}</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Inline
            v-for="site in person.websites"
            :key="site.url"
            gap="xs"
            align="baseline"
            :wrap="false"
            class="min-w-0"
          >
            <Text as="span" size="sm" tone="muted" class="shrink-0">
              {{ websiteLabel(site.code) }}
            </Text>
            <Link
              as="a"
              :href="site.url"
              target="_blank"
              rel="noopener noreferrer"
              class="truncate"
            >
              {{ site.name }}
            </Link>
          </Inline>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
