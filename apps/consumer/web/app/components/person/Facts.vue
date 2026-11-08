<script setup lang="ts">
  import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Link,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type { PeoplePageData } from '~~/server/api/pages/people/[id].get'
  import { websiteLabel } from '~/features/person/site'

  defineOptions({ name: 'PersonFacts' })
  defineProps<{ person: PeoplePageData['person']; years: string | null }>()
</script>

<template>
  <DescriptionList
    orientation="horizontal"
    class="gap-x-4 gap-y-2 text-sm [&_dd]:text-fg [&_dt]:text-muted"
  >
    <DescriptionTerm>名字</DescriptionTerm>
    <DescriptionDetails lang="ja">{{ person.name }}</DescriptionDetails>
    <template v-if="person.aliases.length">
      <DescriptionTerm>别名</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Text v-for="alias in person.aliases" :key="alias" as="span" size="sm" lang="ja">
            {{ alias }}
          </Text>
        </Stack>
      </DescriptionDetails>
    </template>
    <template v-if="person.gender">
      <DescriptionTerm>性别</DescriptionTerm>
      <DescriptionDetails>{{ person.gender }}</DescriptionDetails>
    </template>
    <template v-if="years">
      <DescriptionTerm>作品年份</DescriptionTerm>
      <DescriptionDetails class="tabular-nums">{{ years }}</DescriptionDetails>
    </template>
    <template v-if="person.websites.length">
      <DescriptionTerm>官网</DescriptionTerm>
      <DescriptionDetails>
        <Stack gap="none">
          <Link
            v-for="site in person.websites"
            :key="site.url"
            as="a"
            :href="site.url"
            target="_blank"
            rel="noopener noreferrer"
            class="self-start"
          >
            {{ websiteLabel(site.code) }}
          </Link>
        </Stack>
      </DescriptionDetails>
    </template>
  </DescriptionList>
</template>
