import { storage } from '../storage';
import { setupSiteScripts } from './siteScripts';
import { NEXT_PAGE, PREV_PAGE, triggerPageOffset } from './utils';
import { setupVimKeys } from './vimKeys';

setupSiteScripts();

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
