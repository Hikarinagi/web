<script setup lang="ts">
  defineOptions({ name: 'DeveloperLandingHeroTerminal' })

  const origin = useRequestURL().origin

  const lines = [
    {
      segments: [
        { text: '$ ', accent: true },
        {
          text: `curl --get "${origin}/api/v3/open/search" \\`,
          accent: false,
        },
      ],
      muted: false,
    },
    {
      segments: [
        {
          text: '    --data-urlencode "q=Yozora no Hoshi o" \\',
          accent: false,
        },
      ],
      muted: false,
    },
    {
      segments: [
        {
          text: '    -H "Authorization: Bearer $ACCESS_TOKEN"',
          accent: false,
        },
      ],
      muted: false,
    },
    { segments: [{ text: '{', accent: false }], muted: true },
    {
      segments: [
        { text: '  "success": ', accent: false },
        { text: 'true,', accent: true },
      ],
      muted: true,
    },
    {
      segments: [
        {
          text: '  "data": { "items": [ … ], "meta": { … } }',
          accent: false,
        },
      ],
      muted: true,
    },
    { segments: [{ text: '}', accent: false }], muted: true },
  ]
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-surface bg-surface-100 shadow-lg dark:border-surface-800 dark:bg-surface-950"
  >
    <div
      class="flex items-center gap-1.5 border-b border-surface-200 px-4 py-3 dark:border-surface-800"
    >
      <span class="size-2.5 rounded-full bg-surface-300 dark:bg-surface-600" />
      <span class="size-2.5 rounded-full bg-surface-300 dark:bg-surface-600" />
      <span class="size-2.5 rounded-full bg-surface-300 dark:bg-surface-600" />
      <span class="ml-2 font-mono text-xs text-surface-500">terminal</span>
    </div>

    <ScrollArea axis="x">
      <pre class="px-4 py-4 font-mono text-xs leading-6 sm:text-sm"><div
        v-for="(line, index) in lines"
        :key="index"
      ><span
          v-for="(segment, segmentIndex) in line.segments"
          :key="segmentIndex"
          :class="
            segment.accent
              ? 'text-hikari-primary-600 dark:text-hikari-primary-400'
              : line.muted
                ? 'text-surface-500 dark:text-surface-400'
                : 'text-surface-800 dark:text-surface-100'
          "
        >{{ segment.text }}</span></div></pre>
    </ScrollArea>
  </div>
</template>
