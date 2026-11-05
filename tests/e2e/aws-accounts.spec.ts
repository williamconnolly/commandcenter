import { test, expect, chromium } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('imports accounts, recognizes exact hovered IDs and live settings without changing page text', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'cc-aws-'));
    const extension = path.resolve('dist');
    const context = await chromium.launchPersistentContext(dir, {
        channel: 'chromium', headless: true,
        args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    });
    try {
        const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
        const options = await context.newPage();
        await options.goto(`chrome-extension://${new URL(worker.url()).host}/src/options/options.html`);
        const mappings = options.getByLabel('AWS account mappings');
        await expect(mappings).toBeEnabled();
        await mappings.fill('[profile test-dev]\nsso_account_id = 123456789012\naws_secret_access_key = do-not-store\n[profile test-admin]\nsso_account_id = 123456789012');
        await options.getByRole('button', { name: 'Save AWS accounts' }).click();
        await expect(options.getByRole('status')).toContainText('Saved 1 accounts');
        expect(await mappings.inputValue()).not.toContain('do-not-store');
        const stored = await options.evaluate(() => chrome.storage.local.get('awsAccountLabels'));
        expect(stored.awsAccountLabels).toEqual([{ id: '123456789012', name: 'test-dev', profiles: ['test-dev', 'test-admin'] }]);
        await mappings.fill('[{"id":"bad","name":"bad"}]');
        await options.getByRole('button', { name: 'Save AWS accounts' }).click();
        await expect(options.getByRole('status')).toContainText('12-digit');
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await context.route('https://aws-labels.example/**', route => route.fulfill({
            contentType: 'text/html', body: '<p id="known">123456789012</p><p id="arn">arn:aws:iam::123456789012:role/test</p><p id="unknown">999999999999</p><p id="long">01234567890123</p><textarea>123456789012</textarea><div id="dynamic"></div><div id="huge"></div>',
        }));
        await page.goto('https://aws-labels.example/');
        const tip = page.locator('[data-commandcenter-aws-tooltip]');
        await expect(async () => {
            await page.mouse.move(0, 0);
            await page.locator('#known').hover({ position: { x: 30, y: 8 } });
            await expect(tip).toBeVisible({ timeout: 1000 });
        }).toPass();
        // Closed shadow root protects tooltip styling; page text remains unchanged.
        await expect(page.locator('#known')).toHaveText('123456789012');
        const arnPoint = await page.locator('#arn').evaluate(element => {
            const range = document.createRange();
            range.setStart(element.firstChild!, 13);
            range.setEnd(element.firstChild!, 25);
            const rect = range.getBoundingClientRect();
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        });
        await page.mouse.move(arnPoint.x, arnPoint.y);
        await expect(tip).toBeVisible();
        for (const selector of ['#unknown', '#long', 'textarea']) {
            await page.locator(selector).hover({ position: { x: 30, y: 8 } });
            await page.waitForTimeout(400);
            await expect(tip).toHaveCount(0);
        }
        await page.evaluate(() => {
            document.querySelector('#dynamic')!.textContent = '123456789012';
            document.querySelector('#huge')!.textContent = '123456789012 ' + 'x'.repeat(2_000_000);
        });
        for (const selector of ['#dynamic', '#huge']) {
            await page.locator(selector).hover({ position: { x: 30, y: 8 } });
            await expect(tip).toBeVisible();
        }
        await options.getByLabel('Enable AWS account labels').uncheck();
        await mappings.fill('[]');
        await options.getByRole('button', { name: 'Save AWS accounts' }).click();
        await expect(tip).toHaveCount(0);
        await page.locator('#known').hover({ position: { x: 30, y: 8 } });
        await page.waitForTimeout(400);
        await expect(tip).toHaveCount(0);
        expect(errors).toEqual([]);
    } finally {
        await context.close();
        await rm(dir, { recursive: true, force: true });
    }
});
