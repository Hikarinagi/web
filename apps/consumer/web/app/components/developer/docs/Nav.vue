<script setup lang="ts">
  import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DisclosureIcon,
    Inline,
    NavLink,
    ScrollArea,
    SearchInput,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ComponentPublicInstance } from 'vue'
  import type { GuideNavItem } from '~/features/developer/useGuide'
  import type { ReferenceNavGroup } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperDocsNav' })

  const props = defineProps<{
    groups: ReferenceNavGroup[]
    sections: GuideNavItem[]
    scrollClass: string
  }>()
  const emit = defineEmits<{ navigate: [] }>()

  const keyword = ref('')
  const collapsed = ref(new Set<string>())
  const needle = computed(() => keyword.value.trim().toLowerCase())

  const sections = computed(() =>
    needle.value
      ? props.sections.filter(section => section.title.toLowerCase().includes(needle.value))
      : props.sections,
  )

  const matched = computed(() =>
    props.groups
      .map(group => ({
        ...group,
        operations: needle.value
          ? group.operations.filter(operation =>
              [operation.path, operation.summary ?? '', operation.method, ...operation.scopes]
                .join(' ')
                .toLowerCase()
                .includes(needle.value),
            )
          : group.operations,
      }))
      .filter(group => group.operations.length > 0),
  )

  const route = useRoute()
  const empty = computed(() => !sections.value.length && !matched.value.length)
  const isOpen = (tag: string) => needle.value !== '' || !collapsed.value.has(tag)

  function toggle(tag: string) {
    const next = new Set(collapsed.value)
    if (next.has(tag)) next.delete(tag)
    else next.add(tag)
    collapsed.value = next
  }

  const methodClass = (method: string) => {
    if (method === 'GET') return 'text-accent-text'
    if (method === 'DELETE') return 'text-danger-text'
    return 'text-warning-text'
  }

  const field = useTemplateRef<ComponentPublicInstance>('field')
  onKeyStroke('/', event => {
    const target = event.target as HTMLElement | null
    if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return
    event.preventDefault()
    unrefElement(field)?.querySelector('input')?.focus()
  })

  const list = useTemplateRef<ComponentPublicInstance>('list')
  watch(
    () => route.path,
    async () => {
      await nextTick()
      unrefElement(list)
        ?.querySelector('[aria-current="page"]')
        ?.scrollIntoView({ block: 'nearest' })
    },
    { immediate: true },
  )
</script>

<template>
  <Stack gap="md">
    <SearchInput
      ref="field"
      v-model="keyword"
      size="sm"
      autocomplete="off"
      placeholder="搜索文档与端点"
      aria-label="搜索文档与端点"
      class="w-full"
    />

    <ScrollArea :class="scrollClass" :shadow="false">
      <Stack ref="list" gap="xl">
        <Text v-if="empty" size="sm" tone="muted" class="px-2 py-6 text-center">
          没有匹配的内容
        </Text>

        <Stack v-if="sections.length" gap="md">
          <NavLink
            :as="NuxtLink"
            to="/developers/guide"
            :active="route.path === '/developers/guide'"
            class="font-mono text-xs font-semibold tracking-widest uppercase"
            @click="emit('navigate')"
          >
            接入指南
          </NavLink>

          <Stack gap="xs">
            <NavLink
              v-for="section in sections"
              :key="section.section"
              :as="NuxtLink"
              :to="section.path"
              :active="route.path === section.path"
              @click="emit('navigate')"
            >
              {{ section.title }}
            </NavLink>
          </Stack>
        </Stack>

        <Stack v-if="matched.length" gap="md">
          <NavLink
            :as="NuxtLink"
            to="/developers/api"
            :active="route.path === '/developers/api'"
            class="font-mono text-xs font-semibold tracking-widest uppercase"
            @click="emit('navigate')"
          >
            端点参考
          </NavLink>

          <Collapsible
            v-for="group in matched"
            :key="group.tag"
            :open="isOpen(group.tag)"
            @update:open="toggle(group.tag)"
          >
            <Stack gap="xs">
              <Inline gap="xs" align="center" :wrap="false" class="pe-2">
                <CollapsibleTrigger as-child>
                  <Button
                    variant="ghost"
                    tone="neutral"
                    size="sm"
                    class="min-w-0 flex-1 justify-start"
                  >
                    <template #icon><DisclosureIcon direction="end" /></template>
                    {{ group.title }}
                  </Button>
                </CollapsibleTrigger>
                <Text as="span" size="xs" tone="muted" class="shrink-0 font-mono tabular-nums">
                  {{ group.operations.length }}
                </Text>
              </Inline>

              <CollapsibleContent>
                <Stack gap="xs">
                  <NavLink
                    v-for="operation in group.operations"
                    :key="operation.id"
                    :as="NuxtLink"
                    :to="`/developers/api/${operation.id}`"
                    :active="route.path === `/developers/api/${operation.id}`"
                    class="min-w-0 [&_[data-hn-label]]:min-w-0 [&_[data-hn-label]]:truncate"
                    @click="emit('navigate')"
                  >
                    <template #icon>
                      <Text
                        as="span"
                        size="xs"
                        weight="semibold"
                        class="w-11 shrink-0 font-mono"
                        :class="methodClass(operation.method)"
                      >
                        {{ operation.method }}
                      </Text>
                    </template>
                    {{ operation.summary }}
                  </NavLink>
                </Stack>
              </CollapsibleContent>
            </Stack>
          </Collapsible>
        </Stack>
      </Stack>
    </ScrollArea>
  </Stack>
</template>
