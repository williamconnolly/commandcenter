import { expect, test as base, chromium, type BrowserContext } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const extensionPath = path.resolve('dist');

const test = base.extend<{ context: BrowserContext }>({
    context: async ({}, use) => {
        const userDataDir = await mkdtemp(path.join(tmpdir(), 'commandcenter-'));
        const context = await chromium.launchPersistentContext(userDataDir, {
            channel: 'chromium',
            headless: true,
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
            ],
        });

        try {
            await use(context);
        } finally {
            await context.close();
            await rm(userDataDir, { recursive: true, force: true });
        }
    },
});

test('opens Linear issue links with the native protocol instead of navigating to Linear', async ({ context }) => {
    await context.route('https://deeplink-test.example/**', async route => {
        await route.fulfill({
            contentType: 'text/html',
            body: `
                <script>
                    document.addEventListener('click', event => {
                        setTimeout(() => window.linearClickWasPrevented = event.defaultPrevented);
                    }, true);
                </script>
                <a id="linear-link" href="https://linear.app/sema4ai/issue/APEX-137/test#agent-session">Open issue</a>
            `,
        });
    });

    const page = await context.newPage();
    await page.goto('https://deeplink-test.example/');
    await page.locator('#linear-link').click();

    await expect.poll(() => page.evaluate(() => (window as Window & { linearClickWasPrevented?: boolean }).linearClickWasPrevented)).toBe(true);
    await expect(page).toHaveURL('https://deeplink-test.example/');
});
