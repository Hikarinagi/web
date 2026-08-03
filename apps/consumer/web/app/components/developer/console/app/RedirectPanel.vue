<script setup lang="ts">
  import { Plus, Trash2 } from '@lucide/vue'
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import type { DeveloperAppPageData } from '~~/server/api/pages/developers/console/apps/[clientId].get'
  import {
    developerAppRedirectResolver,
    type DeveloperAppRedirectValues,
  } from '~/features/developer/schemas/app.schema'

  defineOptions({ name: 'DeveloperConsoleAppRedirectPanel' })

  const props = defineProps<{ app: DeveloperAppPageData['app'] }>()
  const emit = defineEmits<{ changed: [] }>()

  const formErrors = useFormErrors(developerAppRedirectResolver)
  const form = useTemplateRef<FormInstance>('form')
  const busy = ref(false)

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

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || busy.value) return
    const { uri } = event.values as DeveloperAppRedirectValues
    if (props.app.redirect_uris.includes(uri)) {
      push.error({ message: '该地址已存在' })
      return
    }
    try {
      await save([...props.app.redirect_uris, uri])
      event.reset()
    } catch (error) {
      await formErrors.apply(error, form.value)
    }
  }

  function remove(uri: string) {
    void save(props.app.redirect_uris.filter(value => value !== uri))
  }
</script>

<template>
  <section class="flex flex-col gap-4 py-6 first:pt-0 last:pb-0">
    <h3 class="text-sm font-semibold text-color">回调地址</h3>
    <p class="text-xs leading-relaxed text-muted-color">
      {{
        app.application_type === 'native'
          ? '原生应用可用私有 scheme（com.example.app:/callback）、环回地址（http://127.0.0.1:端口、http://[::1]:端口、http://localhost:端口）或非环回的 https:// 地址。'
          : 'Web 应用需使用 https:// 地址；本地调试可用 http://localhost、http://127.0.0.1、http://[::1]。'
      }}
      地址不能包含 #fragment。
    </p>
    <div class="flex flex-col gap-3">
      <div
        v-if="app.redirect_uris.length"
        class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800"
      >
        <div
          v-for="uri in app.redirect_uris"
          :key="uri"
          class="flex items-center justify-between gap-3 py-2"
        >
          <code class="min-w-0 truncate font-mono text-sm text-color">{{ uri }}</code>
          <Button
            unstyled
            class="inline-flex shrink-0 items-center justify-center rounded p-1.5 text-muted-color hover:bg-emphasis hover:text-red-500"
            :disabled="busy"
            aria-label="删除回调地址"
            @click="remove(uri)"
          >
            <Trash2 class="size-4" />
          </Button>
        </div>
      </div>

      <Form
        v-if="app.redirect_uris.length < 5"
        ref="form"
        :resolver="formErrors.resolver"
        @input="formErrors.clear"
        @submit="onSubmit"
      >
        <FormItem v-slot="{ id, ariaDescribedby }" name="uri">
          <div class="flex items-center gap-2">
            <InputText
              :id="id"
              :aria-describedby="ariaDescribedby"
              fluid
              autocomplete="off"
              placeholder="https://your.app/callback"
            />
            <Button
              class="shrink-0"
              label="添加"
              severity="secondary"
              outlined
              type="submit"
              :loading="busy"
            >
              <template #icon><Plus class="size-4" /></template>
            </Button>
          </div>
        </FormItem>
      </Form>
    </div>
  </section>
</template>
