<script setup lang="ts">
  import { usePurchaseDialog } from '~/features/decoration/usePurchaseDialog'

  defineOptions({ name: 'UiPurchaseDialog' })

  const { state, confirm, cancel } = usePurchaseDialog()

  const afterBalance = computed(() => state.balance - (state.item?.price ?? 0))
  const affordable = computed(() => afterBalance.value >= 0)
</script>

<template>
  <Dialog
    :visible="state.open"
    modal
    :draggable="false"
    :dismissable-mask="!state.submitting"
    :close-on-escape="!state.submitting"
    :header="state.title"
    :style="{ width: '24rem' }"
    @update:visible="value => !value && cancel()"
  >
    <div v-if="state.item" class="flex flex-col gap-5">
      <div class="flex items-center gap-4">
        <div
          class="bg-emphasis/40 grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-surface"
        >
          <HikariImage
            v-if="state.item.image"
            :src="state.item.image.src"
            alt=""
            :preview="false"
            image-class="object-contain"
            class="size-16"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-base font-semibold text-color">{{ state.item.name }}</p>
          <p v-if="state.item.description" class="mt-1 line-clamp-2 text-sm text-muted-color">
            {{ state.item.description }}
          </p>
        </div>
      </div>

      <dl class="flex flex-col gap-2 rounded-xl p-4 text-sm bg-emphasis">
        <div class="flex items-center justify-between">
          <dt class="text-muted-color">价格</dt>
          <dd class="inline-flex items-center gap-1 font-medium text-color">
            <HikariPoint class="size-4" aria-hidden="true" />
            {{ state.item.price }}
          </dd>
        </div>
        <div class="flex items-center justify-between">
          <dt class="text-muted-color">当前光点</dt>
          <dd class="inline-flex items-center gap-1 text-color">
            <HikariPoint class="size-4" aria-hidden="true" />
            {{ state.balance }}
          </dd>
        </div>
        <div class="flex items-center justify-between border-t border-surface pt-2">
          <dt class="text-muted-color">兑换后</dt>
          <dd
            class="inline-flex items-center gap-1 font-medium"
            :class="affordable ? 'text-color' : 'text-red-500'"
          >
            <HikariPoint class="size-4" aria-hidden="true" />
            {{ afterBalance }}
          </dd>
        </div>
      </dl>
      <Message v-if="!affordable" severity="error" :closable="false">光点不足</Message>
    </div>

    <template #footer>
      <Button
        label="取消"
        variant="text"
        severity="secondary"
        :disabled="state.submitting"
        @click="cancel"
      />
      <Button
        :label="state.confirmLabel"
        :loading="state.submitting"
        :disabled="!affordable"
        @click="confirm"
      />
    </template>
  </Dialog>
</template>
