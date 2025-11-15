import {
    type Command,
    CommandType,
    loadBookmarkCommands,
    loadCurrentTabCommands,
    loadPRCommands,
} from '../comms/commands';
import { type CommandMessageResponse, type Message, Msg } from '../comms/messages';
import { loadCurrentTabs, makeSenderTab, type TabInfo } from '../comms/tabs';
import { getPRs } from '../comms/prs';
import { storage } from '../storage';
import { loadQuickLinks } from '../comms/quickLinks';

chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
        if (!sender.tab) {
            console.error('Ignoring request, no tab', message, sender);
            return;
        }
        const senderTab = makeSenderTab(sender);
        if (message.directive) {
            if (message.directive === Msg.openExtensions) {
                chrome.tabs.create({ url: 'chrome://extensions' });
            } else if (message.directive === Msg.closeCurrentTab) {
                chrome.tabs.remove(senderTab.id, () => {
                });
            } else if (message.directive === Msg.duplicateTab) {
                chrome.tabs.duplicate(senderTab.id);
            } else if (message.directive === Msg.loadAllCommands) {
                loadAllCommands().then(sendResponse);
            } else if (message.directive === Msg.loadCurrentTabs) {
                loadCurrentTabs().then(currentTabs => {
                    sendResponse({ currentTabs });
                });
            } else if (message.directive === Msg.loadClosedTabCommands) {
                sendResponse({
                    closedTabCommands: getClosedTabCommands()
                });
            } else if (message.directive === Msg.loadQuickLinks) {
                loadQuickLinks().then(quickLinks => {
                    sendResponse({ quickLinks });
                });
            }
        } else if (message.openTabUrl !== undefined) {
            chrome.tabs.create({ index: senderTab.index + 1, url: message.openTabUrl, active: true });
        } else if (message.switchToTabId !== undefined) {
            chrome.tabs.update(message.switchToTabId, { active: true });
        } else if (message.removeTabId !== undefined) {
            chrome.tabs.remove(message.removeTabId);
        } else if (message.reopenTab !== undefined) {
            chrome.tabs.create({
                index: message.reopenTab.index,
                windowId: message.reopenTab.windowId,
                url: message.reopenTab.url,
                active: false
            }).then((reopenedTab) => {
                loadCurrentTabs().then(currentTabs => {
                    const reopenedTabIndex = currentTabs.findIndex(tab => tab.id === reopenedTab.id?.toString());
                    const reopenedTabId = currentTabs[reopenedTabIndex].id;
                    currentTabs[reopenedTabIndex] = { ...message.reopenTab!, id: reopenedTabId };
                    sendResponse({ currentTabs })
                });
            });
        } else if (message.moveTabOffset !== undefined) {
            let index: number;
            if (typeof message.moveTabOffset === 'string') {
                index = message.moveTabOffset === '0' ? 0 : 123231123;
            } else {
                index = senderTab.index + message.moveTabOffset as number;
            }
            chrome.tabs.move(senderTab.id, { index });
        } else if (message.loadPRsForGithubUsername) {
            getPRs(message.loadPRsForGithubUsername).then(prs => sendResponse({ prs }));
        }
        return true;
    }
);

const tabs: { [tabId: string]: TabInfo } = {};
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        const {
            url,
            title,
            id,
            index,
            favIconUrl
        } = tab;
        if (id && url?.startsWith('https')) {
            tabs[id] = {
                url: url!,
                title: title!,
                id: id?.toString()!,
                index: index,
                favIconUrl: favIconUrl!,
                pinned: tab.pinned,
                closeDate: 0,
                windowId: tab.windowId,
                inCurrentWindow: false,
                sortDate: index
            };
        }
    }
});

const closedCount = 50;
const closedTabs: TabInfo[] = [];
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    const removedTab = tabs[tabId];
    if (removedTab) {
        delete tabs[tabId];
        closedTabs.splice(0, 0, {
            ...removedTab,
            closeDate: Date.now()
        });
        if (closedTabs.length > closedCount) {
            closedTabs.splice(closedCount - 1, 1);
        }
    }
});

function getClosedTabCommands(): Command[] {
    return closedTabs.map(tabInfo => {
        return {
            type: CommandType.CLOSED_TAB,
            id: `${CommandType.CLOSED_TAB}-${tabInfo.id}`,
            icon: tabInfo.favIconUrl,
            url: tabInfo.url,
            title: tabInfo.title,
            sortDate: tabInfo.closeDate
        };
    });
}

async function loadAllCommands(): Promise<CommandMessageResponse> {
    const { githubUsername } = await storage.get();
    const all = await Promise.all([loadCurrentTabCommands(), loadBookmarkCommands(), loadPRCommands(githubUsername)])
    const [currentTabCommands, bookmarkCommands, prCommands] = all;
    const closedTabCommands = getClosedTabCommands();
    return {
        bookmarkCommands,
        currentTabCommands,
        closedTabCommands,
        prCommands
    };
}
