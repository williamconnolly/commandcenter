import { storage } from '../storage';
import { setupSiteScripts } from './siteScripts';
import { NEXT_PAGE, PREV_PAGE, triggerPageOffset } from './utils';
import { setupVimKeys } from './vimKeys';

setupSiteScripts();

document.addEventListener('click', event => {
    if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        !(event.target instanceof Element)
    ) {
        return;
    }

    const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) {
        return;
    }

    const url = new URL(anchor.href);
    if (url.protocol !== 'https:' || url.hostname !== 'linear.app') {
        return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(`linear://${url.pathname.slice(1)}${url.search}${url.hash}`);
}, true);

// Expose page offset functionality to external scripts via custom events
window.addEventListener('commandcenter:triggerPageOffset:next', () => {
    triggerPageOffset(NEXT_PAGE);
});

window.addEventListener('commandcenter:triggerPageOffset:prev', () => {
    triggerPageOffset(PREV_PAGE);
});

storage.get().then(({ gDoubleTime, vimKeysBlacklistCSV, scrollSmooth }) => {
    let vimKeysBlacklist: string[] = [];
    try {
        vimKeysBlacklist = vimKeysBlacklistCSV?.split(',') || [];
        vimKeysBlacklist = vimKeysBlacklist.map(bl => bl.trim()).filter(bl => bl?.length > 0);
    } finally {
        setupVimKeys(gDoubleTime || 350, vimKeysBlacklist || [], scrollSmooth);
    }
});
