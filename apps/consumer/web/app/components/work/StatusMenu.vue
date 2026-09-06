<script setup lang="ts">
  import { Check, ChevronDown, EyeOff, Plus, RotateCcw } from '@lucide/vue'
  import Popover from 'primevue/popover'
  import type { Component } from 'vue'

  export interface WorkStatusOption {
    value: string
    label: string
    sub: string
    icon: Component
  }

  const props = defineProps<{
    status: string | null
    options: WorkStatusOption[]
    statusPrivate?: boolean
    busy?: boolean
    size?: 'small' | 'large'
    tone?: 'primary' | 'secondary'
  }>()
  const emit = defineEmits<{ select: [value: string]; clear: []; privacy: [value: boolean] }>()

  defineOptions({ name: 'WorkStatusMenu' })

  const pop = useTemplateRef<InstanceType<typeof Popover>>('pop')
  const confirm = useConfirm()
  const current = computed(() => props.options.find(o => o.value === props.status) ?? null)

  function pick(value: string) {
    pop.value?.hide()
    if (value !== props.status) emit('select', value)
  }
  function onClear() {
    pop.value?.hide()
    confirm.require({
      group: 'app-shell',
      header: '移除状态',
      message: '移除后，你对这部作品的标记、评分与短评都会删除。确定吗？',
      acceptLabel: '移除',
      rejectLabel: '再想想',
      onAccept: ({ close }: { close: () => void }) => {
        close()
        emit('clear')
      },
    })
  }
</script>

<template>
  <div class="inline-flex">
    <Button
      login-required
      :size="size"
      :loading="busy"
      :severity="tone === 'secondary' ? 'secondary' : undefined"
      :outlined="tone === 'secondary' || Boolean(status)"
      :class="
        tone === 'secondary'
          ? undefined
          : status
            ? 'border-hikari-primary-500! bg-hikari-primary-50! text-hikari-primary-800! hover:bg-hikari-primary-100! dark:border-hikari-primary-700! dark:bg-hikari-primary-950! dark:text-hikari-primary-300! dark:hover:bg-hikari-primary-900!'
            : undefined
      "
      @click="(event: MouseEvent) => pop?.toggle(event)"
    >
      <span class="inline-flex items-center gap-1.5">
        <component :is="current ? current.icon : Plus" class="size-4" />
        {{ current?.label ?? '标记我的状态' }}
        <ChevronDown class="size-3.5 opacity-70" />
      </span>
    </Button>

    <Popover ref="pop" :pt="{ root: { class: 'popover-no-arrow' } }">
      <div class="flex w-49 flex-col">
        <Button
          v-for="opt in options"
          :key="opt.value"
          unstyled
          class="flex items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
          :class="opt.value === status ? 'text-hikari-primary-600' : 'text-color'"
          @click="pick(opt.value)"
        >
          <component :is="opt.icon" class="size-4 shrink-0" />
          <span class="flex min-w-0 flex-col leading-tight">
            <span class="text-sm font-medium">{{ opt.label }}</span>
            <span class="text-xs text-muted-color">{{ opt.sub }}</span>
          </span>
          <Check v-if="opt.value === status" class="ml-auto size-4 shrink-0" />
        </Button>

        <template v-if="status">
          <div class="my-1 border-t border-surface-200 dark:border-surface-700" />
          <label
            class="flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <EyeOff class="size-4 shrink-0 text-muted-color" />
            <span class="min-w-0 flex-1 text-sm text-color">仅自己可见</span>
            <ToggleSwitch
              :model-value="statusPrivate ?? false"
              :disabled="busy"
              size="small"
              @update:model-value="value => emit('privacy', Boolean(value))"
            />
          </label>
          <Button
            unstyled
            class="flex items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm text-muted-color transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
            @click="onClear"
          >
            <RotateCcw class="size-4 shrink-0" />
            移除状态
          </Button>
        </template>
      </div>
    </Popover>
  </div>
</template>
