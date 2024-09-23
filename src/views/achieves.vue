<script setup lang="ts">
import {
  ElButton, ElDialog, ElForm, ElFormItem, ElIcon,
  ElInput,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElUpload,
} from "element-plus"
import {Close, Search} from "@element-plus/icons-vue";
import {
  debounce,
  deepClone,
  formatTime,
  keywords,
  getImageName,
  imageRemove,
  imageError,
  imageBeforeUpload,
  completeImagePath
} from "@/utils";
import {computed, onMounted, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {apiUrl} from "@/config";
import defaultStore from "@/store";
import content from "@/components/content.vue"
import axios from "axios";
import type {Ref, ComputedRef} from "vue"
import type {UploadFile} from "element-plus"
import type {IAchieve, IAchieveList} from "@/types";

const store = defaultStore()
const {limit} = storeToRefs(store)

const imageRef: Ref<HTMLImageElement | null> = ref(null)
const img: Ref<Array<UploadFile>> = ref([])
const imgSrc: ComputedRef<string> = computed(() => img.value?.[0]?.url || (img.value?.[0]?.response as {
  imgSrc: string
})?.imgSrc)
const deleteId: Ref<Array<string>> = ref([])
const updateId: Ref<string> = ref("")
const dialogState: Ref<boolean> = ref(false)
const editState: Ref<boolean> = ref(false)
const deleteState: Ref<boolean> = ref(false)
const pageTotal: Ref<number | null> = ref(null)
const search: Ref<string> = ref("")
const url = `${apiUrl}/achieves`
let tableNormalData: IAchieveList | null = null
let tableData: Ref<IAchieveList> | null = ref(null)

interface IParams {
  page: number
  sort: string | null
  name_regex: string,
}

const params: Ref<IParams> = ref({
  page: 1,
  sort: null,
  name_regex: "//",
})

const formData: IAchieve = {
  name: '',
  imgSrc: '',
}

const form: Ref<IAchieve> = ref(deepClone(formData))

const handleDelete = (id: string): void => {
  deleteState.value = true
  deleteId.value.push(id)
}

const edit = (id: string): void => {
  updateId.value = id
  editState.value = true
  dialogState.value = true
}

const deleteUpdate = async (): Promise<void> => {
  try {
    await axios.delete(`${url}/delete/`, {params: {ids: deleteId.value.join(",")}})
    ElMessage({
      message: '删除成就成功',
      type: 'success'
    })
    await getData(params.value)
  } catch (err) {
    console.error(err)
    ElMessage({
      message: '删除成就失败',
      type: 'error'
    })
  } finally {
    deleteState.value = false
    deleteId.value = []
  }
}

const getData = async (params: Record<string, any>): Promise<void> => {
  let {data: {data, pageTotal: _pageTotal}} = await axios.get(`${url}/pages_condition`, {params})
  for (const item of data) item.imgSrc = completeImagePath(item.imgSrc)
  pageTotal.value = _pageTotal
  tableData.value = deepClone(data)
  tableNormalData = deepClone(data)
}

const debouncedHandleSearch: (newVal: IParams) => void = debounce(async (_: IParams): Promise<void> => await getData(params.value), 500);

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

const currentChange = async (value: number): Promise<void> => {
  params.value.page = value
  await getData(params.value)
}

const handleCancel = () => {
  dialogState.value = false
  editState.value = false
  form.value = deepClone(formData)
  img.value = []
}

const upload = async (): Promise<void> => {
  try {
    form.value.imgSrc = imgSrc.value
    await axios.post(`${url}/create`, {...form.value, imgSrc: completeImagePath(imgSrc.value, false)})
    ElMessage({
      message: '添加成就成功',
      type: 'success'
    })
    await getData(params.value)
  } catch (err) {
    console.error(err)
    ElMessage({
      message: '添加成就失败',
      type: 'error'
    })
  } finally {
    handleCancel()
  }
}

const handleEdit = async (): Promise<void> => {
  try {
    form.value.imgSrc = imgSrc.value
    await axios.put(`${url}/${updateId.value}`, {...form.value, imgSrc: completeImagePath(imgSrc.value, false)})
    ElMessage({
      message: '修改成就成功',
      type: 'success'
    })
    await getData(params.value)
  } catch (err) {
    console.error(err)
    ElMessage({
      message: '修改成就失败',
      type: 'error'
    })
  } finally {
    handleCancel()
  }
}

const getIdData = async (): Promise<void> => {
  try {
    const data = await axios.get(`${url}/search`, {params: {_id: updateId.value}})
    for (const item of data.data) item.imgSrc = completeImagePath(item.imgSrc)
    form.value = data.data[0]
    const imgSrc_ = form.value.imgSrc
    img.value = [{
      name: getImageName(imgSrc_),
      url: imgSrc_,
      status: 'success',
      uid: 0,
    }]
  } catch (err) {
    console.error(err)
    ElMessage({
      message: '获取数据失败',
      type: 'error'
    })
  }
}

watch(params, (newVal: IParams) => debouncedHandleSearch(newVal), {deep: true})
watch(search, (newVal: string) => params.value.name_regex = `/${newVal}/`)
watch(editState, async (newVal: boolean) => newVal ? await getIdData() : null)

onMounted(async () => await getData(params.value))
</script>

<template>
  <ElDialog destroy-on-close v-model="deleteState" title="删除成就" width="500">
    <span>确认删除吗</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="deleteState = false">取消</el-button>
        <el-button type="primary" @click="deleteUpdate">确认</el-button>
      </div>
    </template>
  </ElDialog>
  <ElDialog destroy-on-close class="dialog" :close-on-click-modal="false" :close-on-press-escape="false"
            :show-close="false" :title="editState ? '修改成就' : '添加成就'" width="500" v-model="dialogState">
    <ElForm style="max-width: 350px; margin-top: 10px; margin-left: 25px" :model="form">
      <ElFormItem label="成就名字">
        <ElInput v-model="form.name"/>
      </ElFormItem>
      <ElFormItem label="成就图标">
        <ElUpload :before-upload="imageBeforeUpload" :action="`${url}/upload`" accept=".jpg, .png"
                  v-model:file-list="img" :limit="1">
          <template #trigger>
            <ElButton :disabled="img.length > 0" type="primary">选择文件</ElButton>
          </template>
          <template #file="{file}">
            <div class="file">
              <img @error="imageError(imageRef, imgSrc)" ref="imageRef" :src="imgSrc" alt="?">
              <span @click="imageRemove(file, img, imgSrc,`${url}/clear`)">
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
        <el-button v-if="!editState" type="primary" @click="upload">确定</el-button>
        <el-button v-if="editState" type="primary" @click="handleEdit">确定</el-button>
      </div>
    </template>
  </ElDialog>
  <content :title="`成就管理`">
    <template #btn-area>
      <ElInput :placeholder="`搜索名字...`" style="margin-right: 25px; width: 230px" v-model="search"
               :suffix-icon="Search"/>
      <ElButton @click="dialogState = true" type="primary">添加成就</ElButton>
    </template>
    <template #content>
      <ElTable @sort-change="handleSortChange" :table-layout="'fixed'" :data="tableData">
        <ElTableColumn :align="'center'" show-overflow-tooltip prop="Title" label="成就标题">
          <template #default="scope">
            <p v-html="keywords(scope.row.name, search)"></p>
          </template>
        </ElTableColumn>
        <ElTableColumn :align="'center'" show-overflow-tooltip prop="Date" sortable label="更新日期">
          <template #default="scope">
            <span>{{ formatTime(scope.row.createdAt) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn :align="'center'" prop="Operations" label="操作">
          <template #default="scope">
            <ElButton size="small" type="primary" @click="edit(scope.row._id)">编辑</ElButton>
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