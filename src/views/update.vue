<script setup lang="ts">
import {ref, onMounted, watch, computed} from "vue"
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
  ElUpload,
  ElIcon
} from "element-plus"
import {storeToRefs} from "pinia";
import {Close, Search} from "@element-plus/icons-vue";
import {apiUrl} from "@/config"
import {
  deepClone,
  formatTime,
  debounce,
  keywords,
  imageRemove,
  imageError,
  imageBeforeUpload,
  completeImagePath
} from "@/utils"
import axios from "axios"
import router from "@/router";
import defaultStore from "@/store"
import content from "@/components/content.vue"
import type {Ref, ComputedRef} from "vue"
import type {UploadFile} from "element-plus";
import type {IAbridgeUpdatesViewList, IAbridgeUpdatesView} from "@/types"

const store = defaultStore()
const {limit} = storeToRefs(store)

const imageRef: Ref<HTMLImageElement | null> = ref(null)
const cover: Ref<Array<UploadFile>> = ref([])
const coverSrc: ComputedRef<string> = computed(() => cover.value?.[0]?.url || (cover.value?.[0]?.response as {
  imgSrc: string
})?.imgSrc)
const deleteId: Ref<Array<string>> = ref([])
const dialogState: Ref<boolean> = ref(false)
const deleteState: Ref<boolean> = ref(false)
const pageTotal: Ref<number | null> = ref(null)
const search: Ref<string> = ref("")
const url: string = `${apiUrl}/updates`
let tableNormalData: IAbridgeUpdatesViewList | null = null
let tableData: Ref<IAbridgeUpdatesViewList> | null = ref(null)

interface IParams {
  page: number
  sort: string | null
  title_regex: string,
  content_text_regex: string,
  author_regex: string
}

const formData: IAbridgeUpdatesView = {
  title: '',
  author: '',
  cover: '',
}

const form: Ref<IAbridgeUpdatesView> = ref(deepClone(formData))

const params: Ref<IParams> = ref({
  page: 1,
  sort: null,
  title_regex: "//",
  content_text_regex: "//",
  author_regex: "//",
})

const handleSortChange = ({prop, order}): void => {
  if (prop === "Date") {
    params.value.sort = order
    switch (params.value.sort) {
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
  deleteId.value.push(id)
}

const deleteUpdate = async (): Promise<void> => {
  try {
    await axios.delete(`${url}/delete/`, {params: {ids: deleteId.value.join(",")}})
    ElMessage({
      message: '删除动态成功',
      type: 'success'
    })
    await getData(params.value)
  } catch (err) {
    console.error(err)
    ElMessage({
      message: '删除动态失败',
      type: 'error'
    })
  } finally {
    deleteState.value = false
    deleteId.value = []
  }
}

const currentChange = async (value: number): Promise<void> => {
  params.value.page = value
  await getData(params.value)
}

const handleCancel = () => {
  dialogState.value = false
  form.value = deepClone(formData)
  cover.value = []
}

const upload = async (): Promise<void> => {
  try {
    form.value.cover = coverSrc.value
    await axios.post(`${url}/create`, {...form.value, cover: completeImagePath(coverSrc.value, false)})
    ElMessage({
      message: '添加动态成功',
      type: 'success'
    })
    await getData(params.value)
  } catch (err) {
    console.error(err)
    ElMessage({
      message: '添加动态失败',
      type: 'error'
    })
  } finally {
    handleCancel()
  }
}

const goEdit = (id: string): void => {
  store.setUpdateId(id)
  router.push(`/edit`)
}

const getData = async (params: Record<string, any>): Promise<void> => {
  const {data: {data, pageTotal: _pageTotal}} = await axios.get(`${url}/pages_condition`, {params})
  pageTotal.value = _pageTotal
  tableData.value = deepClone(data)
  tableNormalData = deepClone(data)
}

const debouncedHandleSearch: (newVal: IParams) => void = debounce(async (): Promise<void> => await getData(params.value), 500);

watch(params, (newVal: IParams) => debouncedHandleSearch(newVal), {deep: true})
watch(search, (newVal: string) => {
  params.value.title_regex = `/${newVal}/`
  params.value.content_text_regex = `/${newVal}/`
  params.value.author_regex = `/${newVal}/`
})

onMounted(async () => await getData(params.value))
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
            :show-close="false" title="添加动态" width="500" v-model="dialogState">
    <ElForm style="max-width: 350px; margin-top: 10px; margin-left: 25px" :model="form">
      <ElFormItem label="动态标题">
        <ElInput v-model="form.title"/>
      </ElFormItem>
      <ElFormItem label="动态作者">
        <ElInput v-model="form.author"/>
      </ElFormItem>
      <ElFormItem label="动态封面">
        <ElUpload :before-upload="imageBeforeUpload" :action="`${url}/upload`" accept=".jpg, .png"
                  v-model:file-list="cover" :limit="1">
          <template #trigger>
            <ElButton :disabled="cover.length > 0" type="primary">选择文件</ElButton>
          </template>
          <template #file="{file}">
            <div class="file">
              <img @error="imageError(imageRef, coverSrc)" ref="imageRef" :src="coverSrc" alt="?">
              <span @click="imageRemove(file, cover, coverSrc, `${url}/clear`)">
                <ElIcon>
                  <Close/>
                </ElIcon>
              </span>
            </div>
          </template>
        </ElUpload>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="upload">确定</el-button>
      </div>
    </template>
  </ElDialog>
  <content title="动态管理">
    <template #btn-area>
      <ElInput :placeholder="`搜索标题、作者、内容...`" v-model="search" style="margin-right: 25px; width: 250px"
               :suffix-icon="Search"/>
      <ElButton @click="dialogState = true" type="primary">添加动态</ElButton>
    </template>
    <template #content>
      <ElTable @sort-change="handleSortChange" :table-layout="'fixed'" :data="tableData">
        <ElTableColumn :align="'center'" show-overflow-tooltip prop="Title" label="动态标题">
          <template #default="scope">
            <p v-html="keywords(scope.row.title, search)"></p>
          </template>
        </ElTableColumn>
        <ElTableColumn :align="'center'" show-overflow-tooltip prop="Author" label="动态作者">
          <template #default="scope">
            <p v-html="keywords(scope.row.author, search)"></p>
          </template>
        </ElTableColumn>
        <ElTableColumn :align="'center'" show-overflow-tooltip prop="Ellipsis" label="动态内容">
          <template #default="scope">
            <p v-html="keywords(scope.row.ellipsis, search)"></p>
          </template>
        </ElTableColumn>
        <ElTableColumn :align="'center'" show-overflow-tooltip prop="Date" sortable label="更新日期">
          <template #default="scope">
            <span>{{ formatTime(scope.row.createdAt) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :align="'center'" prop="Operations" label="操作">
          <template #default="scope">
            <ElButton size="small" type="primary" @click="goEdit(scope.row._id)">编辑</ElButton>
            <ElButton size="small" type="danger" @click="handleDelete(scope.row._id)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
      <ElPagination :hide-on-single-page="true" @current-change="currentChange" size="small" background
                    layout="prev, pager, next" :total="limit * pageTotal" :pager-count="5"/>
    </template>
  </content>
</template>

<style scoped lang="scss">
@import "@/styles/right_content";
</style>