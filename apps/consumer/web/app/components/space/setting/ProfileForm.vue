<script setup lang="ts">
  import {
    Button,
    Divider,
    Form,
    FormField,
    Inline,
    Input,
    Panel,
    Stack,
    Textarea,
  } from '@hina-ui/vue'
  import { profileSchema } from '~/features/space/schemas/setting.schema'
  import { useProfileForm } from '~/features/space/useProfileForm'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingProfileForm' })

  const props = defineProps<{ user: CurrentUser }>()
  const { form, values, submitting, avatar, headCover, submit, reset } = useProfileForm(props.user)

  const usernameDialog = ref(false)
  const usernameHint = computed(() =>
    props.user.username_changed ? '你的唯一标识，无法再次更改' : '你的唯一标识，你有一次修改机会',
  )
</script>

<template>
  <Panel
    title="个人资料"
    description="在此页面更新你的个人资料，所有更改需点击 保存修改 按钮后才能生效"
  >
    <Stack gap="lg">
      <SpaceSettingImageField
        v-model="avatar"
        shape="circle"
        label="头像"
        hint="支持 JPG / PNG / WebP，展示为圆形"
        button-label="更换头像"
      />

      <Divider />

      <SpaceSettingImageField
        v-model="headCover"
        shape="banner"
        label="个人主页封面"
        hint="建议 6:1（如 3000×500），展示在主页顶部"
        button-label="更换封面"
      />

      <Divider />

      <FormField label="用户名" :description="usernameHint" description-placement="control">
        <Inline gap="sm" align="center" :wrap="false">
          <Input :model-value="user.name" disabled class="flex-1" />
          <Button
            v-if="!user.username_changed"
            variant="outline"
            tone="neutral"
            class="shrink-0"
            @click="usernameDialog = true"
          >
            修改
          </Button>
        </Inline>
      </FormField>

      <Divider />

      <Form
        ref="form"
        :values="values"
        :rules="profileSchema"
        :disabled="submitting"
        @submit="submit"
      >
        <FormField
          name="nickname"
          label="昵称"
          description="展示在主页和动态，可随时修改；留空则显示用户名"
          description-placement="control"
        >
          <Input v-model="values.nickname" autocomplete="off" />
        </FormField>

        <FormField
          name="signature"
          label="个性签名"
          description="显示在你名字下方，最多 120 字"
          description-placement="control"
        >
          <Input v-model="values.signature" autocomplete="off" />
        </FormField>

        <FormField
          name="bio"
          label="简介"
          description="介绍一下自己，会显示在动态侧的资料区"
          description-placement="control"
        >
          <Textarea v-model="values.bio" :autosize="{ minRows: 4 }" />
        </FormField>

        <Divider />

        <Inline gap="sm">
          <Button type="submit" :loading="submitting">保存修改</Button>
          <Button variant="ghost" tone="neutral" :disabled="submitting" @click="reset">取消</Button>
        </Inline>
      </Form>
    </Stack>

    <UserChangeUsernameDialog v-model:visible="usernameDialog" :current="user.name" />
  </Panel>
</template>
