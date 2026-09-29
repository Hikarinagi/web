<script setup lang="ts">
  import { List, ListItem, Stack, Text } from '@hina-ui/vue'
  import { MANGA_START, MANGA_WAYS, NOVEL_WAYS } from '~/features/contribute/ways'

  const props = defineProps<{ kind: 'novel' | 'manga' }>()

  const ways = computed(() => (props.kind === 'manga' ? MANGA_WAYS : NOVEL_WAYS))
</script>

<template>
  <Stack gap="sm" class="text-fg">
    <Text size="sm">
      {{ kind === 'manga' ? '投稿漫画章节有两种方法。' : '投稿轻小说分卷的方法有 3 种。' }}
    </Text>
    <List>
      <ListItem v-for="way in ways" :key="way.label">
        <Text size="sm">
          <Text as="span" size="sm" weight="medium">{{ way.label }}：</Text>{{ way.text }}
        </Text>
      </ListItem>
    </List>
    <Text v-if="kind === 'manga'" size="sm">{{ MANGA_START }}</Text>
  </Stack>
</template>
