<script setup lang="ts">
  import { Link, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { BackendProductSummary } from '~/features/entry/contract'
  import { ageRatingLabel, titleText, versionKindLabel } from '~/features/entry/labels'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'CreatorEntryProductsTable' })
  defineProps<{ products: BackendProductSummary[] }>()

  const LENGTH = { YEAR: 4, MONTH: 7, DAY: 10 }
</script>

<template>
  <Table variant="secondary" hover class="hikari-panel-table">
    <TableHeader>
      <TableRow>
        <TableHead>版本标题</TableHead>
        <TableHead>版本类型</TableHead>
        <TableHead>发售日</TableHead>
        <TableHead>运行平台</TableHead>
        <TableHead>年龄分级</TableHead>
        <TableHead><span class="sr-only">编辑发行版本</span></TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="product in products" :key="product.id" class="relative">
        <TableCell>
          <Link
            :as="NuxtLink"
            :to="`/create/edit/product/${product.id}`"
            tone="neutral"
            :underline="false"
            lang="ja"
            class="after:absolute after:inset-0"
          >
            {{ titleText(product.title) }}
          </Link>
        </TableCell>
        <TableCell class="whitespace-nowrap">{{ versionKindLabel(product.kind) ?? '—' }}</TableCell>
        <TableCell class="whitespace-nowrap tabular-nums">
          {{
            product.release
              ? product.release.date.slice(0, LENGTH[product.release.precision])
              : '未知'
          }}
        </TableCell>
        <TableCell>{{ product.platforms.map(platformLabel).join('、') || '—' }}</TableCell>
        <TableCell class="whitespace-nowrap">{{
          ageRatingLabel(product.age_rating) ?? '—'
        }}</TableCell>
        <TableCell class="w-0 text-muted"
          ><ChevronRight class="size-4" aria-hidden="true"
        /></TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>
