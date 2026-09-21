<script setup lang="ts">
  import { Alert, Button, Center, Dialog, Inline, Stack, Text } from '@hina-ui/vue'
  import { usePurchaseDialog } from '~/features/decoration/usePurchaseDialog'

  defineOptions({ name: 'UiPurchaseDialog' })

  const { state, confirm, cancel } = usePurchaseDialog()

  const afterBalance = computed(() => state.balance - (state.item?.price ?? 0))
  const affordable = computed(() => afterBalance.value >= 0)
</script>

<template>
  <Dialog
    :open="state.open"
    :title="state.title"
    size="sm"
    :locked="state.submitting"
    @update:open="value => !value && cancel()"
  >
    <template #content>
      <Stack v-if="state.item" gap="lg">
        <Inline gap="md" align="center">
          <Center class="size-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-inset">
            <HikariImage
              v-if="state.item.image"
              :src="state.item.image.src"
              alt=""
              :preview="false"
              image-class="object-contain"
              class="size-16"
            />
          </Center>
          <Stack gap="xs" class="min-w-0 flex-1">
            <Text weight="semibold">{{ state.item.name }}</Text>
            <Text v-if="state.item.description" size="sm" tone="muted" class="line-clamp-2">
              {{ state.item.description }}
            </Text>
          </Stack>
        </Inline>

        <Stack gap="sm" class="rounded-xl bg-subtle p-4">
          <Inline align="center" justify="between">
            <Text as="span" size="sm" tone="muted">价格</Text>
            <Inline gap="xs" align="center">
              <HikariPoint class="size-4" aria-hidden="true" />
              <Text as="span" size="sm" weight="medium">{{ state.item.price }}</Text>
            </Inline>
          </Inline>
          <Inline align="center" justify="between">
            <Text as="span" size="sm" tone="muted">当前光点</Text>
            <Inline gap="xs" align="center">
              <HikariPoint class="size-4" aria-hidden="true" />
              <Text as="span" size="sm">{{ state.balance }}</Text>
            </Inline>
          </Inline>
          <Inline align="center" justify="between" class="border-t border-line pt-2">
            <Text as="span" size="sm" tone="muted">兑换后</Text>
            <Inline gap="xs" align="center">
              <HikariPoint class="size-4" aria-hidden="true" />
              <Text as="span" size="sm" weight="medium" :tone="affordable ? 'default' : 'danger'">
                {{ afterBalance }}
              </Text>
            </Inline>
          </Inline>
        </Stack>

        <Alert :open="!affordable" tone="danger">光点不足</Alert>
      </Stack>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="state.submitting" @click="cancel">
        取消
      </Button>
      <Button :loading="state.submitting" :disabled="!affordable" @click="confirm">
        {{ state.confirmLabel }}
      </Button>
    </template>
  </Dialog>
</template>
