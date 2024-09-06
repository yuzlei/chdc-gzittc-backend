<script setup lang="ts">
import {ElMenu, ElMenuItem, ElIcon} from "element-plus"
import {User, Management, Medal} from "@element-plus/icons-vue";
</script>

<template>
  <div class="bar">
    <div class="bar-content">
      <img src="@/assets/images/logo.png" alt="?"/>
      <ElMenu
          default-active="2"
          class="el-menu-vertical-demo"
      >
        <ElMenuItem title="Group Two" index="1">
          <template #title>
            <ElIcon>
              <Management />
            </ElIcon>
            <span>文章管理</span>
          </template>
        </ElMenuItem>
        <ElMenuItem title="Group Two" index="2">
          <template #title>
            <ElIcon>
              <Medal />
            </ElIcon>
            <span>成就管理</span>
          </template>
        </ElMenuItem>
        <ElMenuItem title="Group Two" index="3">
          <template #title>
            <ElIcon>
              <User />
            </ElIcon>
            <span>成员管理</span>
          </template>
        </ElMenuItem>
      </ElMenu>
    </div>
  </div>

</template>

<style scoped lang="scss">
@import "@/styles/bar";
</style>