<template>
  <article
    class="shadow-xs flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all dark:border-neutral-800 dark:bg-neutral-900 animate-pulse"
    aria-hidden="true">
    <!-- Card Image Header -->
    <div class="relative aspect-16/10 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
      <div class="absolute inset-x-3 top-3 flex items-center justify-between">
        <!-- Badge skeleton -->
        <div class="h-5 w-24 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <!-- City badge skeleton -->
        <div class="h-5 w-16 rounded-md bg-neutral-300 dark:bg-neutral-700" />
      </div>
    </div>

    <!-- Card Body -->
    <div class="flex flex-1 flex-col justify-between gap-3 p-5">
      <div class="flex flex-col gap-2">
        <!-- Title skeleton -->
        <div class="h-5 w-3/4 rounded-md bg-neutral-200 dark:bg-neutral-800" />

        <!-- Location skeleton -->
        <div class="flex items-center gap-1.5">
          <div class="h-3.5 w-3.5 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <div class="h-3.5 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <!-- Description lines -->
        <div class="space-y-1.5 pt-1">
          <div class="h-3 w-full rounded bg-neutral-200/80 dark:bg-neutral-800/80" />
          <div class="h-3 w-4/5 rounded bg-neutral-200/80 dark:bg-neutral-800/80" />
        </div>

        <!-- Amenities tags -->
        <div class="mt-1 flex flex-wrap gap-1.5">
          <div class="h-4 w-16 rounded bg-neutral-200/90 dark:bg-neutral-800/90" />
          <div class="h-4 w-20 rounded bg-neutral-200/90 dark:bg-neutral-800/90" />
          <div class="h-4 w-14 rounded bg-neutral-200/90 dark:bg-neutral-800/90" />
        </div>
      </div>

      <!-- Bottom Footer: Price & CTA -->
      <div class="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <div class="flex flex-col gap-1">
          <div class="h-2.5 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div class="h-5 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <!-- CTA Button Skeleton -->
        <div class="h-8 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  </article>
</template>
