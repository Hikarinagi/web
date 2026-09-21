<script setup lang="ts">
  import {
    Chip,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Inline,
    Link,
    Text,
  } from '@hina-ui/vue'
  import type { EntityContributors, EntityDetail, EntityKind } from '~/features/entity/entity'
  import { buildInfoRows, buildSourceLinks } from '~/features/entity/info'

  defineOptions({ name: 'EntityLabelsPanel' })
  const props = withDefaults(
    defineProps<{
      kind: EntityKind
      entity: EntityDetail
      title?: string
      contributors?: EntityContributors | null
      updatedAt?: string | null
    }>(),
    { title: '资料', contributors: null, updatedAt: null },
  )

  const rows = computed(() => buildInfoRows(props.kind, props.entity, props.entity.labels))
  const sourceLinks = computed(() => buildSourceLinks(props.kind, props.entity))
  const hasContributors = computed(() =>
    Boolean(props.contributors && props.contributors.count > 0),
  )
</script>

<template>
  <ResourceArchiveCard
    v-if="rows.length || sourceLinks.length || hasContributors"
    :title="rows.length ? title : null"
    :footer-separated="Boolean(rows.length || sourceLinks.length)"
  >
    <DescriptionList v-if="rows.length" class="flex flex-col gap-2.5 px-5 py-3.5 text-sm">
      <Inline v-for="row in rows" :key="row.key" align="start" gap="none" class="gap-2.5">
        <DescriptionTerm class="w-16 shrink-0 text-faint">{{ row.key }}</DescriptionTerm>
        <DescriptionDetails class="min-w-0 flex-1">
          <Link
            v-if="row.href"
            :href="row.href"
            target="_blank"
            rel="noopener noreferrer"
            class="wrap-anywhere"
          >
            {{ row.value }}
          </Link>
          <Text v-else as="span" size="sm" class="wrap-anywhere">{{ row.value }}</Text>
        </DescriptionDetails>
      </Inline>
    </DescriptionList>

    <Inline v-if="sourceLinks.length" gap="sm" :class="rows.length ? 'px-5 pb-4' : 'px-5 py-4'">
      <Chip
        v-for="link in sourceLinks"
        :key="link.label"
        as="a"
        variant="outline"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ link.label }}
      </Chip>
    </Inline>

    <template v-if="hasContributors" #footer>
      <ResourceArchiveContributorFooter
        :contributors="contributors"
        :resource-type="kind"
        :resource-id="entity.id"
        :updated-at="updatedAt"
        :standalone="!rows.length && !sourceLinks.length"
      />
    </template>
  </ResourceArchiveCard>
</template>
