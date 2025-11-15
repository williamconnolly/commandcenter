import { DEFAULT_FAVICON_URL } from './commands';

export type TabInfo = {
    id: string;
    url: string;
    title: string;
    favIconUrl: string;
    closeDate?: number;
    pinned: boolean;
    index: number;
    windowId: number;
    inCurrentWindow: boolean;
    sortDate: number;
    matchIndices?: Set<number>;
};

export type TabMessageResponse = {
    currentTabs?: TabInfo[];
    reopenedTab?: TabInfo;
}

type SenderTab = {
    id: number;
    index: number;
}

export function makeSenderTab(sender: chrome.runtime.MessageSender): SenderTab {
    return {
        id: sender.tab?.id ?? -1,
        index: sender.tab?.index ?? -1
    };
}

export function chromeTabToTabInfo(tab: chrome.tabs.Tab, inCurrentWindow: boolean): TabInfo {
    const id = (tab.id ?? -1).toString();
    return {
        id: id,
        url: tab.url!,
        title: tab.title!,
        favIconUrl: tab.favIconUrl || DEFAULT_FAVICON_URL,
        pinned: tab.pinned,
        index: tab.index,
        windowId: tab.windowId,
        inCurrentWindow,
        sortDate: tab.index
    };
}

function tabsForWindow(window: chrome.windows.Window): Promise<chrome.tabs.Tab[]> {
    return chrome.tabs.query({ windowId: window.id });
}

export async function loadCurrentTabs(): Promise<TabInfo[]> {
    const windows = await chrome.windows.getAll();
    const activeWindowId = windows.find(w => w.focused)?.id;
    const allTabs = await Promise.all(windows.flatMap(tabsForWindow));
    return allTabs.flat().map(tab => chromeTabToTabInfo(tab, tab.windowId === activeWindowId));
}
