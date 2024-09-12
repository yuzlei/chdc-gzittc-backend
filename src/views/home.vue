<script setup lang="ts">
import bar from "@/components/bar.vue"
import right from "@/components/right.vue"
import {barData} from "@/config"

</script>

<template>
  <div class="panel">
    <bar style="flex: 2" :bar="barData"></bar>
    <right style="flex: 11"></right>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/home";
</style>