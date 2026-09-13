<template>
  <section class="space-y-4">
    <h2 class="text-base font-semibold text-color">States</h2>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <figure class="space-y-2">
        <HikariImage
          src="missing/default-skeleton.webp"
          alt="Fallback with default skeleton"
          class="aspect-16/10 w-full rounded-lg border border-surface-200 dark:border-surface-800"
          image-class="object-cover"
        />
        <figcaption class="text-xs text-muted-color">default fallback uses contain</figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImage
          src="/favicon.ico"
          alt="Custom skeleton"
          class="aspect-16/10 w-full rounded-lg border border-surface-200 dark:border-surface-800"
          image-class="object-contain p-8"
          skeleton-class="bg-primary-100! dark:bg-primary-900!"
        />
        <figcaption class="text-xs text-muted-color">custom skeleton class</figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImage
          src="/favicon.ico"
          alt="Custom skeleton slot"
          class="aspect-16/10 w-full rounded-lg border border-surface-200 dark:border-surface-800"
          image-class="object-contain p-8"
        >
          <template #skeleton>
            <div
              class="absolute inset-0 grid place-items-center bg-surface-100 text-xs text-muted-color dark:bg-surface-900"
            >
              loading slot
            </div>
          </template>
        </HikariImage>
        <figcaption class="text-xs text-muted-color">custom skeleton slot</figcaption>
      </figure>

      <figure class="space-y-2">
        <HikariImage
          src="missing/no-fallback.webp"
          fallback-src="missing/fallback.webp"
          alt="Error slot"
          class="aspect-16/10 w-full rounded-lg border border-surface-200 dark:border-surface-800"
        >
          <template #error>
            <div
              class="absolute inset-0 grid place-items-center bg-surface-100 text-xs text-muted-color dark:bg-surface-900"
            >
              error slot
            </div>
          </template>
        </HikariImage>
        <figcaption class="text-xs text-muted-color">error slot when fallback fails</figcaption>
      </figure>
    </div>
  </section>
</template>
