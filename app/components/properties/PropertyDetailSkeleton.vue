<template>
  <div class="flex flex-col gap-8 animate-pulse" aria-hidden="true">
    <!-- Property Header & Overview Skeleton -->
    <section
      class="shadow-xs flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
      <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div class="flex flex-col gap-2.5 w-full max-w-xl">
          <!-- Tag skeleton -->
          <div class="h-3.5 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
          <!-- Title skeleton -->
          <div class="h-8 w-3/4 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <!-- Address skeleton -->
          <div class="flex items-center gap-2">
            <div class="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
            <div class="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        <div class="shrink-0">
          <!-- Availability badge skeleton -->
          <div class="h-6 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>

      <!-- About Property Description Skeleton -->
      <div class="flex flex-col gap-2.5 border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <div class="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div class="space-y-2 pt-1">
          <div class="h-3.5 w-full rounded bg-neutral-200/80 dark:bg-neutral-800/80" />
          <div class="h-3.5 w-11/12 rounded bg-neutral-200/80 dark:bg-neutral-800/80" />
          <div class="h-3.5 w-3/4 rounded bg-neutral-200/80 dark:bg-neutral-800/80" />
        </div>
      </div>

      <!-- Amenities Skeleton -->
      <div class="flex flex-col gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <div class="h-3 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          <div v-for="i in 6" :key="i"
            class="h-8 rounded-lg border border-neutral-200 bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60" />
        </div>
      </div>
    </section>

    <!-- Photo Gallery Skeleton -->
    <section
      class="shadow-xs overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div class="h-5 w-36 rounded bg-neutral-200 dark:bg-neutral-800 mb-4" />
      <div class="aspect-16/9 sm:aspect-21/9 w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
    </section>

    <!-- Available Units Skeleton -->
    <section
      class="shadow-xs flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div class="flex items-center justify-between">
        <div class="h-5 w-44 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div class="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 pt-2">
        <div v-for="i in 3" :key="i"
          class="flex flex-col justify-between rounded-xl border border-neutral-200 p-5 dark:border-neutral-800 dark:bg-neutral-900/50 h-44">
          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <div class="h-5 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div class="h-4 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
            <div class="h-3.5 w-32 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div class="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <div class="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div class="h-7 w-20 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
