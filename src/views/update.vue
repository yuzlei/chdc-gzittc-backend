<script setup lang="ts">
import {ref, onMounted, watch} from "vue"
import {ElMessage} from 'element-plus'
import {
  ElButton,
  ElInput,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDialog,
  ElForm,
  ElFormItem,
  ElUpload
} from "element-plus"
import {Search} from "@element-plus/icons-vue";
import {barData, apiUrl} from "@/config"
import {deepClone, formatTime, debounce} from "@/utils"
import content from "@/components/content.vue"
import axios from "axios"
import router from "@/router";
import type {Ref} from "vue"
import type {UploadFile} from "element-plus";
import type {IAbridgeUpdatesViewList, IAbridgeUpdatesView} from "@/types"

const [{name}] = barData

const formData: IAbridgeUpdatesView = {
  title: '',
  author: '',
  cover: '',
}

const cover: Ref<Array<UploadFile>> = ref([])

const form: Ref<IAbridgeUpdatesView> = ref(deepClone(formData))

const deleteId: Ref<string> = ref("")

const state: Ref<boolean> = ref(false)

const deleteState: Ref<boolean> = ref(false)

const total: Ref<number> = ref(10)

const searchValue: Ref<string> = ref("")

const pageNum: Ref<null | number> = ref(null)

const num: Ref<number> = ref(1)

let tableNormalData: IAbridgeUpdatesViewList | null = null

let tableData: Ref<IAbridgeUpdatesViewList> | null = ref(null)

const handleSortChange = ({prop, order}): void => {
  if (prop === "Date") {
    switch (order) {
      case "ascending":
        tableData.value = deepClone(tableData.value.sort((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()))
        break;
      case "descending":
        tableData.value = deepClone(tableData.value.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()))
        break;
      default:
        tableData.value = deepClone(tableNormalData)
        break;
    }
  }
}

const handleDelete = (id: string): void => {
  deleteState.value = true
  deleteId.value = id
}

const deleteUpdate = async (): Promise<void> => {
  try {
    await axios.delete(`${apiUrl}/updates/${deleteId.value}`)
    ElMessage({
      message: '删除动态成功',
      type: 'success'
    })
    await getSearch(searchValue.value, num.value)
  } catch (e) {
    ElMessage({
      message: '删除动态失败',
      type: 'error'
    })
  } finally {
    deleteState.value = false
    deleteId.value = ""
  }
}

const currentChange = async (value: number): Promise<void> => {
  num.value = value
  await getSearch(searchValue.value, num.value)
}

const clearForm = (): void => {
  form.value = deepClone(formData)
  cover.value = []
}

onMounted(async () => await getSearch(searchValue.value, num.value))

const upload = async (): Promise<void> => {
  const data = new FormData()
  for (const item in form.value) item !== "cover" ? data.append(item, form.value[item]) : data.append('cover', cover.value[0]?.raw)
  try {
    await axios.post(`${apiUrl}/updates/`, data, {headers: {'content-type': 'multipart/form-data'}})
    ElMessage({
      message: '添加动态成功',
      type: 'success'
    })
    await getSearch(searchValue.value, num.value)
  } catch (e) {
    ElMessage({
      message: '添加动态失败',
      type: 'error'
    })
  } finally {
    state.value = false
    clearForm()
  }
}

const getSearch = async (str: string, num: number = 1): Promise<void> => {
  const [countRes, dataRes] = await Promise.all([
    axios.get(`http://localhost:3000/updates/searchPageNum?search=${str}`),
    axios.get(`http://localhost:3000/updates/search/${num}?search=${str}`),
  ])
  pageNum.value = countRes.data.count
  tableData.value = deepClone(dataRes.data)
  tableNormalData = deepClone(dataRes.data)
}

const debouncedHandleSearch: (newVal: string) => void = debounce(async (newVal: string) => await getSearch(newVal), 500);

watch(searchValue, (newVal: string) => debouncedHandleSearch(newVal))
</script>

<template>
  <ElDialog destroy-on-close v-model="deleteState" title="删除动态" width="500">
    <span>确认删除吗</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="deleteState = false">取消</el-button>
        <el-button type="primary" @click="deleteUpdate">确认</el-button>
      </div>
    </template>
  </ElDialog>
  <ElDialog destroy-on-close class="dialog" :close-on-click-modal="false" :close-on-press-escape="false"
            :show-close="false" title="添加动态" width="500" v-model="state">
    <ElForm style="max-width: 350px; margin-top: 10px; margin-left: 25px" :model="form">
      <ElFormItem label="动态标题">
        <ElInput v-model="form.title"/>
      </ElFormItem>
      <ElFormItem label="动态作者">
        <ElInput v-model="form.author"/>
      </ElFormItem>
      <ElFormItem label="动态封面">
        <ElUpload action="#" accept=".jpg, .png" :auto-upload="false" v-model:file-list="cover" :limit="1">
          <template #trigger>
            <ElButton :disabled="cover.length > 0" type="primary">选择文件</ElButton>
          </template>
          <template #file="{file}">
            <img :src="file.url" alt="?">
          </template>
        </ElUpload>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="state = false">取消</el-button>
        <el-button type="primary" @click="upload">确定</el-button>
      </div>
    </template>
  </ElDialog>
  <content :title="`${name}管理`">
    <template #btn-area>
      <ElInput :placeholder="`搜索${name}...`" v-model="searchValue" style="margin-right: 25px; width: 230px"
               :suffix-icon="Search"/>
      <ElButton @click="state = true" type="primary">添加{{ name }}</ElButton>
    </template>
    <template #content>
      <ElTable @sort-change="handleSortChange" :table-layout="'fixed'" :data="tableData">
        <ElTableColumn align="center" show-overflow-tooltip prop="Title" label="动态标题">
          <template #default="scope">
            {{ scope.row.title }}
          </template>
        </ElTableColumn>
        <ElTableColumn align="center" show-overflow-tooltip prop="Title" label="动态作者">
          <template #default="scope">
            {{ scope.row.author }}
          </template>
        </ElTableColumn>
        <ElTableColumn align="center" show-overflow-tooltip prop="Title" label="动态内容">
          <template #default="scope">
            {{ scope.row.ellipsis }}
          </template>
        </ElTableColumn>
        <ElTableColumn align="center" show-overflow-tooltip prop="Date" sortable label="更新日期">
          <template #default="scope">
            <span>{{ formatTime(scope.row.createdAt) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn align="center" prop="Operations" label="操作">
          <template #default="scope">
            <ElButton size="small" type="primary" @click="router.push(`/edit/${scope.row._id}`)">编辑</ElButton>
            <ElButton size="small" type="danger" @click="handleDelete(scope.row._id)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination :hide-on-single-page="true" @current-change="currentChange" size="small" background
                    layout="prev, pager, next" :total="total * pageNum"/>
    </template>
  </content>
</template>

<style scoped lang="scss">
@import "@/styles/right_content";
</style>