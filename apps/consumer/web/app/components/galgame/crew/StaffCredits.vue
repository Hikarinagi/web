<script setup lang="ts">
  import { DescriptionDetails, DescriptionList, DescriptionTerm, Flex, Link } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
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
  <DescriptionList class="divide-y divide-line overflow-hidden rounded-xl border border-line">
    <Flex
      v-for="group in groups"
      :key="group.label"
      direction="col"
      gap="none"
      class="gap-1.5 px-5 py-3 sm:flex-row sm:items-baseline sm:gap-5 sm:py-3.5"
    >
      <DescriptionTerm class="shrink-0 text-xs font-medium text-faint sm:w-24 sm:pt-px">
        {{ group.label }}
      </DescriptionTerm>
      <DescriptionDetails class="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <Link
          v-for="person in group.people"
          :key="person.id"
          :as="NuxtLink"
          :to="`/people/${person.id}`"
          tone="neutral"
          :underline="false"
          class="text-sm font-semibold hover:text-accent-text"
        >
          {{ person.trans_name || person.name }}
        </Link>
      </DescriptionDetails>
    </Flex>
  </DescriptionList>
</template>
