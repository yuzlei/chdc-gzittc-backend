<script setup lang="ts">
import {ElMenu, ElMenuItem, ElIcon} from "element-plus"
import {IBarList} from "@/types";

defineProps<{ bar: IBarList }>();
</script>

<template>
  <div class="bar">
    <div class="bar-content">
      <img src="@/assets/images/logo.png" alt="?"/>
      <ElMenu :default-active="bar[0].href" class="el-menu-vertical-demo" router>
        <ElMenuItem v-for="item in bar" :key="item._id" :index="item.href">
          <template #title>
            <ElIcon>
              <component :is="item.icon"></component>
            </ElIcon>
            <span>{{ item.name }}管理</span>
          </template>
        </ElMenuItem>
      </ElMenu>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/bar";
</style>