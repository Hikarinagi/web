<script setup lang="ts">
  import { Center, Heading, Inline, ScrollArea, Spinner, Stack, Text } from '@hina-ui/vue'
  import type { SystemMessageItem } from '~/features/notifications/notifications'

  defineProps<{ items: SystemMessageItem[]; loading?: boolean }>()
  const emit = defineEmits<{ close: [] }>()
  const { t } = useLocaleText()
</script>

<template>
  <Stack gap="none" class="w-80">
    <Inline gap="sm" align="center" justify="between" :wrap="false" class="pb-1">
      <Heading :level="2" size="sm">{{ t('inbox.title') }}</Heading>
      <ViewAllLink to="/messages" class="text-xs" @click="emit('close')">
        {{ t('common.viewAll') }}
      </ViewAllLink>
    </Inline>

    <Center v-if="loading" class="py-8">
      <Spinner size="lg" />
    </Center>
    <ScrollArea v-else-if="items.length" class="-mx-2 max-h-96">
      <Stack gap="none" @click="emit('close')">
        <NotificationsItem v-for="m in items" :key="m.id" :item="m" compact />
      </Stack>
    </ScrollArea>
    <Text v-else size="sm" tone="muted" class="py-8 text-center">{{ t('inbox.empty') }}</Text>
  </Stack>
</template>
