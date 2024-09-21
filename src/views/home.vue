<script setup lang="ts">
import {setId} from "@/utils";
import {useRoute} from "vue-router";
import {Management, Medal, User} from "@element-plus/icons-vue";
import bar from "@/components/bar.vue"
import right from "@/components/right.vue"
import type {IBarList} from "@/types";

const barData: IBarList = setId([{
  name: "动态",
  href: "/home/update",
  icon: Management,
}, {
  name: "成员",
  href: "/home/member",
  icon: User,
}, {
  name: "成就",
  href: "/home/achieves",
  icon: Medal,
}])
</script>

<template>
  <div class="panel">
    <bar style="flex: 2" :active="useRoute().path" :bar="barData"></bar>
    <right style="flex: 11"></right>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/home";
</style>