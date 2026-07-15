import { expect, test as base, chromium, type BrowserContext } from '@playwright/test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const extensionPath = path.resolve('dist');

const test = base.extend<{
    context: BrowserContext;
    extensionId: string;
}>({
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
    extensionId: async ({ context }, use) => {
        const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
        await use(new URL(worker.url()).host);
    },
});

test('loads the built Manifest V3 extension and renders its popup', async ({ context, extensionId }) => {
    const manifest = JSON.parse(await readFile(path.join(extensionPath, 'manifest.json'), 'utf8'));
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.background.service_worker).toBeTruthy();

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);

    await expect(popup.getByRole('heading', { name: 'CommandCenter' })).toBeVisible();
    await expect(popup.getByLabel('GitHub Username:')).toBeVisible();
});
