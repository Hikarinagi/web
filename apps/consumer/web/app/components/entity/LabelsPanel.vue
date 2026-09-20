<script setup lang="ts">
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
    <template v-if="rows.length">
      <dl class="flex flex-col gap-2.5 px-5 py-3.5 text-[13px]">
        <div v-for="row in rows" :key="row.key" class="flex items-start gap-2.5">
          <dt class="w-16 shrink-0 text-surface-400">{{ row.key }}</dt>
          <dd class="min-w-0 flex-1">
            <a
              v-if="row.href"
              :href="row.href"
              target="_blank"
              rel="noopener noreferrer"
              class="wrap-anywhere text-sky-700 hover:underline dark:text-sky-400"
            >
              {{ row.value }}
            </a>
            <span v-else class="wrap-anywhere text-surface-700 dark:text-surface-300">
              {{ row.value }}
            </span>
          </dd>
        </div>
      </dl>
    </template>

    <div v-if="sourceLinks.length" class="flex gap-2 px-5 pb-4" :class="{ 'pt-4': !rows.length }">
      <a
        v-for="link in sourceLinks"
        :key="link.label"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-md border border-surface-200 px-2.5 py-1 text-[11px] font-semibold text-surface-600 transition-colors hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800"
      >
        {{ link.label }}
      </a>
    </div>

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
