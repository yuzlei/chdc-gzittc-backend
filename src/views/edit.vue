<script setup lang="ts">
import {onBeforeUnmount, ref, shallowRef, onMounted, computed} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {apiUrl} from "@/config"
import {deepClone, getImageName, imageRemove, imageError, imageBeforeUpload, completeImagePath} from "@/utils";
import {ElButton, ElForm, ElFormItem, ElInput, ElMessage, ElUpload, ElDialog, ElIcon} from "element-plus";
import {useRouter} from 'vue-router';
import {storeToRefs} from "pinia";
import {Close} from "@element-plus/icons-vue";
import axios from "axios";
import defaultStore from "@/store"
import '@wangeditor/editor/dist/css/style.css'
import type {UploadFile} from "element-plus";
import type {Ref, PropType, ComputedRef} from 'vue'
import type {IAbridgeUpdatesView, IAbridgeUpdatesContent} from "@/types"
import type {IEditorConfig, IToolbarConfig, IDomEditor} from '@wangeditor/editor'

const store = defaultStore()
const router = useRouter();
const {updateId} = storeToRefs(store)

const imageRef: Ref<HTMLImageElement | null> = ref(null)
const coverSrc: ComputedRef<string> = computed(() => cover.value?.[0]?.url || (cover.value?.[0]?.response as {
  imgSrc: string
})?.imgSrc)
const editorRef = shallowRef(null)
const cover: Ref<Array<UploadFile>> = ref([])
const backState: Ref<boolean> = ref(false);
const url: string = `${apiUrl}/updates`

const formData: IAbridgeUpdatesView & IAbridgeUpdatesContent = {
  title: "",
  ellipsis: "",
  author: "",
  cover: "",
  content: "",
  content_text: "",
}

const form: Ref<IAbridgeUpdatesView & IAbridgeUpdatesContent> = ref(deepClone(formData))

const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: ['headerSelect', '|', 'undo', 'redo', '|', 'lineHeight', 'fontSize', 'color', 'bold', 'italic', 'underline', 'through', 'sub', 'sup', '|', 'justifyLeft', 'justifyCenter', 'justifyRight', '|', "uploadImage", "insertLink", "emotion"]
}

const editorConfig: Partial<IEditorConfig> = {
  MENU_CONF: {
    'uploadImage': {
      fieldName: 'file',
      server: `${url}/upload`,
      allowedFileTypes: ['image/png', 'image/jpeg'],
      customInsert(res: any, insertFn: (url: string, alt: string, href: string) => void) {
        const {imgSrc} = res as { imgSrc: string }
        insertFn(imgSrc, "", "")
      },
    }
  }
}

const replaceContent = (str: string, reversal: boolean = true): string => reversal ? str.replace(/src=["'](\/.+\.(png|jpg|jpeg)\/?)["']/g, ((_, url: string) => `src="${apiUrl}${url}"`)) : str.replace(/src=["'](\/.+\.(png|jpg|jpeg)\/?)["']/g, ((_, url: string) => `src="${url}"`))

const getData = async (): Promise<void> => {
  try {
    const data = await axios.get(`${url}/search`, {params: {_id: updateId.value}})
    form.value = data.data.map((item: IAbridgeUpdatesView & IAbridgeUpdatesContent) => {
      item.cover = completeImagePath(item.cover)
      item.content = replaceContent(item.content)
      return item
    })[0]
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

const handleCreated = (editor: PropType<IDomEditor>): PropType<IDomEditor> => editorRef.value = editor

const back = (): void => {
  backState.value = false
  router.push("/home/update")
}

const saveData = async (): Promise<void> => {
  try {
    const doc = new DOMParser().parseFromString(form.value.content, 'text/html')
    form.value.content_text = doc.body.textContent || doc.body.innerText
    form.value.ellipsis = form.value.content_text.slice(0, 50);
    await axios.put(`${url}/${updateId.value}`, {
      ...form.value,
      cover: completeImagePath(coverSrc.value, false),
      content: replaceContent(form.value.content, false)
    })
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

onMounted(async () => await getData())

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
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
          <ElUpload :before-upload="imageBeforeUpload" :action="`${url}/upload`" accept=".jpg, .png"
                    v-model:file-list="cover" :limit="1">
            <template #trigger>
              <ElButton :disabled="cover.length > 0" type="primary">选择文件</ElButton>
            </template>
            <template #file="{file}">
              <div class="file">
                <img @error="imageError(imageRef, coverSrc)" ref="imageRef" :src="coverSrc" alt="?">
                <span @click="imageRemove(file, cover)">
                <ElIcon>
                  <Close/>
                </ElIcon>
              </span>
              </div>
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