import type {SlateElement} from '@wangeditor/editor'

interface IBar {
    _id?: string,
    name: string,
    href: string,
    icon?: any
}

type IBarList = Array<IBar>

interface IMember {
    _id?: string,
    name: string,
    head: string,
    status: Array<string> | string,
    createdAt?: string,
}

type IMemberList = Array<IMember>

interface IAchieve {
    _id?: string,
    name: string,
    imgSrc: string
    createdAt?: string,
}

type IAchieveList = Array<IAchieve>

interface IAbridgeUpdatesView {
    _id?: string,
    title: string,
    cover: string,
    ellipsis?: string,
    createdAt?: string,
    author: string
}

type IAbridgeUpdatesViewList = Array<IAbridgeUpdatesView>

interface IAbridgeUpdatesContent {
    _id?: string,
    content: string,
    content_text: string
}

type ImageElement = SlateElement & {
    src: string
    alt: string
    url: string
    href: string
} | null

export {
    IBar,
    IBarList,
    IMember,
    IMemberList,
    IAchieve,
    IAchieveList,
    IAbridgeUpdatesView,
    IAbridgeUpdatesViewList,
    IAbridgeUpdatesContent,
    ImageElement
}