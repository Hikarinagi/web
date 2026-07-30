<script setup lang="ts">
  import type { EntityContributors, EntityDetail, EntityKind } from '~/features/entity/entity'

  defineOptions({ name: 'EntityAbout' })
  const props = withDefaults(
    defineProps<{
      kind: EntityKind
      entity: EntityDetail
      contributors?: EntityContributors | null
    }>(),
    { contributors: null },
  )

  const intro = computed(() => props.entity.trans_intro || props.entity.intro)
  const origin = computed(() =>
    props.entity.trans_intro &&
    props.entity.intro &&
    props.entity.intro !== props.entity.trans_intro
      ? props.entity.intro
      : '',
  )
</script>

<template>
  <EntitySection title="简介">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <EntityIntro :text="intro" :original="origin" />
      <EntityLabelsPanel
        :kind="kind"
        :entity="entity"
        :contributors="contributors"
        :updated-at="entity.revised_at ?? entity.created_at"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]"
      />
    </div>
  </EntitySection>
</template>
