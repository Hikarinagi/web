<script setup lang="ts">
  import Form from '@primevue/forms/form'
  import { useProfileForm } from '~/features/space/useProfileForm'
  import type { CurrentUser } from '~/types/auth'

  defineOptions({ name: 'SpaceSettingProfileForm' })

  const props = defineProps<{ user: CurrentUser }>()
  const { formErrors, submitting, avatar, headCover, initialValues, submit, reset } =
    useProfileForm(props.user)

  const usernameDialog = ref(false)
</script>

<template>
  <CardPanel
    title="个人资料"
    description="在此页面更新你的个人资料，所有更改需点击 保存修改 按钮后才能生效"
  >
    <div class="flex flex-col gap-6">
      <SpaceSettingImageField
        v-model="avatar"
        shape="circle"
        label="头像"
        hint="支持 JPG / PNG / WebP,展示为圆形"
        button-label="更换头像"
      />

      <div class="border-t border-surface-100 dark:border-surface-800" />

      <SpaceSettingImageField
        v-model="headCover"
        shape="banner"
        label="个人主页封面"
        hint="建议 6:1(如 3000×500),展示在主页顶部"
        button-label="更换封面"
      />

      <div class="border-t border-surface-100 dark:border-surface-800" />

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-color">用户名</label>
        <div class="flex items-center gap-2">
          <InputText :model-value="user.name" disabled fluid />
          <Button
            v-if="!user.username_changed"
            label="修改"
            severity="secondary"
            variant="outlined"
            class="shrink-0"
            @click="usernameDialog = true"
          />
        </div>
        <p class="text-xs text-muted-color">
          {{
            user.username_changed ? '你的唯一标识，无法再次更改' : '你的唯一标识，你有一次修改机会'
          }}
        </p>
      </div>

      <div class="border-t border-surface-100 dark:border-surface-800" />

      <Form
        ref="form"
        :resolver="formErrors.resolver"
        :initial-values="initialValues"
        class="flex flex-col gap-5"
        @input="formErrors.clear"
        @submit="submit"
      >
        <FormItem v-slot="{ id, errorId }" name="nickname" label="昵称">
          <InputText :id="id" :aria-describedby="errorId" fluid autocomplete="off" />
          <p class="text-xs text-muted-color">展示在主页和动态,可随时修改;留空则显示用户名</p>
        </FormItem>

        <FormItem v-slot="{ id, errorId }" name="signature" label="个性签名">
          <InputText :id="id" :aria-describedby="errorId" fluid autocomplete="off" />
          <p class="text-xs text-muted-color">显示在你名字下方,最多 120 字</p>
        </FormItem>

        <FormItem v-slot="{ id, errorId }" name="bio" label="简介">
          <Textarea :id="id" :aria-describedby="errorId" rows="4" fluid auto-resize />
          <p class="text-xs text-muted-color">介绍一下自己,会显示在动态侧的资料区</p>
        </FormItem>

        <div
          class="flex items-center gap-3 border-t border-surface-100 pt-5 dark:border-surface-800"
        >
          <Button label="保存修改" type="submit" :loading="submitting" />
          <Button
            label="取消"
            severity="secondary"
            variant="text"
            :disabled="submitting"
            @click="reset"
          />
        </div>
      </Form>
    </div>

    <UserChangeUsernameDialog v-model:visible="usernameDialog" :current="user.name" />
  </CardPanel>
</template>
