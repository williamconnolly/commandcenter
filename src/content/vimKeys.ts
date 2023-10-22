import { Action, Msg, postActionMessage, sendMessage } from '../comms/messages';
import {
    type ContentUrls,
    isFocusedOnInput,
    reloadPage,
    scrollTo,
    triggerPageOffset,
    urlIncludes
} from './utils';
import { LOCAL_G_KEY_MAP, LOCAL_KEY_MAP } from './local';

export type KeyFunction = () => [
    string, () => void, ContentUrls | undefined
];
export type KeyMap = { [key: string]: KeyFunction };

export function makeKeyFunction(key: string, description: string, run: () => void, urls?: ContentUrls): KeyMap {
    return {
        [key]: () => {
            return [
                description,
                run,
                urls
            ];
        }
    }
}

export const G_KEY_MAP: KeyMap = {
    ...makeKeyFunction('g', 'Scroll to top of page', () => {
        scrollTo('top', 'smooth');
    }),
    ...makeKeyFunction('e', 'Open chrome://extensions page', () => {
        sendMessage(Msg.openExtensions);
    }),
    ...makeKeyFunction('n', 'Go to "Next Page" by incrementing last number in URL', () => {
        triggerPageOffset(1);
    }),
    ...makeKeyFunction('h', 'Alias for Go to "Next Page"', () => {
        triggerPageOffset(1);
    }),
    ...makeKeyFunction('d', 'Go to "Previous Page" by decrementing last number in URL', () => {
        triggerPageOffset(-1);
    }),
    ...makeKeyFunction('D', 'Duplicate current tab', () => {
        sendMessage(Msg.duplicateTab);
    }),
    ...makeKeyFunction('r', 'Open CommandCenter overlay on current page', () => {
        postActionMessage(Action.openCommandCenter);
    }),
    ...makeKeyFunction('t', 'Open TabCenter overlay on current page', () => {
        postActionMessage(Action.openTabCenter);
    }),
    ...makeKeyFunction('0', 'Move current tab all the way to the left', () => {
        sendMessage({ moveTabOffset: '0' });
    }),
    ...makeKeyFunction('$', 'Move current tab all the way to the right', () => {
        sendMessage({ moveTabOffset: '$' });
    }),
    ...LOCAL_G_KEY_MAP
};

export const KEY_MAP: KeyMap = {
    ...makeKeyFunction('G', 'Scroll to bottom of page', () => {
        scrollTo('bottom', 'smooth');
    }),
    ...makeKeyFunction('r', 'Reload page', () => {
        reloadPage();
    }),
    ...makeKeyFunction('x', 'Close current tab', () => {
        sendMessage(Msg.closeCurrentTab);
    }),
    ...makeKeyFunction('<', 'Move current tab to left', () => {
        sendMessage({ moveTabOffset: -1 });
    }),
    ...makeKeyFunction('>', 'Move current tab to right', () => {
        sendMessage({ moveTabOffset: 1 });
    }),
    ...LOCAL_KEY_MAP
};

export function setupVimKeys(gDoubleTime: number, vimKeysBlacklist: string[], scrollSmooth: boolean) {
    if (urlIncludes(vimKeysBlacklist)) {
        return;
    }

    let ANY_FOCUSED = false;
    let LAST_G_TIME = 0;

    window.addEventListener('focusin', () => ANY_FOCUSED = true);
    window.addEventListener('focusout', () => ANY_FOCUSED = false);
    window.addEventListener('keypress', event => {
        if (ANY_FOCUSED) {
            return;
        }

        if (isFocusedOnInput()) {
            return;
        }

        function withinDoubleTime() {
            return Number(new Date()) - LAST_G_TIME <= gDoubleTime;
        }

        let key = event.key;
        if (event.shiftKey) {
            key = key.toUpperCase();
        }

        // Special case for g$ also accepting g4
        if (key === '4') {
            key = '$';
        }

        let keyFunction: KeyFunction | null = null;
        if (key === 'g' && !withinDoubleTime()) {
            LAST_G_TIME = Number(new Date());
        } else if (key in G_KEY_MAP) {
            if (withinDoubleTime()) {
                keyFunction = G_KEY_MAP[key];
                LAST_G_TIME = 0;
            }
        } else if (key in KEY_MAP) {
            keyFunction = KEY_MAP[key];
        }
        if (!keyFunction) {
            return;
        }
        const [_, execute, urls] = keyFunction();
        if (urlIncludes(urls)) {
            execute();
        }
    });
}
