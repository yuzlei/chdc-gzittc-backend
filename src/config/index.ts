import {setId} from "@/utils";
import {User, Management, Medal} from "@element-plus/icons-vue";
import type {IBarList} from "@/types";

const apiUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3000"

const barData: IBarList = setId([{
    name: "动态",
    href: "/home/update",
    icon: Management,
}, {
    name: "成员",
    href: "/home/member",
    icon: User,
}, {
    name: "成就",
    href: "/home/achieves",
    icon: Medal,
}])

export {
    apiUrl,
    barData
}