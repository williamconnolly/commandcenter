import { AWS_ACCOUNTS_KEY, AWS_ENABLED_KEY, parseAccounts, type AwsAccount } from '../awsAccounts';

// No document scan or mutation observer: inspect only text under a stationary pointer.
export function setupAwsAccountLabels() {
    let accounts = new Map<string, AwsAccount>();
    let enabled = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let tooltip: HTMLDivElement | undefined;
    let generation = 0;
    const hide = () => {
        clearTimeout(timer);
        tooltip?.remove();
        tooltip = undefined;
    };
    const load = async () => {
        const current = ++generation;
        try {
            const values = await chrome.runtime.sendMessage({ awsAccountLabels: true });
            if (current !== generation) return;
            accounts = new Map(parseAccounts(JSON.stringify(values[AWS_ACCOUNTS_KEY] ?? [])).map(a => [a.id, a]));
            enabled = values[AWS_ENABLED_KEY] !== false;
        } catch { accounts.clear(); }
        hide();
    };
    void load();
    chrome.runtime.onMessage.addListener(message => {
        if (message?.awsAccountLabelsChanged === true) void load();
    });
    document.addEventListener('pointermove', event => {
        hide();
        if (!enabled || !accounts.size || event.pointerType === 'touch' || event.buttons
            || !(event.target instanceof Element)
            || event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
        const { clientX: x, clientY: y } = event;
        timer = setTimeout(() => {
            const range = document.caretRangeFromPoint(x, y);
            const node = range?.startContainer;
            if (!range || !node || node.nodeType !== Node.TEXT_NODE || !node.parentElement
                || node.parentElement.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), script, style')) return;
            // Copy at most 25 characters, even for a multi-megabyte log text node.
            const offset = range.startOffset;
            const start = Math.max(0, offset - 12);
            const text = (node as Text).substringData(start, 25);
            for (const match of text.matchAll(/\d{12}/g)) {
                const from = start + match.index!;
                const to = from + 12;
                if (offset < from || offset > to) continue;
                const source = node as Text;
                if (/\d/.test(source.substringData(Math.max(0, from - 1), from ? 1 : 0))
                    || /\d/.test(source.substringData(to, 1))) continue;
                const account = accounts.get(match[0]);
                if (!account) continue;
                range.setStart(node, from);
                range.setEnd(node, to);
                // caretRangeFromPoint can snap to nearby text; require an actual hit.
                if (![...range.getClientRects()].some(r => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)) continue;
                const host = document.createElement('div');
                host.setAttribute('data-commandcenter-aws-tooltip', '');
                host.style.cssText = 'all:initial!important;position:fixed!important;z-index:2147483647!important;pointer-events:none!important;';
                const shadow = host.attachShadow({ mode: 'closed' });
                const box = document.createElement('div');
                box.textContent = `${account.name}\n${account.id}${account.profiles.length ? '\nProfiles: ' + account.profiles.join(', ') : ''}`;
                box.style.cssText = 'font:13px/1.5 system-ui;color:white;background:#202124;border:1px solid #888;border-radius:6px;padding:8px 12px;white-space:pre-wrap;overflow-wrap:anywhere;max-width:min(360px, calc(100vw - 32px));max-height:40vh;overflow:hidden;box-shadow:0 2px 8px #0006;';
                shadow.append(box);
                document.documentElement.append(host);
                const bounds = host.getBoundingClientRect();
                host.style.setProperty('left', `${Math.max(8, Math.min(x + 12, innerWidth - bounds.width - 8))}px`, 'important');
                host.style.setProperty('top', `${Math.max(8, Math.min(y + 18, innerHeight - bounds.height - 8))}px`, 'important');
                tooltip = host;
                break;
            }
        }, 300);
    }, { passive: true });
    document.addEventListener('scroll', hide, { passive: true, capture: true });
    document.addEventListener('pointerdown', hide, { passive: true });
    document.addEventListener('pointerout', hide, { passive: true });
    document.addEventListener('keydown', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('resize', hide, { passive: true });
    document.addEventListener('visibilitychange', hide);
}
