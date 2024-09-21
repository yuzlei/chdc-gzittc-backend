import {createRouter, createWebHistory} from "vue-router";
import type {RouteRecordRaw} from "vue-router"

const routes: Readonly<Array<RouteRecordRaw>> = [{
    path: "/",
    redirect: "/home",
    component: () => import("@/App.vue"),
    children: [{
        path: "/home",
        name: "home",
        redirect: "/home/update",
        component: () => import("@/views/home.vue"),
        children: [{
            path: "/home/member",
            name: "member",
            component: () => import("@/views/member.vue"),
        }, {
            path: "/home/update",
            name: "update",
            component: () => import("@/views/update.vue"),
        }, {
            path: "/home/achieves",
            name: "achieves",
            component: () => import("@/views/achieves.vue"),
        }],
    }],
},{
    path: '/404',
    name: '404',
    component: () => import("@/views/notfound.vue"),
}, {
    path: '/edit',
    name: "edit",
    component: () => import("@/views/edit.vue"),
}, {
    path: '/:catchAll(.*)',
    redirect: '/404',
}]

export default createRouter({
    routes,
    history: createWebHistory()
})