<script setup lang="ts">
  import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    DisclosureIcon,
    Grid,
    IconButton,
    Inline,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type { ReferenceField } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperReferenceSchemaFields' })
  defineProps<{ fields: ReferenceField[] }>()
</script>

<template>
  <Stack gap="none" class="divide-y divide-line">
    <Collapsible v-for="field in fields" :key="field.name">
      <Stack gap="none" class="py-2">
        <Grid :cols="1" class="gap-1 sm:grid-cols-3 sm:gap-3">
          <Inline as="span" gap="xs" align="center" :wrap="false" class="min-w-0 font-mono text-sm">
            <CollapsibleTrigger v-if="field.children?.length" as-child>
              <IconButton
                size="sm"
                :tooltip="false"
                :label="`${field.name} 的子字段`"
                class="-ms-1.5 shrink-0"
              >
                <DisclosureIcon direction="end" />
              </IconButton>
            </CollapsibleTrigger>
            <Text as="span" size="sm" class="min-w-0 font-mono break-words">
              {{ field.name }}
              <Text v-if="field.required" as="span" size="sm" tone="danger">*</Text>
            </Text>
          </Inline>
          <Text as="span" size="xs" tone="muted" class="font-mono break-words">
            {{ field.type }}
          </Text>
          <Text as="span" size="sm" tone="muted">{{ field.description }}</Text>
        </Grid>

        <DescriptionList
          v-if="field.enumValues?.length"
          class="mt-1.5 flex flex-col gap-1 rounded bg-subtle px-3 py-2"
        >
          <Inline
            v-for="item in field.enumValues"
            :key="item.value"
            gap="md"
            align="start"
            :wrap="false"
          >
            <DescriptionTerm class="w-44 shrink-0 font-mono text-xs">
              {{ item.value }}
            </DescriptionTerm>
            <DescriptionDetails class="min-w-0 text-xs text-muted">
              {{ item.label }}
            </DescriptionDetails>
          </Inline>
        </DescriptionList>

        <CollapsibleContent v-if="field.children?.length">
          <Stack gap="none" class="mt-2 border-s-2 border-line ps-4">
            <DeveloperReferenceSchemaFields :fields="field.children" />
          </Stack>
        </CollapsibleContent>
      </Stack>
    </Collapsible>
  </Stack>
</template>
