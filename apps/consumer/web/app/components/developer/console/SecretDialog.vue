<script setup lang="ts">
  import { Alert, Button, Dialog, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'DeveloperConsoleSecretDialog' })

  const visible = defineModel<boolean>('visible', { required: true })
  const props = defineProps<{ secret: { client_id: string; client_secret: string } | null }>()

  const code = computed(() => (props.secret ? props.secret.client_secret : ''))
</script>

<template>
  <Dialog v-model:open="visible" title="应用凭据" size="lg" locked>
    <template #content>
      <Stack gap="md">
        <Alert tone="warning">请妥善保存以下信息，关闭弹窗后将不会再次显示</Alert>
        <DeveloperCodeBlock :code="code" />
      </Stack>
    </template>

    <template #footer>
      <Button @click="visible = false">我已保存</Button>
    </template>
  </Dialog>
</template>
