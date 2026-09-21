<script setup lang="ts">
  import { Inline, Stack } from '@hina-ui/vue'
  import { Pencil, Trash2 } from '@lucide/vue'
  import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
  import { useContentSummaries } from '~/components/hikari-content/composables/useContentSummaries'
  import { usePoll, usePollView } from '~/features/interaction/usePoll'
  import { usePollEditor } from '~/features/interaction/usePollEditor'

  defineOptions({ name: 'HikariEditorPluginsPollEditorView' })

  const props = defineProps(nodeViewProps)

  const summaries = useContentSummaries()
  const pollKey = computed(() =>
    typeof props.node.attrs.poll_key === 'string' ? props.node.attrs.poll_key : '',
  )
  const poll = usePollView(pollKey.value, () => summaries.value.polls.get(pollKey.value) ?? null)
  const { apply } = usePoll()
  const { open } = usePollEditor()

  const adaptedNode = computed(() => ({ type: props.node.type.name, attrs: props.node.attrs }))

  function openEdit() {
    const key = pollKey.value
    const current = poll.value
    const nodeOptions = Array.isArray(props.node.attrs.options)
      ? (props.node.attrs.options as unknown[]).filter((o): o is string => typeof o === 'string')
      : []
    const initial = current
      ? {
          question: current.question,
          options: current.options.map(o => o.label),
          allow_multiple: current.allow_multiple,
          max_choices: current.max_choices,
          anonymous: current.anonymous,
          allow_change: current.allow_change,
          closes_at: current.closes_at,
        }
      : {
          question: String(props.node.attrs.question ?? ''),
          options: nodeOptions,
          allow_multiple: props.node.attrs.allow_multiple === true,
          max_choices:
            typeof props.node.attrs.max_choices === 'number' ? props.node.attrs.max_choices : null,
          anonymous: props.node.attrs.anonymous !== false,
          allow_change: props.node.attrs.allow_change !== false,
          closes_at:
            typeof props.node.attrs.closes_at === 'string' ? props.node.attrs.closes_at : null,
        }
    const locked = current ? !current.can_edit_options : false
    open({
      mode: 'edit',
      initial,
      locked,
      onSave: async def => {
        if (current) {
          const body = locked
            ? {
                question: def.question,
                closes_at: def.closes_at,
                anonymous: def.anonymous,
                allow_change: def.allow_change,
              }
            : {
                question: def.question,
                allow_multiple: def.allow_multiple,
                max_choices: def.max_choices,
                anonymous: def.anonymous,
                allow_change: def.allow_change,
                closes_at: def.closes_at,
                options: def.options.map(label => ({ label })),
              }
          const res = await hikariRequest<'/api/v3/polls/{id}', 'patch'>('/api/v3/polls/{id}', {
            method: 'patch',
            path: { id: current.id },
            body,
          })
          apply(key, res)
        } else {
          props.updateAttributes({
            question: def.question,
            options: def.options,
            allow_multiple: def.allow_multiple,
            max_choices: def.max_choices,
            anonymous: def.anonymous,
            allow_change: def.allow_change,
            closes_at: def.closes_at,
          })
        }
      },
    })
  }
</script>

<template>
  <NodeViewWrapper
    as="div"
    :class="[
      'group/card relative my-hikari-node rounded-(--editor-panel-radius) border-2 transition-[border-color,box-shadow] duration-120 ease-out',
      selected ? 'border-(--editor-focus-ring)' : 'border-transparent',
    ]"
    :style="
      selected
        ? { boxShadow: '0 0 0 4px color-mix(in srgb, var(--editor-focus-ring) 25%, transparent)' }
        : undefined
    "
  >
    <Stack gap="none" class="contents" @click.capture.stop.prevent>
      <HikariContentNodesPollCard :node="adaptedNode" :interactive="false" />
    </Stack>

    <Inline
      gap="xs"
      :wrap="false"
      class="absolute top-2 right-2 z-10 transition-opacity duration-150"
      :class="
        selected
          ? 'opacity-100'
          : 'opacity-100 md:opacity-0 md:group-hover/card:opacity-100 md:focus-within:opacity-100'
      "
    >
      <HikariEditorNodeViewChromeButton label="编辑投票" @click="openEdit">
        <Pencil />
      </HikariEditorNodeViewChromeButton>
      <HikariEditorNodeViewChromeButton label="删除投票" tone="danger" @click="deleteNode">
        <Trash2 />
      </HikariEditorNodeViewChromeButton>
    </Inline>
  </NodeViewWrapper>
</template>
