<script lang="ts">
    import CommandCenter from './CommandCenter.svelte';
    import TabCenter from './TabCenter.svelte';
    import QuickLinks from './QuickLinks.svelte';
    import { Mode } from '../comms/commands';
    import { storage } from '../storage';

    let focusInputRef = $state(false);
    let mode = $state(Mode.COMMAND_CENTER);
    let backgroundColor = $state('#202124'); // Default to $kh-black

    // Load background color from storage
    storage.get().then((storageData) => {
        backgroundColor = storageData.newTabBackgroundColor;
    });

    function togglefocusInputRef() {
        focusInputRef = true;
        setTimeout(() => {
            focusInputRef = false;
        }, 10);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="container" style="background-color: {backgroundColor}" onclick={() => togglefocusInputRef()}>
    {#if mode === Mode.TAB_CENTER}
        <TabCenter
                largeWidth
                escapeHandler={() => mode = Mode.COMMAND_CENTER}
                {focusInputRef}
                renderingInPage={false}
        />
    {:else if mode === Mode.QUICK_LINKS}
        <QuickLinks
                largeWidth
                escapeHandler={() => mode = Mode.COMMAND_CENTER}
                {focusInputRef}
                renderingInPage={false}
        />
    {:else}
        <CommandCenter
                largeWidth
                escapeHandler={() => {}}
                switchModeHandler={(switchToMode) => mode = switchToMode}
                renderingInPage={false}
                {focusInputRef}
        />
    {/if}
</div>

<style lang="scss">
    @use '../assets/colors' as *;

    .container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }
</style>
