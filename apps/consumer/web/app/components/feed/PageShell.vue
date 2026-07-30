<template>
  <div class="py-4 sm:py-6">
    <div class="mx-auto flex max-w-5xl flex-col items-center gap-6 px-0 sm:px-4">
      <slot name="top" />
      <div class="flex w-full justify-center gap-8">
        <div class="w-150 max-w-full min-w-0">
          <slot />
        </div>
        <CommunitySidebar follow footer>
          <slot name="sidebar" />
        </CommunitySidebar>
      </div>
    </div>
  </div>
</template>
