<script lang="ts">
    import HighlightText from './HighlightText.svelte';
    import CloseButton from './CloseButton.svelte';
    import TabPinnedButton from './TabPinnedButton.svelte';
    import { Fzf, type FzfResultItem } from 'fzf';
    import { Msg, sendMessage } from '../comms/messages';
    import type { TabInfo, TabMessageResponse } from '../comms/tabs';
    import { offsetSelectedIndex, switchToTab } from './utils';
    import type { QuickLinksMessageResponse, QuickLinksTree } from '../comms/quickLinks';


    type Props = {
        /** Props */
        largeWidth?: boolean;
        focusInputRef?: boolean;
        escapeHandler: () => void;
        renderingInPage: boolean;
    };

    let {
        largeWidth = false,
        focusInputRef = false,
        escapeHandler,
        renderingInPage
    }: Props = $props();

    /** State */
    // let query = $state('');
    // let tabInputRef: HTMLInputElement = $state();
    // let selectedIndex = $state(0);
    //
    // let currentTabs: TabInfo[] = $state([]);
    // let closedTabs: TabInfo[] = [];
    let quickLinks: QuickLinksTree | undefined = $state();

    sendMessage(Msg.loadQuickLinks, (response: QuickLinksMessageResponse) => {
        quickLinks = response.quickLinks ?? {};
        console.log(response.quickLinks);
    });

    //
    // let queryTabs: TabInfo[] = $state();
    //
    // function searchSelector(tab: TabInfo): string {
    //     return tab.title.replaceAll('-', ' ');
    // }
    //
    // function searchAllTabs(tabs: TabInfo[], search: string): TabInfo[] {
    //     const currentWindowTabs = searchTabs(tabs.filter(tab => tab.inCurrentWindow), search);
    //     const otherWindowTabs = searchTabs(tabs.filter(tab => !tab.inCurrentWindow), search);
    //     return [...currentWindowTabs, ...otherWindowTabs];
    // }
    //
    // function searchTabs(tabs: TabInfo[], search: string): TabInfo[] {
    //     const fzf = new Fzf(tabs, {
    //         selector: searchSelector,
    //         tiebreakers: [dateTieBreaker]
    //     });
    //
    //     const results: FzfResultItem<TabInfo>[] = fzf.find(search.replaceAll(' ', ''));
    //     return results.map(item => {
    //         return { ...item.item, matchIndices: item.positions };
    //     }).sort((a, b) => a.index - b.index);
    // }
    //
    // function dateTieBreaker(a: FzfResultItem<TabInfo>, b: FzfResultItem<TabInfo>): number {
    //     return b.item.sortDate - a.item.sortDate;
    // }
    //
    // function isTabRemovable(tab: TabInfo) {
    //     return !tab.pinned;
    // }
    //
    // function removeTab(tabId: string) {
    //     if (!tabId) return;
    //     const tabIndex = currentTabs.findIndex(currentTab => currentTab.id === tabId);
    //     if (tabIndex !== -1) {
    //         const tab = currentTabs[tabIndex];
    //         if (!isTabRemovable(tab)) {
    //             return;
    //         }
    //         const closedTab = currentTabs.splice(tabIndex, 1)[0];
    //         currentTabs = [...currentTabs];
    //         sendMessage({ removeTabId: Number(tabId) });
    //         closedTabs.push(closedTab);
    //     }
    //     tabInputRef.focus();
    // }
    //
    // function toggleTabPinned(tabId: string) {
    //     console.log('Toggling tab pinned', tabId);
    // }
    //
    // function reopenTab() {
    //     const reopenTab: TabInfo = closedTabs.splice(closedTabs.length - 1, 1).at(0);
    //     reopenTab && sendMessage({ reopenTab }, (response: TabMessageResponse) => {
    //         currentTabs = response.currentTabs;
    //     });
    // }
    //
    // function handleInputKey(event: KeyboardEvent) {
    //     let key = event.key;
    //     if (key === 'Tab') {
    //         event.preventDefault();
    //         key = event.shiftKey ? 'ArrowUp' : 'ArrowDown';
    //     }
    //
    //     let tabId = selectedIndex in queryTabs ? queryTabs[selectedIndex]?.id : null;
    //     if (key === 'ArrowUp') {
    //         selectedIndex = offsetSelectedIndex(-1, selectedIndex, queryTabs.length);
    //     } else if (key === 'ArrowDown') {
    //         selectedIndex = offsetSelectedIndex(1, selectedIndex, queryTabs.length);
    //     } else if (key === 'Enter') {
    //         switchToTab(tabId, renderingInPage);
    //     } else if (key === 'Escape') {
    //         if (query) {
    //             selectedIndex = 0;
    //             query = '';
    //         } else {
    //             escapeHandler();
    //         }
    //     } else if (key === 'Backspace') {
    //         const isTextSelected = window.getSelection()?.type === 'Range';
    //         if (!isTextSelected && queryTabs.length) {
    //             event.preventDefault();
    //             removeTab(tabId);
    //         }
    //     } else if (key === 'z' && event.metaKey) {
    //         reopenTab();
    //         event.preventDefault();
    //     }
    // }
    // $effect(() => {
    //     if (focusInputRef) {
    //         tabInputRef?.focus();
    //     }
    // });
    // $effect(() => {
    //     if (query) {
    //         selectedIndex = 0;
    //     }
    // });
    // $effect(() => {
    //     queryTabs = searchAllTabs(currentTabs, query);
    //     selectedIndex = offsetSelectedIndex(0, selectedIndex, queryTabs.length);
    // });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="tabs-container" class:large-width={largeWidth} onclick={e => e.stopPropagation()}>
    <pre>{JSON.stringify(quickLinks, null, 4)}</pre>
</div>

<style lang="scss">
    @import '../assets/colors';
    @import '../assets/mixins';

    @mixin list-border {
        border: 1px solid $kh-gray;
        border-left: none;
        border-right: none;
    }

    .tabs-container {
        @include container-base;
        margin: 0;
        padding: 0;
        overflow-y: scroll;

        &.large-width {
            min-width: 1000px;
            width: 1000px;
            max-width: 1000px;
        }

        .input-container {
            width: 100%;
            border-bottom: 3px solid $kh-silver;
            position: sticky;
            top: 0;
            z-index: 2;

            .tab-input {
                padding: 15px 20px;
                font-size: 24px;
                color: $kh-white;
                background-color: black;
                width: 100%;
                border: none;

                &:focus {
                    outline: none;
                }

                &:focus-visible {
                    box-shadow: none;
                    outline: none !important;
                }
            }
        }

        .tabs-list {
            list-style-type: none;
            margin: 0;
            padding: 0;
            overflow-y: scroll;
            overflow-x: hidden;
            width: 100%;

            .tab {
                @include list-border;
                position: relative;
                display: flex;
                justify-content: space-around;
                align-items: center;
                padding: 5px 0;
                text-decoration: none;
                width: 100%;

                &.is-other-window {
                    background-color: $kh-darkgray;
                    border-color: $kh-black;
                }

                &:first-child {
                    border-top: none;
                }

                &.selected {
                    background-color: $kh-blue;
                }

                .tab-icon {
                    margin-left: 10px;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    img {
                        width: 20px;
                        height: 20px;
                    }
                }

                .tab-highlight-texts {
                    margin-left: 10px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                    width: calc(100% - 100px);
                }

                .tab-buttons {
                    margin-right: 10px;
                    display: flex;
                }
            }
        }
    }
</style>
