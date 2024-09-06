<script setup lang="ts">
import content from "@/components/content.vue"
import {ElButton, ElInput, ElSelect, ElOption} from "element-plus"
import {Search} from "@element-plus/icons-vue";
import {setId} from "@/utils";
import {ref} from "vue";

const selectValue = ref(true)

const options = setId([{
  value: true,
  label: '正序排序',
}, {
  value: false,
  label: '倒序排序',
}])

</script>

<template>
  <content :title="'文章管理'">
    <template #btn-area>
      <ElInput
          placeholder="搜索文章..."
          style="margin-right: 25px"
          :suffix-icon="Search"
      />

      <ElSelect
          v-model="selectValue"
          style="margin-right: 25px"
      >
        <ElOption
            v-for="item in options"
            :key="item.id"
            :label="item.label"
            :value="item.value"
        />
      </ElSelect>

      <ElButton type="primary">添加文章</ElButton>
    </template>
  </content>
</template>

<style scoped lang="scss">
@import "@/styles/update";
</style>