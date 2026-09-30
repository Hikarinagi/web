<script setup lang="ts">
  import {
    Alert,
    Button,
    Center,
    Dialog,
    Form,
    FormField,
    Inline,
    NumberInput,
    Slider,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { purchaseSchema, type PurchaseValues } from '~/features/purchase/schemas/purchase.schema'
  import { usePurchaseDialog } from '~/features/purchase/usePurchaseDialog'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'UiPurchaseDialog' })

  const { state, confirm, cancel } = usePurchaseDialog()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive<{ quantity: PurchaseValues['quantity'] | null }>({ quantity: 1 })
  const rules = computed(() =>
    purchaseSchema(state.maxQuantity, state.item?.price ?? 0, state.balance),
  )

  const total = computed(() =>
    Number.isFinite(values.quantity) ? (state.item?.price ?? 0) * (values.quantity ?? 0) : 0,
  )
  const afterBalance = computed(() => state.balance - total.value)
  const unit = computed(() => state.item?.unit ?? null)
  const amount = computed({
    get: () => (values.quantity ?? 0) * (unit.value?.size ?? 1),
    set: (value: number | undefined) => {
      if (value !== undefined) values.quantity = Math.round(value / (unit.value?.size ?? 1))
    },
  })
  const marks = computed(() =>
    unit.value
      ? [
          { value: unit.value.size, label: String(unit.value.size) },
          {
            value: state.maxQuantity * unit.value.size,
            label: String(state.maxQuantity * unit.value.size),
          },
        ]
      : [],
  )

  watch(
    () => state.open,
    open => {
      if (!open) return
      form.value?.reset()
      values.quantity = state.quantity
    },
    { immediate: true },
  )

  async function onSubmit() {
    if (values.quantity == null) return
    try {
      await confirm(values.quantity)
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    }
  }
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
      <Form
        v-if="state.item"
        ref="form"
        v-slot="{ error }"
        :values="values"
        :rules="rules"
        :disabled="state.submitting"
        class="gap-6"
        @submit="onSubmit"
      >
        <Inline gap="md" align="center" :wrap="false">
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
            <Text v-if="state.item.description" size="sm" tone="muted">
              {{ state.item.description }}
            </Text>
            <Inline gap="xs" align="center">
              <Text as="span" size="sm" tone="muted">单价</Text>
              <HikariPoint class="size-4" aria-hidden="true" />
              <Text as="span" size="sm">{{ state.item.price }}</Text>
              <Text v-if="unit" as="span" size="sm" tone="muted">
                / {{ unit.size }} {{ unit.label }}
              </Text>
            </Inline>
          </Stack>
        </Inline>

        <Inline v-if="state.item.details?.length" gap="md" class="gap-y-1">
          <Text v-for="detail in state.item.details" :key="detail" as="span" size="xs" tone="muted">
            {{ detail }}
          </Text>
        </Inline>

        <FormField v-if="unit" name="quantity" label="数量">
          <Slider
            v-if="state.maxQuantity > 1"
            v-model="amount"
            :min="unit.size"
            :max="state.maxQuantity * unit.size"
            :step="unit.size"
            :marks="marks"
            label="always"
            :format="value => `${value} ${unit?.label}`"
            class="pt-8"
          />
          <Text v-else size="sm">{{ amount }} {{ unit.label }}</Text>
        </FormField>
        <FormField v-else name="quantity" label="数量" orientation="horizontal">
          <NumberInput
            v-if="state.maxQuantity > 1"
            v-model="values.quantity"
            :min="1"
            :max="state.maxQuantity"
            class="ml-auto w-32"
          />
          <Text v-else size="sm" class="ml-auto">{{ values.quantity }}</Text>
        </FormField>

        <Stack gap="sm" class="rounded-xl bg-subtle p-4">
          <Inline align="center" justify="between">
            <Text as="span" size="sm" tone="muted">合计</Text>
            <Inline gap="xs" align="center">
              <HikariPoint class="size-4" aria-hidden="true" />
              <Text as="span" size="sm" weight="medium">{{ total }}</Text>
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
            <Text as="span" size="sm" tone="muted">剩余</Text>
            <Inline gap="xs" align="center">
              <HikariPoint class="size-4" aria-hidden="true" />
              <Text
                as="span"
                size="sm"
                weight="medium"
                :tone="afterBalance < 0 ? 'danger' : 'default'"
              >
                {{ afterBalance }}
              </Text>
            </Inline>
          </Inline>
        </Stack>

        <Text v-if="state.note" size="sm" tone="muted">{{ state.note }}</Text>

        <Alert :open="!!error" tone="danger">{{ error }}</Alert>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="state.submitting" @click="cancel">
        取消
      </Button>
      <Button :loading="state.submitting" :disabled="state.maxQuantity < 1" @click="form?.submit()">
        {{ state.confirmLabel }}
      </Button>
    </template>
  </Dialog>
</template>
