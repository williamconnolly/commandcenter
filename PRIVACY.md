# Command Center Extension Privacy Policy

## Data Collection

CommandCenter does not collect any user data. Since no data is collected, none of your data can be sold to third parties.

Here are the sources of data that CommandCenter uses to function. None of this data ever leaves your device, with the exception of the Storage API that will sync your configuration to your other devices with the same Google Profile signed in. No browsing, history, or bookmark data is ever transmitted across the network or to a third party.
That being said, there are a few other ways your data is used.

## Chrome Storage API

This extension takes advantage of [Google Chrome's Storage API](https://developer.chrome.com/docs/extensions/reference/storage/) to locally store minimal state information. This is similar to a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies). This information is for configuration and settings for the extension. Google syncs this information across your various computers and Chrome installations. However, this extension only access this data locally on your machine and does do not transmit it.

The optional KVM password is kept in local extension storage only. It is not synced to other Chrome profiles or devices, and the extension sends it only to the configured KVM login pages to pre-fill their password field.

## Chrome History API

This extension takes advantage of [Google Chrome's History API](https://developer.chrome.com/docs/extensions/reference/history/) to query for GitHub repositories you have visited in the past and present them as links to visit quickly. This information is not transmitted anywhere.

## Chrome Bookmarks API

This extension takes advantage of [Google Chrome's Bookmarks API](https://developer.chrome.com/docs/extensions/reference/bookmarks/) to query for your bookmarks and present them as links to visit quickly. This information is not transmitted anywhere.

## Chrome Tabs API

This extension takes advantage of [Google Chrome's Tabs API](https://developer.chrome.com/docs/extensions/reference/tabs/) to control and query for tabs you have open. This information is not transmitted anywhere.
