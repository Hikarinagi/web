<script setup lang="ts">
  import { Button, Empty, Panel, Stack, Text } from '@hina-ui/vue'
  import { ArrowRight, Plus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgameEditPageData } from '~~/server/api/pages/create/edit/galgame/[id].get'
  import { titleText } from '~/features/entry/labels'

  defineOptions({ name: 'CreatorEntryProductsTab' })
  defineProps<{ pageData: GalgameEditPageData }>()
</script>

<template>
  <Stack gap="lg">
    <Panel title="发行版本" :padded="false">
      <template #title>
        发行版本
        <Text as="span" size="sm" tone="muted" weight="normal" class="ms-1 tabular-nums">
          {{ pageData.products.length }}
        </Text>
        <CreatorEntryHint name="products" class="ms-1 align-middle" />
      </template>
      <template #actions>
        <Button :as="NuxtLink" to="/create/new" variant="ghost" tone="neutral" size="sm">
          <template #icon><Plus /></template>
          添加发行版本
        </Button>
      </template>
      <Empty v-if="!pageData.products.length" title="尚未记录发行版本" />
      <CreatorEntryProductsTable v-else :products="pageData.products" />
    </Panel>
    <CreatorEntryProductsRelease
      :products="pageData.products"
      :facts="pageData.facts"
      :display="pageData.display"
    />
    <Panel v-if="pageData.credits.statements.length" title="制作信息" :padded="false">
      <template #title>
        制作信息
        <Text as="span" size="sm" tone="muted" weight="normal" class="ms-1 tabular-nums">
          {{ pageData.credits.statements.length }}
        </Text>
        <CreatorEntryHint name="credits" class="ms-1 align-middle" />
      </template>
      <template v-if="pageData.credits.product" #actions>
        <Button
          :as="NuxtLink"
          :to="`/create/edit/product/${pageData.credits.product.id}?tab=credits`"
          variant="ghost"
          tone="neutral"
          size="sm"
        >
          <template #icon><ArrowRight /></template>
          在 {{ titleText(pageData.credits.product.title) }} 中编辑
        </Button>
      </template>
      <CreatorEntryCreditsTable :statements="pageData.credits.statements" target="关联人物" />
    </Panel>
  </Stack>
</template>
