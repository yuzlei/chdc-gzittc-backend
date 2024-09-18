<script setup lang="ts">
import {onBeforeUnmount, ref, shallowRef, onMounted} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {apiUrl} from "@/config"
import {deepClone} from "@/utils";
import {ElButton, ElForm, ElFormItem, ElInput, ElMessage, ElUpload, ElDialog} from "element-plus";
import {useRoute, useRouter} from 'vue-router';
import {storeToRefs} from "pinia";
import axios from "axios";
import defaultStore from "@/store"
import '@wangeditor/editor/dist/css/style.css'
import type {UploadFile} from "element-plus";
import type {Ref, PropType} from 'vue'
import type {IAbridgeUpdatesView, IAbridgeUpdatesContent} from "@/types"
import type {IEditorConfig, IToolbarConfig, IDomEditor} from '@wangeditor/editor'

const store = defaultStore()
const route = useRoute();
const router = useRouter();

const {updateId} = storeToRefs(store)

const editorRef = shallowRef(null)

const cover: Ref<Array<UploadFile>> = ref([])

const formData: IAbridgeUpdatesView & IAbridgeUpdatesContent = {
  title: "",
  ellipsis: "",
  author: "",
  cover: '',
  content: "",
}

const form: Ref<IAbridgeUpdatesView & IAbridgeUpdatesContent> = ref(deepClone(formData))

const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: ['headerSelect', '|', 'undo', 'redo', '|', 'lineHeight', 'fontSize', 'color', 'bold', 'italic', 'underline', 'through', 'sub', 'sup', '|', 'justifyLeft', 'justifyCenter', 'justifyRight', '|', "uploadImage", "insertLink", "emotion"]
}

const editorConfig: Partial<IEditorConfig> = {
  MENU_CONF: {
    'uploadImage': {
      fieldName: 'image',
      server: `${apiUrl}/updates/image`,
      allowedFileTypes: ['image/png', 'image/jpeg'],
    }
  }
}

const getData = async (): Promise<void> => {
  try {
    const data = await axios.get(`${apiUrl}/updates/search`, {params: {_id: updateId.value}})
    form.value = data.data[0]
    const cover_ = form.value.cover
    cover.value = [{
      name: getImageName(cover_),
      url: cover_,
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

onMounted(async () => await getData())

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const getImageName = (url: string): string | null => url.match(new RegExp(/\/([^\/]+\..+\/?)/))[1]

const handleCreated = (editor: PropType<IDomEditor>): void => {
  editorRef.value = editor
}

const backState: Ref<boolean> = ref(false);

const back = (): void => {
  backState.value = false
  router.push("/home/update")
}

const saveData = async (): Promise<void> => {
  try {
    const data = new FormData()
    for (const item in form.value) {
      if (item !== "cover") {
        data.append(item, form.value[item])
      } else {
        const {raw, url} = cover.value[0]
        !raw ? data.append('cover', await saveImage(url)) : data.append('cover', raw)
      }
    }
    await axios.put(`${apiUrl}/updates`, data)
    ElMessage({
      message: '保存成功',
      type: 'success'
    })
  } catch (e) {
    ElMessage({
      message: '保存失败',
      type: 'error'
    })
  }
}

const saveImage = async (url: string): Promise<File> => {
  try {
    const res = await axios.get(url, {responseType: 'blob'});
    const blob = await res.data;
    return new File([blob], getImageName(url), {type: blob.type});
  } catch (e) {
    ElMessage({
      message: '保存失败',
      type: 'error'
    })
  }
}
</script>

<template>
  <ElDialog destroy-on-close v-model="backState" title="返回" width="500">
    <span>确认返回吗，数据将不会保存</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="backState = false">取消</el-button>
        <el-button type="primary" @click="back">确认</el-button>
      </div>
    </template>
  </ElDialog>
  <div class="content">
    <div class="message">
      <ElForm style="max-width: 350px; margin-top: 10px; margin-left: 25px" :model="form">
        <ElFormItem label="动态标题">
          <ElInput v-model="form.title"/>
        </ElFormItem>
        <ElFormItem label="动态作者">
          <ElInput v-model="form.author"/>
        </ElFormItem>
        <ElFormItem label="动态封面">
          <ElUpload accept=".jpg, .png" :auto-upload="false" v-model:file-list="cover" :limit="1">
            <template #trigger>
              <ElButton :disabled="form.cover.length > 0" type="primary">选择文件</ElButton>
            </template>
          </ElUpload>
        </ElFormItem>
        <ElFormItem>
          <ElButton @click="saveData" type="primary">
            保存
          </ElButton>
          <ElButton @click="backState = true" type="danger">
            返回
          </ElButton>
        </ElFormItem>
      </ElForm>
    </div>
    <div class="edit">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig"/>
      <Editor style="height: 100%; overflow-y: hidden;" v-model="form.content" :defaultConfig="editorConfig"
              @onCreated="handleCreated"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/edit";
</style>