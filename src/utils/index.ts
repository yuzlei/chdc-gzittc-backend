import {IAbridgeUpdatesContent} from "../types";

/**
 * 深拷贝对象数组
 * @param data 要拷贝的对象或数组。
 * @returns 拷贝后的对象或数组。
 */
const deepClone = <T>(data: T): T => {
    if (typeof data !== 'object' || data === null) return data;
    if (Array.isArray(data)) return data.map(item => deepClone(item)) as T;
    return Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = deepClone(value);
        return acc;
    }, {} as T);
}

/**
 * 为对象数组结构中的每个元素分配唯一的 ID。
 * @param data 要拷贝的对象或数组。
 * @returns 拷贝后的对象或数组。
 */
const setId = <T extends Record<string, any>>(data: Array<T>): Array<T & {id: number}> => deepClone(data).map(((item: T, i: number) => ({
   ...item,
    id: i + 1,
})))

/**
 * 防抖函数。
 * @param fun 要执行的函数。
 * @param delay 延迟的时间。
 * @returns 封装好的防抖函数。
 */
const debounce = <T extends (...args: Parameters<T>) => any>(fun: T, delay: number): (...args: Parameters<T>) => void => {
    let state: ReturnType<typeof setTimeout> | false = false;
    return function (...args: Parameters<T>): void {
        if (state) clearTimeout(state);
        state = setTimeout(() => {
            fun(...args);
            state = false;
        }, delay);
    };
}

/**
 * 格式化时间。
 * @param time 时间字符串。
 * @returns 格式化后的时间。
 */
const formatTime = (time: string): string => {
    const date = new Date(time)
    return `${date.getFullYear()}年${('0' + (date.getMonth() + 1)).slice(-2)}月${('0' + date.getDate()).slice(-2)}日`
}

/**
 * 检查对象 obj 中是否包含键 key。
 * @param obj 要检查的对象。
 * @param key 包含的键名
 * @returns 布尔值。
 */
const hasProperty = <T extends object, K extends keyof T>(obj: IAbridgeUpdatesContent | {}, key: string): obj is T & Record<K, unknown> => key in obj;

export {
    deepClone,
    setId,
    debounce,
    formatTime,
    hasProperty
}