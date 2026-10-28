<script setup>
defineProps({ title: { type: String, required: true } })
</script>

<template>
  <header
    class="sticky top-0 z-10 bg-topo px-4 pb-3 text-topo-texto pt-[calc(env(safe-area-inset-top,0px)+10px)]"
  >
    <div class="mx-auto flex max-w-[640px] items-baseline gap-2.5">
      <span class="text-xs font-bold uppercase tracking-[0.12em] opacity-75">Magic Prompt</span>
      <h1 class="m-0 text-xl font-extrabold">{{ title }}</h1>
    </div>
  </header>
</template>
