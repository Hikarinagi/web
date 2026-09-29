<script setup lang="ts">
  import { Button, Divider, Image, Inline, Panel, Stack, Text } from '@hina-ui/vue'

  const props = defineProps<{
    name: string
    image: string
    description: string
    available: number
    purchased: number
    limit?: number
    price: number
    action: '购买' | '兑换'
    validity: string
  }>()

  defineEmits<{ purchase: [] }>()

  const soldOut = computed(() => props.limit !== undefined && props.purchased >= props.limit)
</script>

<template>
  <Panel :title="name">
    <template #actions>
      <Button
        v-tooltip="soldOut ? `本月已达${action}上限，下月可继续${action}` : undefined"
        :disabled="soldOut"
        @click="$emit('purchase')"
      >
        <template v-if="soldOut">已达本月上限</template>
        <template v-else>
          {{ action }}
          <HikariPoint class="size-3.5" aria-hidden="true" />
          {{ price }}
        </template>
      </Button>
    </template>

    <Inline gap="lg" align="start" :wrap="false">
      <Image
        :src="image"
        :alt="name"
        fit="contain"
        :lazy="false"
        :skeleton="false"
        :draggable="false"
        class="h-28 w-20 shrink-0"
        image-class="select-none"
      />
      <Stack gap="md" class="min-w-0 flex-1">
        <Stack gap="xs">
          <Inline gap="xs" align="center">
            <Text size="sm">{{ description }}</Text>
            <slot name="description-extra" />
          </Inline>
          <Inline gap="md" class="gap-y-1">
            <Text as="span" size="xs" tone="muted">持有 {{ available }} 张</Text>
            <Text as="span" size="xs" tone="muted">
              本月已{{ action }} {{ purchased }}{{ limit !== undefined ? ` / ${limit}` : '' }} 张
            </Text>
            <Text as="span" size="xs" tone="muted">{{ validity }}</Text>
          </Inline>
        </Stack>

        <template v-if="$slots.default">
          <Divider />
          <slot />
        </template>
      </Stack>
    </Inline>
  </Panel>
</template>
