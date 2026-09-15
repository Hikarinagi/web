<script setup lang="ts">
  import {
    Card,
    Checkbox,
    Code,
    CopyButton,
    Grid,
    Heading,
    Inline,
    Section,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'
  import { DEVELOPER_SCOPES, developerScopeGroups } from '~/features/developer/scopes'

  defineOptions({ name: 'DeveloperConsoleAppScopesPanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const groups = developerScopeGroups()
  const busy = ref(false)
  const granted = computed(() => new Set((props.app.scope ?? '').split(' ').filter(Boolean)))
  const hasRedirect = computed(() => props.app.redirect_uris.length > 0)
  const lockedByRedirect = (group: { requires_user: boolean }) =>
    group.requires_user && !hasRedirect.value

  async function toggle(scope: string, next: boolean) {
    if (busy.value) return
    busy.value = true
    try {
      const scopes = DEVELOPER_SCOPES.map(entry => entry.scope).filter(value =>
        value === scope ? next : granted.value.has(value),
      )
      await hikariRequest<'/api/v3/user/me/developer/apps/{client_id}', 'patch'>(
        '/api/v3/user/me/developer/apps/{client_id}',
        { method: 'patch', path: { client_id: props.app.client_id }, body: { scopes } },
      )
      emit('changed')
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <Section class="py-6 first:pt-0 last:pb-0">
    <Stack gap="md">
      <Heading :level="3" size="base">授权</Heading>

      <Stack v-for="group in groups" :key="group.domain" gap="sm">
        <Text
          as="span"
          size="xs"
          weight="semibold"
          tone="muted"
          class="font-mono tracking-widest uppercase"
        >
          {{ group.label }}
        </Text>
        <Text v-if="lockedByRedirect(group)" size="xs" tone="muted">
          该组权限代表用户执行操作，需通过授权码流程取得。请先在下方「回调地址」中添加至少一条地址。
        </Text>

        <Grid :cols="1" gap="sm" class="sm:grid-cols-2">
          <Card v-for="entry in group.entries" :key="entry.scope" :padded="false" class="p-3">
            <Inline gap="sm" align="start">
              <Checkbox
                block
                :model-value="granted.has(entry.scope)"
                :disabled="busy || (lockedByRedirect(group) && !granted.has(entry.scope))"
                class="min-w-0 flex-1"
                @update:model-value="value => toggle(entry.scope, value === true)"
              >
                <Stack as="span" gap="xs" align="start" class="min-w-0">
                  <Code>{{ entry.scope }}</Code>
                  <Inline as="span" gap="xs" align="center">
                    <Text as="span" size="xs" tone="muted">{{ entry.label }}</Text>
                    <Question
                      v-if="entry.description"
                      :show-dialog="false"
                      :tooltip="entry.description"
                    />
                  </Inline>
                </Stack>
              </Checkbox>
              <CopyButton :text="entry.scope" :label="`复制 ${entry.scope}`" size="sm" />
            </Inline>
          </Card>
        </Grid>
      </Stack>
    </Stack>
  </Section>
</template>
