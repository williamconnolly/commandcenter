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
    const contentScriptMatches = manifest.content_scripts.flatMap((script: { matches: string[] }) => script.matches);
    expect(contentScriptMatches).toContain('https://will-kvm.tailb1072f.ts.net/*');
    expect(contentScriptMatches).toContain('https://192.168.68.67/*');
    expect(contentScriptMatches).toContain('http://192.168.68.67/*');
    expect(manifest.content_scripts).toContainEqual(expect.objectContaining({
        js: expect.arrayContaining([expect.stringMatching(/sema4ai-tour/)]),
        run_at: 'document_start',
        world: 'MAIN',
    }));

    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);

    await expect(popup.getByRole('heading', { name: 'CommandCenter' })).toBeVisible();
    await expect(popup.getByLabel('GitHub Username:')).toBeVisible();
    const kvmPassword = popup.getByLabel('KVM Password:');
    await kvmPassword.fill('test-only-kvm-password');
    await kvmPassword.blur();
    await expect.poll(() => popup.evaluate(() => chrome.storage.local.get('kvmPassword').then(({ kvmPassword }) => kvmPassword))).toBe('test-only-kvm-password');

    await context.route('https://will-kvm.tailb1072f.ts.net/**', async route => {
        const hasExistingPassword = new URL(route.request().url()).searchParams.get('state') === 'existing';
        await route.fulfill({
            contentType: 'text/html',
            body: `
                <input id="form_item_passwd" type="password" value="${hasExistingPassword ? 'already-entered' : ''}">
                <script>
                    window.passwordEvents = 0;
                    document.addEventListener('input', () => window.passwordEvents++);
                    document.addEventListener('change', () => window.passwordEvents++);
                </script>
            `,
        });
    });

    const kvmLogin = await context.newPage();
    await kvmLogin.goto('https://will-kvm.tailb1072f.ts.net/#/');
    await expect(kvmLogin.locator('#form_item_passwd')).toHaveValue('test-only-kvm-password');
    await expect.poll(() => kvmLogin.evaluate(() => window.passwordEvents)).toBeGreaterThan(0);

    const existingPasswordLogin = await context.newPage();
    await existingPasswordLogin.goto('https://will-kvm.tailb1072f.ts.net/?state=existing#/');
    await expect(existingPasswordLogin.locator('#form_item_passwd')).toHaveValue('already-entered');
    await expect.poll(() => existingPasswordLogin.evaluate(() => window.passwordEvents)).toBe(0);
});

test('marks the Sema4AI concept tour as seen before the app loads', async ({ context }) => {
    await context.addCookies([{
        name: 'as2026_csrf',
        value: 'test-csrf-token',
        domain: 'tour-test.app.sema4ai.dev',
        path: '/',
        secure: true,
    }]);

    let tourSettingsRequest: { method: string; body: string | null; csrfToken?: string } | undefined;
    await context.route('https://tour-test.app.sema4ai.dev/**', async route => {
        const request = route.request();
        if (new URL(request.url()).pathname === '/api/v1/auth/settings') {
            tourSettingsRequest = {
                method: request.method(),
                body: request.postData(),
                csrfToken: request.headers()['x-csrf-token'],
            };
            await route.fulfill({ status: 204 });
            return;
        }

        await route.fulfill({
            contentType: 'text/html',
            body: '<main>Sema4AI app</main>',
        });
    });

    const app = await context.newPage();
    await app.goto('https://tour-test.app.sema4ai.dev/');

    await expect.poll(() => tourSettingsRequest).toEqual({
        method: 'PATCH',
        body: JSON.stringify({ welcome_seen_version: 5 }),
        csrfToken: 'test-csrf-token',
    });
});
