// @ts-nocheck
type TBlockInfoRec = any
type THierarchy = [{ uid: string; string: string }, { title: string; uid: string }]
export const getPageUidSync = (pageTitle: s): s => {
  console.log('getPageUidSync not implemented')
}
export const getOrCreatePageUid = async (pageTitle: s, initString?: s) => {
  console.warn('getOrCreatePageUid not implemented')
}
export const SetNumberedViewWithUid = async (uid: s) => {
  console.warn('SetNumberedViewWithUid not implemented')
}
export const CollapseDirectcChildren = async (block_uid: s, block_expanded: b) => {
  console.warn('CollapseDirectcChildren not implemented')
}
export const getBlockInfoByUIDM = async (
  uid: s,
  withChildren = false,
  withParents = false
): Promise<TBlockInfoRec[][] | null> => {
  console.warn('getBlockInfoByUIDM not implemented')
}
export const getBlockParentUids = async (uid: s) => {
  console.warn('getBlockParentUids not implemented')
}
export const updateBlock = async (block_uid: s, block_string: s, block_expanded = true) => {
  console.warn('updateBlock not implemented')
}
export const sleep = (ms: n) => new Promise(resolve => setTimeout(resolve, ms))
export const moveBlock = async (parent_uid: s, block_order: n, block_to_move_uid: s) => {
  console.warn('moveBlock not implemented')
}
export const createBlock = async (
  parent_uid: s,
  block_order: n,
  block_string: s,
  manualUID = false
) => {
  console.warn('createBlock not implemented')
}
export const createUid = () => {
  console.warn('createUid not implemented')
}
export const getPageUid = async (pageTitle: s): Promise<s> => {
  console.warn('getPageUid not implemented')
}
export const createPage = async (pageTitle: s) => {
  console.warn('createPage not implemented')
}
export const createChildBlock = async (parentUid: s, order: n, childString: s, childUid: s) => {
  console.warn('createChildBlock not implemented')
}
export const allChildrenInfo = async (blockUid: s) => {
  console.warn('allChildrenInfo not implemented')
}
export const sortObjectsByOrder = (o: any) => {
  console.warn('sortObjectsByOrder not implemented')
}
export const ExpandBlock = async (block_uid: s, block_expanded: b) => {
  console.warn('ExpandBlock not implemented')
}
export const getPageNamesFromBlockUidList = async (blockUidList: string[]) => {
  console.warn('getPageNamesFromBlockUidList not implemented')
}
/* ********************** */
export const isBlockRef = async (uid: s) => {
  console.warn('isBlockRef not implemented')
}
export const getBlockByPhrase = async (search_phrase: s) => {
  console.warn('getBlockByPhrase not implemented')
}
export const simulateMouseOver = (element: El) => {
  console.warn('simulateMouseOver not implemented')
}
export const setSideBarState = async (state: 1 | 2 | 3 | 4) => {
  console.warn('setSideBarState not implemented')
}
export const getBlockOrPageInfo = async (blockUid: s) => {
  console.warn('getBlockOrPageInfo not implemented')
}
export let mock = {
  url: 'https://youtu.be/-73MZsj8bVI',
}

export const getBlockStringByUID = async (blockUid: string): Promise<string> => {
  console.warn('getBlockStringByUID not implemented')
}
export const getBlockParentUids_custom = async (uid: string): Promise<THierarchy[]> => {
  console.warn('getBlockParentUids_custom not implemented')
}
export const navigateToUiOrCreate = async (
  destinationPage: s,
  openInSideBar = false,
  sSidebarType = 'outline'
) => {
  console.warn('navigateToUiOrCreate not implemented')
}
/* -------------------------------------------------------------------- */
export const openBlockInSidebar = (blockUid: s, windowType = 'outline') => {
  console.warn('openBlockInSidebar not implemented')
}
export const deleteBlock = (blockUid: s) => {
  console.warn('deleteBlock not implemented')
}
