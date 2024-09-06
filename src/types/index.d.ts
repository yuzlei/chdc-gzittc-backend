/**
 * @interface
 * 成员接口定义
 */
interface IMember {
    _id?: string,
    name: string,
    head: string,
    status: Array<number>,
}

/**
 * @type
 * 成员列表类型定义
 */
type IMemberList = Array<IMember>

/**
 * @interface
 * 成就接口定义
 */
interface IAchieve{
    _id?: string,
    name: string,
    imgSrc: string
}

/**
 * @type
 * 成就列表类型定义
 */
type IAchieveList = Array<IAchieve>

/**
 * @interface
 * 动态预览接口定义
 */
interface IAbridgeUpdatesView {
    _id?: string,
    title: string,
    cover: string,
    ellipsis: string,
    createdAt: string,
    author: string
}

/**
 * @interface
 * 动态预览类型定义
 */
type IAbridgeUpdatesViewList = Array<IAbridgeUpdatesView>

/**
 * @interface
 * 动态内容接口定义
 */
interface IAbridgeUpdatesContent{
    _id?: string,
    content: string,
}

export {
    IMember,
    IMemberList,
    IAchieve,
    IAchieveList,
    IAbridgeUpdatesView,
    IAbridgeUpdatesViewList,
    IAbridgeUpdatesContent,
}