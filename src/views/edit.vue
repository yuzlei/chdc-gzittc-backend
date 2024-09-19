<script setup lang="ts">
import {onBeforeUnmount, ref, shallowRef, onMounted, nextTick, computed} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {apiUrl} from "@/config"
import {deepClone} from "@/utils";
import {ElButton, ElForm, ElFormItem, ElInput, ElMessage, ElUpload, ElDialog, ElIcon} from "element-plus";
import {useRouter} from 'vue-router';
import {storeToRefs} from "pinia";
import axios from "axios";
import defaultStore from "@/store"
import '@wangeditor/editor/dist/css/style.css'
import type {UploadFile} from "element-plus";
import type {Ref, PropType} from 'vue'
import type {IAbridgeUpdatesView, IAbridgeUpdatesContent} from "@/types"
import type {IEditorConfig, IToolbarConfig, IDomEditor} from '@wangeditor/editor'
import {Close} from "@element-plus/icons-vue";

const store = defaultStore()
const router = useRouter();

const {updateId} = storeToRefs(store)

const imageRef: Ref<HTMLImageElement | null> = ref(null)

const coverSrc = computed(() => cover.value?.[0]?.url || (cover.value?.[0]?.response as {imgSrc: string})?.imgSrc)

const editorRef = shallowRef(null)

const cover: Ref<Array<UploadFile>> = ref([])

const formData: IAbridgeUpdatesView & IAbridgeUpdatesContent = {
  title: "",
  ellipsis: "",
  author: "",
  cover: "",
  content: "",
}

const form: Ref<IAbridgeUpdatesView & IAbridgeUpdatesContent> = ref(deepClone(formData))

const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: ['headerSelect', '|', 'undo', 'redo', '|', 'lineHeight', 'fontSize', 'color', 'bold', 'italic', 'underline', 'through', 'sub', 'sup', '|', 'justifyLeft', 'justifyCenter', 'justifyRight', '|', "uploadImage", "insertLink", "emotion"]
}

const editorConfig: Partial<IEditorConfig> = {
  MENU_CONF: {
    'uploadImage': {
      fieldName: 'file',
      server: `${apiUrl}/updates/upload`,
      allowedFileTypes: ['image/png', 'image/jpeg'],
      customInsert(res: any, insertFn: (url: string, alt: string, href: string) => void) {
        const {imgSrc} = res as {imgSrc: string}
        insertFn(imgSrc, "", "")
      },
    }
  }
}

const getData = async (): Promise<void> => {
  try {
    const data =  await axios.get(`${apiUrl}/updates/search`, {params: {_id: updateId.value}})
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
    form.value.cover = coverSrc.value
    await axios.put(`${apiUrl}/updates/${updateId.value}`, form.value)
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

const handleRemove = (file: UploadFile): void => {
  const index = cover.value.indexOf(file);
  if (index > -1) cover.value.splice(index, 1);
}

const handleImageError = (file: UploadFile): void => {
  const maxRetries = 3;
  let retries = 0;
  const retryLoad = () => {
    retries++;
    retries <= maxRetries ? setTimeout(() => nextTick(() => imageRef.value.src = coverSrc.value), 1000 * retries) : file.url = 'https://via.placeholder.com/150'
  };
  retryLoad();
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
          <ElUpload :action="`${apiUrl}/updates/upload`" accept=".jpg, .png" v-model:file-list="cover" :limit="1">
            <template #trigger>
              <ElButton :disabled="cover.length > 0" type="primary">选择文件</ElButton>
            </template>
            <template #file="{file}">
              <div class="file">
                <img @error="handleImageError(file)" ref="imageRef" :src="coverSrc" alt="?">
                <span @click="handleRemove(file)">
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