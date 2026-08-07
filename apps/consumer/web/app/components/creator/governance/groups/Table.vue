<script setup lang="ts">
  import { timeFormat } from '#imports'
  import { Plus, Shield, Lock } from '@lucide/vue'
  import type { BackendPermissionGroupList } from '~/features/creator/governance'

  defineProps<{ list?: BackendPermissionGroupList; loading: boolean }>()
  const page = defineModel<number>('page', { required: true })
  const emit = defineEmits<{ created: [] }>()

  const dialogOpen = ref(false)

  function openDetail(row: { id: number }) {
    void navigateTo(`/create/governance/groups/${row.id}`)
  }
</script>

<template>
  <CreatorDataTable
    v-model:page="page"
    title="权限组"
    :icon="Shield"
    :list="list"
    :loading="loading"
    @row-click="openDetail"
  >
    <template #actions>
      <Button label="新建" size="small" @click="dialogOpen = true">
        <template #icon>
          <Plus :size="15" />
        </template>
      </Button>
    </template>
    <template #empty>
      <CreatorEmpty text="还没有权限组" />
    </template>
    <Column header="#" class="w-14">
      <template #body="{ data: row }">{{ row.id }}</template>
    </Column>
    <Column header="名称" class="min-w-40">
      <template #body="{ data: row }">
        <span class="flex items-center gap-2 font-medium">
          {{ row.name }}
          <Lock
            v-if="row.is_system"
            v-tooltip.top="'系统权限组，不可编辑'"
            :size="13"
            class="text-muted-color"
          />
        </span>
      </template>
    </Column>
    <Column header="描述">
      <template #body="{ data: row }">
        <span class="line-clamp-1 text-muted-color">{{ row.description || '—' }}</span>
      </template>
    </Column>
    <Column header="权限" class="w-24">
      <template #body="{ data: row }">
        <Tag
          severity="secondary"
          :value="`${row.permissions.length} 项`"
          :pt="{ root: { class: 'text-xs!' } }"
        />
      </template>
    </Column>
    <Column header="创建人" class="w-32">
      <template #body="{ data: row }">
        <UserName :user="row.created_by" :handle="false" fallback="系统" class="text-muted-color" />
      </template>
    </Column>
    <Column header="创建时间" class="w-40">
      <template #body="{ data: row }">
        <span class="text-muted-color">{{ timeFormat(row.created_at) }}</span>
      </template>
    </Column>
  </CreatorDataTable>

  <CreatorGovernanceGroupsCreateDialog v-model:visible="dialogOpen" @created="emit('created')" />
</template>
