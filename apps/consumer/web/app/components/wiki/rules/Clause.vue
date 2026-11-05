<script setup lang="ts">
  import { Prose } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'
  import type { RuleClause } from '~/features/wiki/rules'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiRulesClause' })

  const props = defineProps<{ clause: RuleClause; active: boolean }>()
  const root = useTemplateRef<ComponentPublicInstance>('root')

  onMounted(() =>
    watch(
      () => props.active,
      active => {
        if (active) (root.value?.$el as HTMLElement | undefined)?.scrollIntoView({ block: 'start' })
      },
      { immediate: true },
    ),
  )
</script>

<template>
  <Prose
    ref="root"
    as-child
    :class="cn('scroll-mt-4 rounded-md px-3 py-1', active && 'bg-accent-soft')"
  >
    <div :id="`clause-${clause.id}`" v-html="clause.html" />
  </Prose>
</template>
