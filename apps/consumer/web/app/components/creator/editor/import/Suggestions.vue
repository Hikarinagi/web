<script setup lang="ts">
  import { push } from 'notivue'
  import {
    buildRosterActions,
    type RosterAction,
    type RosterActionContext,
  } from '~/features/creator/editor/roster-actions'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import type { SyncRoster } from '~/features/creator/editor/sync'

  const props = defineProps<{
    roster: SyncRoster
    current?: Record<string, EditorRelationRow[]>
    ctx: RosterActionContext
  }>()

  const actions = computed(() => buildRosterActions(props.roster, props.current))
  const checked = ref<Set<string>>(new Set())
  const done = ref<Set<string>>(new Set())
  const failed = ref<Set<string>>(new Set())
  const running = ref(false)

  watch(
    actions,
    (next, prev) => {
      const prevKeys = new Set((prev ?? []).map(a => a.key))
      const kept = new Set([...checked.value].filter(key => next.some(a => a.key === key)))
      for (const action of next) {
        if (!prevKeys.has(action.key) && !done.value.has(action.key)) kept.add(action.key)
      }
      checked.value = kept
    },
    { immediate: true },
  )

  const pending = computed(() => actions.value.filter(a => !done.value.has(a.key)))
  const grouped = computed(() => {
    const map = new Map<string, RosterAction[]>()
    for (const action of actions.value) {
      const list = map.get(action.group) ?? []
      list.push(action)
      map.set(action.group, list)
    }
    return [...map.entries()]
  })
  const selectedCount = computed(() => pending.value.filter(a => checked.value.has(a.key)).length)

  function toggle(key: string) {
    const next = new Set(checked.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    checked.value = next
  }

  async function applySelected() {
    if (running.value) return
    running.value = true
    failed.value = new Set()
    try {
      const tasks = pending.value
        .filter(a => checked.value.has(a.key))
        .map(action => async () => {
          try {
            await action.run(props.ctx)
            done.value = new Set(done.value).add(action.key)
          } catch {
            failed.value = new Set(failed.value).add(action.key)
          }
        })
      const worker = async () => {
        for (let task = tasks.shift(); task; task = tasks.shift()) await task()
      }
      await Promise.all(Array.from({ length: 4 }, () => worker()))
      if (failed.value.size) push.error({ message: `${failed.value.size} 项应用失败，可重试` })
      else push.success({ message: '所选对齐操作已应用，随本次提交生效' })
    } finally {
      running.value = false
    }
  }

  function stateOf(action: RosterAction) {
    if (done.value.has(action.key)) return 'done'
    if (failed.value.has(action.key)) return 'failed'
    return 'pending'
  }
</script>

<template>
  <CardPanel
    v-if="actions.length > 0"
    title="外部源关系对齐"
    :count="actions.length"
    description="根据外部源对齐本作品的关联，应用后随本次提交生效。"
  >
    <template #actions>
      <Button
        size="small"
        :label="`应用所选（${selectedCount}）`"
        :loading="running"
        :disabled="running || selectedCount === 0"
        @click="applySelected"
      />
    </template>
    <div class="flex flex-col gap-5">
      <section v-for="[group, list] in grouped" :key="group" class="flex flex-col gap-2">
        <h3 class="text-sm font-semibold">{{ group }}（{{ list.length }}）</h3>
        <CreatorEditorImportActionRow
          v-for="action in list"
          :key="action.key"
          :action="action"
          :checked="checked.has(action.key)"
          :state="stateOf(action)"
          :running="running"
          @toggle="toggle(action.key)"
        />
      </section>
    </div>
  </CardPanel>
</template>
