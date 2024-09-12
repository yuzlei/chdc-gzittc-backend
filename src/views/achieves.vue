<script setup lang="ts">
import content from "@/components/content.vue"
import {ElButton, ElInput} from "element-plus"
import {Search} from "@element-plus/icons-vue";
import {barData} from "@/config"

const [, , {name}] = barData
</script>

<template>
  <content :title="`${name}管理`">
    <template #btn-area>
      <ElInput :placeholder="`搜索${name}...`" style="margin-right: 25px; width: 230px" :suffix-icon="Search"/>
      <ElButton type="primary">添加{{ name }}</ElButton>
    </template>
    <template #content>

    </template>
  </content>
</template>

<style scoped lang="scss">
@import "@/styles/right_content";
</style>