<script setup lang="ts">
  import { Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { checkFieldLabel, type BackendCheckField } from '~/features/creator/check'

  defineProps<{ fields: BackendCheckField[]; resourceType: string }>()
</script>

<template>
  <Stack v-if="fields.length" gap="xs">
    <Heading :level="3" size="sm">未核实的值</Heading>
    <Text size="sm" tone="muted">
      这些值无法从核对读取的来源中得到确认，因此均未选中。请打开链接自行判断。
    </Text>
    <Stack as="ul" gap="xs">
      <Inline v-for="field in fields" :key="field.field" as="li" gap="sm" align="center">
        <Text as="span" size="sm" tone="muted">{{
          checkFieldLabel(field.field, resourceType)
        }}</Text>
        <Text as="span" size="sm">{{ field.display }}</Text>
        <CreatorReviewCheckSource v-if="field.source" :source="field.source" />
        <Tag size="sm" tone="neutral">未核实</Tag>
      </Inline>
    </Stack>
  </Stack>
</template>
