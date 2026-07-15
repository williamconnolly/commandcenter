import type { Command } from './commands';
import type { TabInfo } from './tabs';

export const Msg = {
    openExtensions: 'openExtensions',
    closeCurrentTab: 'closeCurrentTab',
    duplicateTab: 'duplicateTab',

    loadAllCommands: 'loadAllCommands',
    loadClosedTabCommands: 'loadClosedTabCommands',
    loadCurrentTabs: 'loadCurrentTabs',
    loadQuickLinks: 'loadQuickLinks',
    getKvmPassword: 'getKvmPassword',
};

export type Message = {
    openTabUrl?: string;
    switchToTabId?: number;
    removeTabId?: number;
    moveTabOffset?: number | string;
    reopenTab?: TabInfo;
    loadPRsForGithubUsername?: string;

    directive?: keyof typeof Msg;
};

export type CommandMessageResponse = {
    bookmarkCommands?: Command[];
    currentTabCommands?: Command[];
    closedTabCommands?: Command[];
    prCommands?: Command[];
}

type ResponseCallback = (response: any) => void;

export function sendMessage(messageOrString: Message | string, responseCallback?: ResponseCallback) {
    let message: any;
    if (typeof messageOrString === 'string') {
        message = { directive: messageOrString };
    } else {
        message = messageOrString;
    }
    chrome.runtime.sendMessage(message, responseCallback);
}

export const Action = {
    openCommandCenter: 'openCommandCenter',
    openTabCenter: 'openTabCenter',
    openQuickLinks: 'openQuickLinks',
    close: 'close',
}

export const Source = {
    CommandCenter: 'CommandCenter',
};

export function postActionMessage(action: string) {
    window.postMessage({ source: Source.CommandCenter, action });
}
