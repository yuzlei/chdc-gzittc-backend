import {nextTick} from "vue";
import type {UploadFile} from "element-plus";

const deepClone = <T>(data: T): T => {
    if (typeof data !== 'object' || data === null) return data;
    if (Array.isArray(data)) return data.map(item => deepClone(item)) as T;
    return Object.entries(data).reduce((acc: T, [key, value]) => {
        acc[key] = deepClone(value);
        return acc;
    }, {} as T);
}

const debounce = <T extends (...args: Parameters<T>) => any>(fun: T, delay: number): (...args: Parameters<T>) => void => {
    let state: ReturnType<typeof setTimeout> | false = false;
    return function (...args: Parameters<T>): void {
        if (state) clearTimeout(state);
        state = setTimeout(async (): Promise<void> => {
            await fun(...args);
            state = false;
        }, delay);
    };
}

const formatTime = (time: string): string => {
    const date: Date = new Date(time)
    return `${date.getFullYear()}年${('0' + (date.getMonth() + 1)).slice(-2)}月${('0' + date.getDate()).slice(-2)}日`
}

const setId = <T extends Record<string, any>>(data: Array<T>): Array<T & {
    id: number
}> => deepClone(data).map(((item: T, i: number) => ({
    ...item,
    id: i + 1,
})))

const keywords = (str: string, search: string): string => search === "" ? str : str.replaceAll(search, `<span style="color: red">${search}</span>`)

const getImageName = (url: string): string | null => url.match(new RegExp(/\/([^\/]+\..+\/?)/))[1]

const imageRemove = (file: UploadFile, imgList: Array<UploadFile>): void => {
    const index: number = imgList.indexOf(file);
    index > -1 ? imgList.splice(index, 1) : null
}

const imageError = (imgRef: HTMLImageElement, imgSrc: string): void => {
    const maxRetries: number = 3;
    let retries: number = 0;
    retries++;
    retries <= maxRetries && imgRef ? setTimeout(() => nextTick(() => imgRef ? imgRef.src = imgSrc : null), 1000 * retries) : null
}

export {
    deepClone,
    debounce,
    formatTime,
    setId,
    keywords,
    getImageName,
    imageRemove,
    imageError,
}