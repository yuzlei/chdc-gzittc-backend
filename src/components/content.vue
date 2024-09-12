<script setup lang="ts">
defineProps<{ title: string }>();

</script>

<template>
  <div class="box">
    <div class="header">
      <p>{{ title }}</p>
      <div class="btn-area">
        <slot name="btn-area"></slot>
      </div>
    </div>
    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/content";
</style>