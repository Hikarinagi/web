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
  const { t } = useLocaleText()
  const { form, values, submitting, avatar, headCover, submit, reset } = useProfileForm(props.user)

  const usernameDialog = ref(false)
  const usernameHint = computed(() =>
    props.user.username_changed
      ? t('setting.profile.usernameLocked')
      : t('setting.profile.usernameOnce'),
  )
</script>

<template>
  <Panel :title="t('setting.nav.profile')" :description="t('setting.profile.description')">
    <Stack gap="lg">
      <SpaceSettingImageField
        v-model="avatar"
        shape="circle"
        :label="t('setting.profile.avatar')"
        :hint="t('setting.profile.avatarHint')"
        :button-label="t('setting.profile.avatarButton')"
        :crop-title="t('setting.profile.avatarCrop')"
      />

      <Divider />

      <SpaceSettingImageField
        v-model="headCover"
        shape="banner"
        :label="t('setting.profile.cover')"
        :hint="t('setting.profile.coverHint')"
        :button-label="t('setting.profile.coverButton')"
        :crop-title="t('setting.profile.coverCrop')"
      />

      <Divider />

      <FormField
        :label="t('setting.profile.username')"
        :description="usernameHint"
        description-placement="control"
      >
        <Inline gap="sm" align="center" :wrap="false">
          <Input :model-value="user.name" disabled class="flex-1" />
          <Button
            v-if="!user.username_changed"
            variant="outline"
            tone="neutral"
            class="shrink-0"
            @click="usernameDialog = true"
          >
            {{ t('setting.profile.usernameChange') }}
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
          :label="t('setting.profile.nickname')"
          :description="t('setting.profile.nicknameHint')"
          description-placement="control"
        >
          <Input v-model="values.nickname" autocomplete="off" />
        </FormField>

        <FormField
          name="signature"
          :label="t('setting.profile.signature')"
          :description="t('setting.profile.signatureHint')"
          description-placement="control"
        >
          <Input v-model="values.signature" autocomplete="off" />
        </FormField>

        <FormField
          name="bio"
          :label="t('setting.profile.bio')"
          :description="t('setting.profile.bioHint')"
          description-placement="control"
        >
          <Textarea v-model="values.bio" :autosize="{ minRows: 4 }" />
        </FormField>

        <Divider />

        <Inline gap="sm">
          <Button type="submit" :loading="submitting">{{ t('setting.profile.submit') }}</Button>
          <Button variant="ghost" tone="neutral" :disabled="submitting" @click="reset">
            {{ t('common.cancel') }}
          </Button>
        </Inline>
      </Form>
    </Stack>

    <UserChangeUsernameDialog v-model:visible="usernameDialog" :current="user.name" />
  </Panel>
</template>
