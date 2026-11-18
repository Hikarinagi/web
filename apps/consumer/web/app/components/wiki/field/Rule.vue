<script setup lang="ts">
  import { DescriptionDetails, DescriptionList, DescriptionTerm, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'WikiFieldRule' })

  defineProps<{ label: string; clauses: string[]; notes?: { term: string; text: string }[] }>()
</script>

<template>
  <Question :title="label" :aria-label="`查看${label}的编辑规范`" size="md">
    <Stack gap="md">
      <DescriptionList v-if="notes?.length" orientation="horizontal" class="text-sm">
        <template v-for="note in notes" :key="note.term">
          <DescriptionTerm>{{ note.term }}</DescriptionTerm>
          <DescriptionDetails>{{ note.text }}</DescriptionDetails>
        </template>
      </DescriptionList>
      <WikiFieldClauses :clauses="clauses" />
    </Stack>
  </Question>
</template>
