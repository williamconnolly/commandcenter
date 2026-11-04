<script lang="ts">
    import { onMount } from 'svelte';
    import { AWS_ACCOUNTS_KEY, AWS_ENABLED_KEY, parseAccounts } from '../awsAccounts';
    let input = $state('');
    let enabled = $state(true);
    let status = $state('');
    let loaded = $state(false);
    onMount(() => {
        chrome.storage.local.get([AWS_ACCOUNTS_KEY, AWS_ENABLED_KEY]).then(values => {
            input = JSON.stringify(values[AWS_ACCOUNTS_KEY] ?? [], null, 2);
            enabled = values[AWS_ENABLED_KEY] !== false;
            loaded = true;
        }).catch(() => status = 'Could not load account settings.');
    });
    async function save() {
        try {
            const accounts = parseAccounts(input);
            await chrome.storage.local.set({ [AWS_ACCOUNTS_KEY]: accounts, [AWS_ENABLED_KEY]: enabled });
            input = JSON.stringify(accounts, null, 2);
            status = `Saved ${accounts.length} accounts. Open pages update automatically.`;
        } catch (error) {
            status = error instanceof Error ? error.message : 'Could not save accounts.';
        }
    }
</script>

<section>
    <h2>AWS account hover labels</h2>
    <p>Hover over a known account ID on an HTTPS page to see its name and CLI profiles.</p>
    <label><input type="checkbox" bind:checked={enabled} disabled={!loaded} /> Enable AWS account labels</label>
    <p>Paste AWS config text containing SSO profiles, or edit the JSON below. Only account IDs, names and profile names are saved locally in this browser; other config fields are discarded. The first profile becomes the initial name; edit it to the account name you prefer.</p>
    <label for="aws-account-mappings">AWS account mappings</label>
    <textarea id="aws-account-mappings" bind:value={input} rows="12" disabled={!loaded} spellcheck="false" placeholder={'[{"id":"123456789012","name":"Example dev","profiles":["example-dev"]}]'}></textarea>
    <button onclick={save} disabled={!loaded}>Save AWS accounts</button>
    <p role="status">{status}</p>
    <p>Saving replaces the list. Use [] to clear it. Hover lookup leaves page text intact; editable fields, frames and text split across elements are excluded.</p>
</section>

<style>
    section { margin: 1rem; padding: 1rem; max-width: 48rem; color: #e5e7eb; background: #202124; border-radius: 8px; font: 14px/1.5 system-ui; }
    textarea { display: block; width: 100%; box-sizing: border-box; margin: .5rem 0; font: 13px/1.5 monospace; padding: 8px; border: 1px solid #64748b; border-radius: 6px; background: #111827; color: #f3f4f6; }
    button { padding: 6px 12px; border: 1px solid #64748b; border-radius: 6px; background: #374151; color: #fff; }
</style>
