const DEPLOY_BUTTON_SELECTOR = '#app [data-testid="deploy-and-confirm-area"] button.primary';
const HEADER_LOGO_SELECTOR = '.HeaderLogo .logo.clickable';

let wasDisabled: boolean | null = null;
let clicked = false;

const interval = setInterval(() => {
    if (clicked) return;
    const btn = document.querySelector<HTMLButtonElement>(DEPLOY_BUTTON_SELECTOR);
    if (!btn) {
        wasDisabled = null;
        return;
    }
    const isDisabled = btn.disabled;
    if (wasDisabled === true && isDisabled === false && btn.textContent?.trim() === 'Deploy') {
        clicked = true;
        clearInterval(interval);
        setTimeout(() => btn.click(), 1000);
    }
    wasDisabled = isDisabled;
}, 500);

const logoInterval = setInterval(() => {
    const logo = document.querySelector<HTMLElement>(HEADER_LOGO_SELECTOR);
    if (!logo) return;
    clearInterval(logoInterval);
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(window.location.origin.replace('-admin', ''), '_blank');
    }, true);
}, 500);
