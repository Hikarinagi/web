<script setup lang="ts">
  import { Button, Chip, Inline } from '@hina-ui/vue'
  import { Hash } from '@lucide/vue'
  import type { BrowseChip } from '~/features/browse/filter'

  defineOptions({ name: 'BrowseConditions' })
  defineProps<{ chips: BrowseChip[] }>()
  const emit = defineEmits<{ clear: [] }>()
</script>

<template>
  <ScrollRail v-if="chips.length" class="min-w-0">
    <Inline gap="sm" align="center" :wrap="false" class="w-max sm:w-full sm:flex-wrap">
      <Chip
        v-for="chip in chips"
        :key="chip.key"
        removable
        class="shrink-0"
        @remove="chip.remove()"
      >
        <template v-if="chip.tag" #icon><Hash /></template>
        {{ chip.label }}
      </Chip>
      <Button
        v-if="chips.length > 1"
        variant="link"
        size="sm"
        class="shrink-0"
        @click="emit('clear')"
      >
        清除全部
      </Button>
    </Inline>
  </ScrollRail>
</template>
