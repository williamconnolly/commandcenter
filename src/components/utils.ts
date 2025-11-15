import { sendMessage } from '../comms/messages';

export function offsetSelectedIndex(offset: number, current: number, max: number): number {
    return Math.max(0, Math.min(current + offset, max - 1));
}

export function switchToTab(tabId: string | null, renderingInPage: boolean) {
    if (!tabId) return;
    if (renderingInPage) {
        sendMessage({ switchToTabId: Number(tabId )});
    } else {
        chrome.tabs.update(Number(tabId), { active: true });
        window.close();
    }
}
