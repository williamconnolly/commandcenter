export type ContentUrls = string | string[];
export function urlIncludes(urls: ContentUrls | undefined) {
    if (!urls || !urls?.length) {
        return true;
    }
    if (!Array.isArray(urls)) {
        urls = [urls];
    }
    return urls.some(url => document.location.href.includes(url));
}

 /** Some elements aren't rendered on page load so we need to retry periodically
  *  TODO: Maybe use MutationObserver to run when page changes
  */
export function retryAction(retrySeconds: number, interval: number, action: () => boolean) {
    function tryAction() {
        retrySeconds = retrySeconds - interval / 1000.0;
        if (retrySeconds <= 0) {
            return;
        }
        if (action()) {
            return;
        }
        window.setTimeout(tryAction, interval);
    }

    window.setTimeout(tryAction, interval);
}

/** Make the TypeScript aspect of querySelector more readable */
export function queryEach<ElementType extends Element>(selector: string, each: (element: ElementType) => void) {
    document.querySelectorAll<ElementType>(selector).forEach(each);
}

/** We queryEach on <a> tags quite a bit, let's make it even easier */
export function queryEachAnchor(selector: string, each: (element: HTMLAnchorElement) => void) {
    queryEach<HTMLAnchorElement>(selector, each);
}

export function clickElement(selector: string) {

}

export type PageOffset = -1 | 1;
export const NEXT_PAGE: PageOffset = 1;
export const PREV_PAGE: PageOffset = -1;
type PageSelectors = {
    [NEXT_PAGE]: string,
    [PREV_PAGE]: string
};

const PAGE_OFFSET_BUTTON_MAP: { [siteKey: string]: PageSelectors } = {
    'reddit.com': {
        [NEXT_PAGE]: '.next-button a',
        [PREV_PAGE]: '.prev-button a'
    },
    'erles': {
        [NEXT_PAGE]: 'a.pop[rel="next"]',
        [PREV_PAGE]: 'a.pop[rel="prev"]'
    },
    'nvg': {
        [NEXT_PAGE]: '.global_pagination :last-child.pagination_jump a',
        [PREV_PAGE]: '.global_pagination :first-child.pagination_jump a'
    }
};

function clickPageOffsetButtonIfDefined(offset: PageOffset): boolean {
    const siteKey = Object.keys(PAGE_OFFSET_BUTTON_MAP).find(urlIncludes);
    if (!siteKey) {
        return false;
    }
    const selector = PAGE_OFFSET_BUTTON_MAP[siteKey][offset];
    const element = document.querySelector(selector);
    
    if (element && typeof (element as HTMLElement).click === 'function') {
        (element as HTMLElement).click();
    }

    return true;
}

export function triggerPageOffset(offset: PageOffset) {
    const url = location.href;

    if (clickPageOffsetButtonIfDefined(offset)) {
        return;
    }

    const numbers = url.match(/(\d+)/g);
    if (!numbers) {
        console.log('Tried to trigger page offset, no numbers found');
        return;
    }
    const lastNumber = numbers.slice(-1)[0];
    const index = url.lastIndexOf(lastNumber);
    if (index === -1) {
        console.log(`Unable to find ${lastNumber} in ${url}`);
        return;
    }

    const offsetNumber = (Number(lastNumber) + offset).toString();
    location.href = url.substring(0, index) + offsetNumber + url.substring(index + offsetNumber.length);
}


export const CSS_VAR_REDDIT_THUMBNAIL = '--commandcenter-reddit-thumbnail-size';

export async function triggerRedditThumbnailSize(multiplier: number) {
    const { storage } = await import('../storage');
    const storageData = await storage.get();
    const increment = storageData.redditThumbnailSizeIncrement;
    
    let current = getComputedStyle(document.documentElement).getPropertyValue(CSS_VAR_REDDIT_THUMBNAIL).trim();
    current = current.replace('px', '');
    const newSize = Number(current) + multiplier * increment;
    
    document.documentElement.style.setProperty(CSS_VAR_REDDIT_THUMBNAIL, `${newSize}px`);
    
    // Save the new size to storage
    await storage.set({ ...storageData, currentRedditThumbnailSize: newSize });
}

export function reloadPage() {
    window.location.reload();
}

export function openNewTab(url: string) {
    window.open(url, '_blank');
}

export function scrollTo(to: 'top' | 'bottom', behavior: ScrollBehavior) {
    const top = to === 'top' ? 0 : document.body.scrollHeight;
    window.scrollTo({ top, behavior });
}

export function openVideoSourceUrl() {
    let sources = Array.from(document.querySelectorAll<HTMLVideoElement>('video source'));
    if (!sources?.length) {
        return;
    }
    sources = sources.sort((a, b) => {
        let aResAttr = a.getAttribute('res');
        let bResAttr = b.getAttribute('res');
        if (!aResAttr || !bResAttr) {
            return 0;
        }
        const aRes = Number(aResAttr.replace(/\D/g, ''));
        const bRes = Number(bResAttr.replace(/\D/g, ''));
        if (isNaN(aRes) || isNaN(bRes)) {
            return 0;
        }
        return bRes - aRes;
    });
    const source = sources?.at(0)?.src;
    if (source) {
        openNewTab(source);
    }
}

const INPUT_ELEMENTS = ['input', 'textarea', 'button'];
const INPUT_ROLES = ['textbox', 'textarea', 'input', 'button'];

/** Don't run vim keybindings if we are actively focused on an input element */
export function isFocusedOnInput() {
    const active = document.activeElement;
    if (!active) {
        return false;
    }
    if (INPUT_ELEMENTS.includes(active.tagName.toLowerCase())) {
        return true;
    }
    return INPUT_ROLES.includes(active.getAttribute('role')!);
}
