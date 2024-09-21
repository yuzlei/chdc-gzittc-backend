<script setup lang="ts">
import {
  ElButton, ElDialog, ElForm, ElFormItem, ElIcon,
  ElInput,
  ElMessage,
  ElPagination,
  ElTable,
  ElTableColumn,
  ElUpload,
  ElOption,
  ElSelect
} from "element-plus"
import {Close, Search} from "@element-plus/icons-vue";
import {
  debounce,
  deepClone,
  formatTime,
  keywords,
  getImageName,
  setId,
  imageRemove,
  imageError,
  imageBeforeUpload
} from "@/utils";
import {computed, onMounted, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import defaultStore from "@/store";
import axios from "axios";
import content from "@/components/content.vue"
import {apiUrl} from "@/config";
import type {Ref, ComputedRef} from "vue"
import type {IMember, IMemberList} from "@/types";
import type {UploadFile} from "element-plus"

const store = defaultStore()
const {limit} = storeToRefs(store)

const imageRef: Ref<HTMLImageElement | null> = ref(null)
const img: Ref<Array<UploadFile>> = ref([])
const imgSrc: ComputedRef<string> = computed(() => img.value?.[0]?.url || (img.value?.[0]?.response as {
  imgSrc: string
})?.imgSrc)
const deleteId: Ref<Array<string>> = ref([])
const editId: Ref<string> = ref("")
const dialogState: Ref<boolean> = ref(false)
const editState: Ref<boolean> = ref(false)
const deleteState: Ref<boolean> = ref(false)
const pageTotal: Ref<number | null> = ref(null)
const search: Ref<string> = ref("")
const url: string = `${apiUrl}/members`
let tableNormalData: IMemberList | null = null
let tableData: Ref<IMemberList> | null = ref(null)

interface IOption {
  id: number,
  value: string,
  label: string
}

type IOptionList = Array<IOption>

const options: IOptionList = setId([{
  value: '站长',
  label: '站长',
}, {
  value: '社长',
  label: '社长',
}, {
  value: '成员',
  label: '成员',
},
])

interface IParams {
  page: number
  sort: string | null
  name_regex: string,
  status_regex: string,
}

const params: Ref<IParams> = ref({
  page: 1,
  sort: null,
  name_regex: "//",
  status_regex: "//"
})

const formData: IMember = {
  name: '',
  head: '',
  status: [],
}

const form: Ref<IMember> = ref(deepClone(formData))

const handleDelete = (id: string): void => {
  deleteState.value = true
  deleteId.value.push(id)
}

const edit = (id: string): void => {
  editId.value = id
  editState.value = true
  dialogState.value = true
}

const deleteUpdate = async (): Promise<void> => {
  try {
    await axios.delete(`${url}/delete/`, {params: {ids: deleteId.value.join(",")}})
    ElMessage({
      message: '删除成员成功',
      type: 'success'
    })
    await getData(params.value)
  } catch (e) {
    ElMessage({
      message: '删除成员失败',
      type: 'error'
    })
  } finally {
    deleteState.value = false
    deleteId.value = []
  }
}

const getData = async (params: Record<string, any>): Promise<void> => {
  let {data: {data, pageTotal: _pageTotal}} = await axios.get(`${url}/pages_condition`, {params})
  pageTotal.value = _pageTotal
  data = data.map((item: IMember) => {
    item.status = (item.status as string).split("、")
    return item
  })
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
    form.value.head = imgSrc.value
    await axios.post(`${url}/create`, {
      ...form.value,
      status: (form.value.status as Array<string>).join("、")
    })
    ElMessage({
      message: '添加成员成功',
      type: 'success'
    })
    await getData(params.value)
  } catch (e) {
    ElMessage({
      message: '添加成员失败',
      type: 'error'
    })
  } finally {
    handleCancel()
  }
}

const handleEdit = async (): Promise<void> => {
  try {
    form.value.head = imgSrc.value
    await axios.put(`${url}/${editId.value}`, {
      ...form.value,
      status: (form.value.status as Array<string>).join("、")
    })
    ElMessage({
      message: '修改成员成功',
      type: 'success'
    })
    await getData(params.value)
  } catch (e) {
    ElMessage({
      message: '修改成员失败',
      type: 'error'
    })
  } finally {
    handleCancel()
  }
}

const searchData = async (): Promise<void> => {
  try {
    let data = await axios.get(`${url}/search`, {params: {_id: editId.value}})
    form.value = data.data.map((item: IMember) => {
      item.status = (item.status as string).split("、")
      return item
    })[0]
    const head_ = form.value.head
    img.value = [{
      name: getImageName(head_),
      url: head_,
      status: 'success',
      uid: 0,
    }]
  } catch (err) {
    ElMessage({
      message: '获取数据失败',
      type: 'error'
    })
  }
}

watch(params, (newVal: IParams) => debouncedHandleSearch(newVal), {deep: true})
watch(search, (newVal: string) => {
  params.value.name_regex = `/${newVal}/`
  params.value.status_regex = `/${newVal}/`
})
watch(editState, async (newVal: boolean) => {
  if (newVal) await searchData()
})

onMounted(async () => await getData(params.value))
</script>

<template>
  <ElDialog destroy-on-close v-model="deleteState" title="删除成员" width="500">
    <span>确认删除吗</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="deleteState = false">取消</el-button>
        <el-button type="primary" @click="deleteUpdate">确认</el-button>
      </div>
    </template>
  </ElDialog>
  <ElDialog destroy-on-close class="dialog" :close-on-click-modal="false" :close-on-press-escape="false"
            :show-close="false" :title="editState ? '修改成员' : '添加成员'" width="500" v-model="dialogState">
    <ElForm style="max-width: 350px; margin-top: 10px; margin-left: 25px" :model="form">
      <ElFormItem label="成员名字">
        <ElInput v-model="form.name"/>
      </ElFormItem>
      <ElFormItem label="成员职位">
        <ElSelect
            v-model="form.status"
            multiple
            placeholder="选择职位"
            style="width: 240px"
        >
          <ElOption
              v-for="item in options"
              :key="item.id"
              :label="item.label"
              :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="成员头像">
        <ElUpload :before-upload="imageBeforeUpload" :action="`${url}/upload`" accept=".jpg, .png" v-model:file-list="img" :limit="1">
          <template #trigger>
            <ElButton :disabled="img.length > 0" type="primary">选择文件</ElButton>
          </template>
          <template #file="{file}">
            <div class="file">
              <img @error="imageError(imageRef, imgSrc)" ref="imageRef" :src="imgSrc" alt="?">
              <span @click="imageRemove(file, img)">
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
  <content :title="`成员管理`">
    <template #btn-area>
      <ElInput :placeholder="`搜索名字、职位...`" v-model="search" style="margin-right: 25px; width: 230px"
               :suffix-icon="Search"/>
      <ElButton @click="dialogState = true" type="primary">添加成员</ElButton>
    </template>
    <template #content>
      <ElTable @sort-change="handleSortChange" :table-layout="'fixed'" :data="tableData">
        <ElTableColumn align="center" show-overflow-tooltip prop="Title" label="成员名字">
          <template #default="scope">
            <p v-html="keywords(scope.row.name, search)"></p>
          </template>
        </ElTableColumn>
        <ElTableColumn align="center" show-overflow-tooltip prop="Title" label="成员职位">
          <template #default="scope">
            <p v-html="keywords((scope.row.status as Array<string>).join('、'), search)"></p>
          </template>
        </ElTableColumn>
        <ElTableColumn align="center" show-overflow-tooltip prop="Date" sortable label="更新日期">
          <template #default="scope">
            <span>{{ formatTime(scope.row.createdAt) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn align="center" prop="Operations" label="操作">
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