import {ref} from "vue";
import {defineStore} from "pinia";
import type {Ref} from "vue";

export default defineStore("defineStore", () => {
    const updateId: Ref<string | null> = ref(null)
    const limit: Ref<number | null> = ref(10)
    const setUpdateId = (value: string): string => updateId.value = value

    return {
        updateId,
        limit,
        setUpdateId,
    }
}, {
    persist: {
        pick: ['updateId'],
    },
})