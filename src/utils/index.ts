const deepClone = <T>(data: T): T => {
    if (typeof data !== 'object' || data === null) return data;
    if (Array.isArray(data)) return data.map(item => deepClone(item)) as T;
    return Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = deepClone(value);
        return acc;
    }, {} as T);
}

const debounce = <T extends (...args: Parameters<T>) => any>(fun: T, delay: number): (...args: Parameters<T>) => void => {
    let state: ReturnType<typeof setTimeout> | false = false;
    return function (...args: Parameters<T>): void {
        if (state) clearTimeout(state);
        state = setTimeout(async () => {
            await fun(...args);
            state = false;
        }, delay);
    };
}

const formatTime = (time: string): string => {
    const date = new Date(time)
    return `${date.getFullYear()}年${('0' + (date.getMonth() + 1)).slice(-2)}月${('0' + date.getDate()).slice(-2)}日`
}

const setId = <T extends Record<string, any>>(data: Array<T>): Array<T & {id: number}> => deepClone(data).map(((item: T, i: number) => ({
    ...item,
    id: i + 1,
})))

export {
    deepClone,
    debounce,
    formatTime,
    setId
}