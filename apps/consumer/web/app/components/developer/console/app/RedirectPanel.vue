<script setup lang="ts">
  import {
    Button,
    Code,
    Form,
    FormField,
    Heading,
    IconButton,
    Inline,
    Input,
    InputGroup,
    Section,
    Stack,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { Plus, Trash2 } from '@lucide/vue'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'
  import {
    developerAppRedirectSchema,
    type DeveloperAppRedirectValues,
  } from '~/features/developer/schemas/app.schema'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'DeveloperConsoleAppRedirectPanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive<DeveloperAppRedirectValues>({ uri: '' })
  const busy = ref(false)

  const hint = computed(() =>
    props.app.application_type === 'native'
      ? '原生应用可用私有 scheme（com.example.app:/callback）、环回地址（http://127.0.0.1:端口、http://[::1]:端口、http://localhost:端口）或非环回的 https:// 地址。地址不能包含 #fragment。'
      : 'Web 应用需使用 https:// 地址；本地调试可用 http://localhost、http://127.0.0.1、http://[::1]。地址不能包含 #fragment。',
  )

  async function save(uris: string[]) {
    busy.value = true
    try {
      await hikariRequest<'/api/v3/user/me/developer/apps/{client_id}', 'patch'>(
        '/api/v3/user/me/developer/apps/{client_id}',
        {
          method: 'patch',
          path: { client_id: props.app.client_id },
          body: { redirect_uris: uris },
        },
      )
      emit('changed')
    } finally {
      busy.value = false
    }
  }

  async function onSubmit() {
    if (busy.value) return
    if (props.app.redirect_uris.includes(values.uri)) {
      toast.danger('该地址已存在')
      return
    }
    try {
      await save([...props.app.redirect_uris, values.uri])
      values.uri = ''
      form.value?.reset()
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    }
  }

  function remove(uri: string) {
    void save(props.app.redirect_uris.filter(value => value !== uri))
  }
</script>

<template>
  <Section class="py-6 first:pt-0 last:pb-0">
    <Stack gap="md">
      <Heading :level="3" size="base">回调地址</Heading>
      <Text size="xs" tone="muted" class="leading-relaxed">{{ hint }}</Text>

      <Stack gap="sm">
        <Stack v-if="app.redirect_uris.length" gap="none" class="divide-y divide-line">
          <Inline
            v-for="uri in app.redirect_uris"
            :key="uri"
            gap="sm"
            align="center"
            justify="between"
            class="py-2"
          >
            <Code class="min-w-0 truncate">{{ uri }}</Code>
            <IconButton
              label="删除回调地址"
              variant="ghost"
              tone="danger"
              size="sm"
              :disabled="busy"
              @click="remove(uri)"
            >
              <Trash2 />
            </IconButton>
          </Inline>
        </Stack>

        <Form
          v-if="app.redirect_uris.length < 5"
          ref="form"
          :values="values"
          :rules="developerAppRedirectSchema"
          :disabled="busy"
          @submit="onSubmit"
        >
          <FormField name="uri">
            <InputGroup>
              <Input
                v-model="values.uri"
                autocomplete="off"
                aria-label="回调地址"
                placeholder="https://your.app/callback"
              />
              <Button type="submit" variant="ghost" tone="neutral" :loading="busy">
                <template #icon><Plus /></template>
                添加
              </Button>
            </InputGroup>
          </FormField>
        </Form>
      </Stack>
    </Stack>
  </Section>
</template>
