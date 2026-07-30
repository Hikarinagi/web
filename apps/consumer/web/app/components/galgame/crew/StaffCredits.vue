<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { STAFF_ROLE_LABELS, staffRoleLabel } from '~/features/galgame/labels'

  defineOptions({ name: 'GalgameCrewStaffCredits' })
  const props = defineProps<{ staff: GalgamePageData['staff'] }>()

  type Person = GalgamePageData['staff'][number]['person']

  const groups = computed<{ label: string; people: Person[] }[]>(() => {
    const byRole = new Map<string, Person[]>()
    const others: Person[] = []
    for (const item of props.staff) {
      if (!item.role) {
        others.push(item.person)
        continue
      }
      const people = byRole.get(item.role) ?? []
      people.push(item.person)
      byRole.set(item.role, people)
    }
    const ordered = Object.keys(STAFF_ROLE_LABELS)
      .filter(role => byRole.has(role))
      .map(role => ({ label: staffRoleLabel(role), people: byRole.get(role)! }))
    if (others.length) ordered.push({ label: '其他 staff', people: others })
    return ordered
  })
</script>

<template>
  <dl
    class="divide-y divide-surface-100 overflow-hidden rounded-xl border border-surface-200 dark:divide-surface-800 dark:border-surface-800"
  >
    <div
      v-for="group in groups"
      :key="group.label"
      class="flex flex-col gap-1.5 px-5 py-3 sm:flex-row sm:items-baseline sm:gap-5 sm:py-3.5"
    >
      <dt
        class="shrink-0 text-[13px] font-medium text-surface-400 sm:w-24 sm:pt-px dark:text-surface-500"
      >
        {{ group.label }}
      </dt>
      <dd class="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <NuxtLink
          v-for="person in group.people"
          :key="person.id"
          :to="`/people/${person.id}`"
          class="text-sm font-semibold text-surface-800 transition-colors hover:text-hikari-primary-600 dark:text-surface-100 dark:hover:text-hikari-primary-400"
        >
          {{ person.trans_name || person.name }}
        </NuxtLink>
      </dd>
    </div>
  </dl>
</template>
