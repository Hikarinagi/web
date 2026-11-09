<script setup lang="ts">
  definePageMeta({
    layout: 'creator',
    title: '编辑条目',
    floatingToolbar: false,
    middleware: ['auth', 'wiki-editor-content-limit', 'wiki-resource-target'],
  })
</script>
