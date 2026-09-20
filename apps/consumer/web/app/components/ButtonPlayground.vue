<script setup lang="ts">
  import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Check,
    Heart,
    Lock,
    Plus,
    Search,
    Settings,
    Trash2,
  } from '@lucide/vue'
  import ButtonPlaygroundLoading from './playground/ButtonPlaygroundLoading.vue'
  import ButtonPlaygroundNotifications from './playground/ButtonPlaygroundNotifications.vue'
</script>

<template>
  <div class="space-y-8 py-10">
    <header class="space-y-2">
      <p class="text-sm font-medium text-muted-color">Hikarinagi UI</p>
      <h1 class="text-3xl font-semibold tracking-normal text-color">Button Playground</h1>
    </header>

    <section class="space-y-4">
      <h2 class="text-base font-semibold text-color">Variants</h2>
      <div class="flex flex-wrap items-center gap-3">
        <Button label="Primary" />
        <Button label="Secondary" severity="secondary" />
        <Button label="Outlined" variant="outlined" />
        <Button label="Text" variant="text" />
        <Button label="Link" variant="link" />
        <Button label="Disabled" disabled severity="secondary" />
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-base font-semibold text-color">Sizes</h2>
      <div class="flex flex-wrap items-center gap-3">
        <Button label="Small" size="small" />
        <Button label="Default" />
        <Button label="Large" size="large" />
        <Button aria-label="Small icon" rounded size="small" variant="text">
          <template #icon>
            <Settings class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Default icon" rounded variant="text">
          <template #icon>
            <Settings class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Large icon" rounded size="large" variant="text">
          <template #icon>
            <Settings class="size-5" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-base font-semibold text-color">Icon Positions</h2>
      <div class="flex flex-wrap items-center gap-3">
        <Button icon-pos="left" label="Left">
          <template #icon>
            <ArrowLeft class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button icon-pos="right" label="Right" severity="secondary">
          <template #icon>
            <ArrowRight class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button icon-pos="top" label="Top" variant="outlined">
          <template #icon>
            <ArrowUp class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button icon-pos="bottom" label="Bottom" variant="outlined" severity="secondary">
          <template #icon>
            <ArrowDown class="size-4" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-base font-semibold text-color">Icon Only</h2>
      <div class="flex flex-wrap items-center gap-3">
        <Button aria-label="Search" rounded variant="text">
          <template #icon>
            <Search class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Add" rounded>
          <template #icon>
            <Plus class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Favorite" rounded severity="secondary" variant="outlined">
          <template #icon>
            <Heart class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Delete" rounded severity="danger" variant="text">
          <template #icon>
            <Trash2 class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Small search" rounded size="small" variant="text">
          <template #icon>
            <Search class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Small confirm" rounded severity="secondary" size="small">
          <template #icon>
            <Check class="size-4" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-base font-semibold text-color">Icon Sizes</h2>
      <div class="flex flex-wrap items-center gap-3">
        <Button aria-label="Default icon size" rounded variant="text">
          <template #icon>
            <Settings aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Icon size 3" rounded variant="text">
          <template #icon>
            <Settings class="size-3" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Icon size 4" rounded variant="text">
          <template #icon>
            <Settings class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Icon size 5" rounded variant="text">
          <template #icon>
            <Settings class="size-5" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Icon size 6" rounded variant="text">
          <template #icon>
            <Settings class="size-6" aria-hidden="true" />
          </template>
        </Button>
        <Button aria-label="Small icon size 5" rounded size="small" variant="text">
          <template #icon>
            <Settings class="size-5" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </section>

    <ButtonPlaygroundLoading />

    <section class="space-y-4">
      <h2 class="text-base font-semibold text-color">Auth</h2>
      <div class="flex flex-wrap items-center gap-3">
        <Button label="Login required" login-required severity="secondary">
          <template #icon>
            <Lock class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button
          aria-label="Login required icon"
          login-required
          rounded
          severity="secondary"
          variant="text"
        >
          <template #icon>
            <Lock class="size-4" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </section>

    <ButtonPlaygroundNotifications />
  </div>
</template>
