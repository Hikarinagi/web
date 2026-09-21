<script setup lang="ts">
  import {
    DisclosureIcon,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuItem,
    DropdownMenuSeparator,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { Check, Plus, RotateCcw } from '@lucide/vue'
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
    tone?: 'accent' | 'neutral'
    size?: 'sm' | 'md' | 'lg'
  }>()
  const emit = defineEmits<{
    select: [value: string, statusPrivate: boolean]
    clear: []
    privacy: [value: boolean]
  }>()

  defineOptions({ name: 'WorkStatusMenu' })

  const { confirm } = useHikariConfirm()
  const current = computed(() => props.options.find(o => o.value === props.status) ?? null)

  const intendedPrivate = ref(false)
  const isPrivate = computed(() =>
    props.status ? (props.statusPrivate ?? false) : intendedPrivate.value,
  )

  function setPrivate(value: boolean) {
    if (props.status) emit('privacy', value)
    else intendedPrivate.value = value
  }
  function pick(value: string) {
    if (value !== props.status) emit('select', value, isPrivate.value)
  }
  function onClear() {
    confirm({
      title: '移除状态',
      description: '移除后，你对这部作品的标记、评分与短评都会删除。确定吗？',
      confirmText: '移除',
      cancelText: '再想想',
      tone: 'danger',
      onConfirm: () => {
        intendedPrivate.value = false
        emit('clear')
      },
    })
  }
</script>

<template>
  <DropdownMenu label="标记我的状态" align="start" class="w-56">
    <Button
      login-required
      :loading="busy"
      :size="size"
      :variant="status ? 'soft' : tone === 'neutral' ? 'outline' : 'solid'"
      :tone="tone === 'neutral' ? 'neutral' : 'accent'"
    >
      <template #icon>
        <component :is="current ? current.icon : Plus" />
      </template>
      {{ current?.label ?? '标记我的状态' }}
      <template #trailing>
        <DisclosureIcon class="opacity-70" />
      </template>
    </Button>

    <template #content>
      <DropdownMenuItem v-for="opt in options" :key="opt.value" @select="pick(opt.value)">
        <template #icon>
          <component :is="opt.icon" />
        </template>
        <Stack gap="none">
          <Text as="span" size="sm" weight="medium">{{ opt.label }}</Text>
          <Text as="span" size="xs" tone="muted">{{ opt.sub }}</Text>
        </Stack>
        <template v-if="opt.value === status" #trailing>
          <Check />
        </template>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuCheckboxItem :checked="isPrivate" :disabled="busy" @update:checked="setPrivate">
        仅自己可见
      </DropdownMenuCheckboxItem>

      <DropdownMenuItem v-if="status" @select="onClear">
        <template #icon>
          <RotateCcw />
        </template>
        移除状态
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>
