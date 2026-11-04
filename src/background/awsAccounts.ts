import { AWS_ACCOUNTS_KEY, AWS_ENABLED_KEY } from '../awsAccounts';

export function setupAwsAccountStorage() {
    // Local storage contains other private settings. Send only account metadata.
    chrome.runtime.onMessage.addListener((message, sender, respond) => {
        if (message?.awsAccountLabels !== true || sender.id !== chrome.runtime.id || !sender.tab) return;
        chrome.storage.local.get([AWS_ACCOUNTS_KEY, AWS_ENABLED_KEY]).then(respond, () => respond({}));
        return true;
    });
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local' || !(AWS_ACCOUNTS_KEY in changes || AWS_ENABLED_KEY in changes)) return;
        void chrome.tabs.query({ url: 'https://*/*' }).then(tabs => {
            for (const tab of tabs) {
                if (tab.id !== undefined) void chrome.tabs.sendMessage(tab.id, { awsAccountLabelsChanged: true }).catch(() => {});
            }
        });
    });
}
