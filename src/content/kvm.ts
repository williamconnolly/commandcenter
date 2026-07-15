import { Msg } from '../comms/messages';
import { retryAction } from './utils';

type KvmPasswordResponse = {
    password?: string;
};

async function prefillKvmPassword() {
    let response: KvmPasswordResponse | undefined;
    try {
        response = await chrome.runtime.sendMessage({ directive: Msg.getKvmPassword }) as KvmPasswordResponse | undefined;
    } catch {
        return;
    }
    const password = response?.password || '';
    if (!password) {
        return;
    }

    retryAction(10, 200, () => {
        const input = document.querySelector<HTMLInputElement>('input#form_item_passwd[type="password"]');
        if (!input) {
            return false;
        }
        if (input.value) {
            return true;
        }

        input.value = password;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    });
}

void prefillKvmPassword();
