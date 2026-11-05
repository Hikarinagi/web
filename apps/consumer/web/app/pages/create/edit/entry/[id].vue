<script setup lang="ts">
  definePageMeta({ redirect: to => `/entries/${String(to.params.id)}/edit` })
</script>
