<script setup lang="ts">
  import {
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Heading,
    Inline,
    Kbd,
    List,
    ListItem,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type { GuideSection } from '~/features/workbench/guide'

  defineProps<{ sections: GuideSection[] }>()
</script>

<template>
  <Stack gap="lg" class="text-fg">
    <Stack v-for="section in sections" :key="section.title" gap="sm">
      <Heading :level="3" size="sm">{{ section.title }}</Heading>
      <template v-if="section.keys">
        <DescriptionList
          class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 [&>dd]:m-0! [&>dt]:m-0!"
        >
          <template v-for="key in section.keys" :key="key.text">
            <DescriptionTerm>
              <Inline gap="xs" align="center" :wrap="false">
                <template v-for="(combo, index) in key.combos" :key="combo.join('+')">
                  <Text v-if="index" as="span" size="sm" tone="muted">或</Text>
                  <template v-for="(name, at) in combo" :key="name">
                    <Text v-if="at" as="span" size="sm" tone="faint">+</Text>
                    <Kbd>{{ name }}</Kbd>
                  </template>
                </template>
              </Inline>
            </DescriptionTerm>
            <DescriptionDetails>
              <Text size="sm">{{ key.text }}</Text>
            </DescriptionDetails>
          </template>
        </DescriptionList>
        <Text v-for="line in section.lines" :key="line" size="xs" tone="muted">{{ line }}</Text>
      </template>
      <List v-else>
        <ListItem v-for="line in section.lines" :key="line">
          <Text size="sm">{{ line }}</Text>
        </ListItem>
      </List>
    </Stack>
  </Stack>
</template>
