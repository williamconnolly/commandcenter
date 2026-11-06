import { storage } from '../storage';

export async function submitAction(): Promise<void> {
    try {
        const { submitSelector } = await storage.get();
        if (typeof submitSelector !== 'string' || !submitSelector.trim()) {
            return;
        }

        const matches = document.querySelectorAll(submitSelector);
        if (matches.length !== 1) {
            return;
        }

        const target = matches[0];
        if (target instanceof HTMLElement) {
            target.click();
        } else {
            target.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                composed: true,
                view: window,
            }));
        }
    } catch (error) {
        console.warn('[CommandCenter:submit] Unable to perform submit action:', error);
    }
}
