<script setup lang="ts">
  defineOptions({ name: 'DeveloperConsoleSecretDialog' })

  const visible = defineModel<boolean>('visible', { required: true })
  const props = defineProps<{ secret: { client_id: string; client_secret: string } | null }>()

  const code = computed(() => (props.secret ? props.secret.client_secret : ''))
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="应用凭据"
    :dismissable-mask="false"
    :style="{ width: '92vw', maxWidth: '34rem' }"
  >
    <div class="flex flex-col gap-4">
      <Message severity="warn" :closable="false">
        请妥善保存以下信息，关闭弹窗后将不会再次显示
      </Message>
      <DeveloperCodeBlock :code="code" />
      <div class="flex justify-end">
        <Button label="我已保存" @click="visible = false" />
      </div>
    </div>
  </Dialog>
</template>
