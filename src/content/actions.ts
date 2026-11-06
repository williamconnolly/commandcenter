import { Action, Msg, postActionMessage, sendMessage } from '../comms/messages';
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

export function setupActionEvents() {
    const actions: Record<string, () => void> = {
        submit: () => { void submitAction(); },
        closeCurrentTab: () => sendMessage(Msg.closeCurrentTab),
        duplicateTab: () => sendMessage(Msg.duplicateTab),
        openExtensions: () => sendMessage(Msg.openExtensions),
    };

    for (const action of Object.values(Action)) {
        actions[action] = () => postActionMessage(action);
    }

    for (const [name, execute] of Object.entries(actions)) {
        window.addEventListener(`commandcenter:action:${name}`, execute);
    }
}
