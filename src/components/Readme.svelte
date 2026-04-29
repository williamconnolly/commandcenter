<script lang="ts">
    import KeyFunctionDescription from './KeyFunctionDescription.svelte';
    import K from './Key.svelte';
    import { type IStorage, resetStorage, storage } from '../storage';
    import { G_KEY_MAP, KEY_MAP, type KeyMap } from '../content/vimKeys';
    import Switch from './Switch.svelte';

    /** State */

    let githubUsername = $state('');
    let gDoubleTime = $state(350);
    let vimKeysBlacklistCSV = $state('');
    let scrollSmooth = $state(true);
    let newTabBackgroundColor = $state('#202124');
    let redditThumbnailSizeIncrement = $state(5);
    let currentRedditThumbnailSize = $state(70);
    let awsProfileNamesCSV = $state('');
    storage.get().then((storage: IStorage) => {
        githubUsername = storage.githubUsername;
        gDoubleTime = storage.gDoubleTime;
        vimKeysBlacklistCSV = storage.vimKeysBlacklistCSV;
        scrollSmooth = storage.scrollSmooth;
        newTabBackgroundColor = storage.newTabBackgroundColor;
        redditThumbnailSizeIncrement = storage.redditThumbnailSizeIncrement;
        currentRedditThumbnailSize = storage.currentRedditThumbnailSize;
        awsProfileNamesCSV = storage.awsProfileNamesCSV;
    });

    const csvUrlRe = /^[.a-z0-9,_ -]*$/

    function saveSettings() {
        storage.set({
            githubUsername,
            gDoubleTime,
            vimKeysBlacklistCSV,
            scrollSmooth,
            newTabBackgroundColor,
            redditThumbnailSizeIncrement,
            currentRedditThumbnailSize,
            awsProfileNamesCSV
        });
    }

    let debounceTimer: number;
    const handleSettingInputKey = (event: KeyboardEvent) => {
        clearTimeout(debounceTimer);
        if (event.key === 'Enter') {
            saveSettings();
            return;
        }
        debounceTimer = setTimeout(() => {
            saveSettings();
        }, 300)
    }

    type KeyFunctionInfo = {
        key: string;
        description: string;
    }

    function getKeyFunctionInfos(keyMap: KeyMap): KeyFunctionInfo[] {
        return Object.keys(keyMap).map((key: string) => {
            const [description] = [...keyMap[key]()];
            return { key, description };
        });
    }

    const gKeyFunctionInfos = getKeyFunctionInfos(G_KEY_MAP);
    const keyFunctionInfos = getKeyFunctionInfos(KEY_MAP);

    const ID_GU = 'githubUsername';
    const ID_GDT = 'gDoubleTime';
    const ID_VKBCSV = 'vimKeysBlacklistCSV';
    const ID_SS = 'scrollSmooth';
    const ID_NTBC = 'newTabBackgroundColor';
    const ID_RTSI = 'redditThumbnailSizeIncrement';
    const ID_CRTS = 'currentRedditThumbnailSize';
    const ID_APNCSV = 'awsProfileNamesCSV';
    let vimKeysBlacklistCSVInvalid = $derived(!csvUrlRe.test(vimKeysBlacklistCSV));
    // TODO: Is there a way to just call on scrollSmooth change?
    $effect(() => {
        if (scrollSmooth || !scrollSmooth) {
            saveSettings();
        }
    });
</script>

<div class="readme-container">
    <h1>CommandCenter</h1>
    <p>CommandCenter is a utility for adding the following functionality:</p>
    <div class="li">"Fuzzy search" that uses
        <K small>fzf</K>
        that is more forgiving and uses substring search
    </div>
    <div class="li">CommandCenter: list of commands, bookmarks, current and recently closed tabs</div>
    <div class="li">TabCenter: allows you to search, jump to, close and reopen tabs</div>
    <div class="li">Keybindings to open both of these on any page, not just New Tab</div>
    <div class="li">Utility "Site Scripts" injected into configured webpages</div>
    <div class="li">Vim-style keybindings to every webpage</div>
    <h2>Command and Tab Center</h2>
    <p>
        Be sure to select "keep" when presented with the option when opening New Tab page for the first time
        Look at the G Key Bindings below to see how to access on any page, not just New Tab
        To use TabCenter, use the
        <K>tc</K>
        command or search for it and hit
        <K>enter</K>
    </p>
    <h2>Keybindings</h2>
    <p>Keybindings follow general Vim style</p>
    {#each keyFunctionInfos as kfi}
        <KeyFunctionDescription key={kfi.key} description={kfi.description} />
    {/each}
    <h2>G Keybindings</h2>
    <p>
        "G Keybindings" always are prefixed with lowercase
        <K>g</K>
        You must hit the second key within <K>{gDoubleTime}</K> milliseconds.
        Most have a mnemonic to help memorize.
        <K>gg</K>
        and
        <K>G</K>
    </p>
    {#each gKeyFunctionInfos as gkfi}
        <KeyFunctionDescription key={`g${gkfi.key}`} description={gkfi.description} />
    {/each}
    <h2>Settings</h2>
    <div class="setting-input">
        <label for={ID_GU}>GitHub Username:</label>
        <input id={ID_GU}
               name={ID_GU}
               bind:value={githubUsername}
               onkeydown={handleSettingInputKey}
               spellcheck="false"
               autocomplete="off"
               placeholder="GitHub Username"
               minlength="3"
               maxlength="40"
        >
    </div>
    <div class="setting-input">
        <label for={ID_GDT}><K>G</K> Keybinding Timeout:</label>
        <input id={ID_GDT}
               name={ID_GDT}
               type="number"
               bind:value={gDoubleTime}
               onkeydown={handleSettingInputKey}
               min="100"
               max="3000"
               spellcheck="false"
               placeholder="Milliseconds"
               required
        >
    </div>
    <div class="setting-input">
        <label for={ID_VKBCSV}>Vim Keys URL Blacklist:</label>
        <input id={ID_VKBCSV}
               name={ID_VKBCSV}
               bind:value={vimKeysBlacklistCSV}
               onkeydown={handleSettingInputKey}
               class:invalid={vimKeysBlacklistCSVInvalid}
               spellcheck="false"
               autocomplete="off"
               placeholder="google.com, example.com"
        >
    </div>
    <div class="setting-input align-center">
        <label for={ID_SS}>Smooth Scroll:</label>
        <Switch id={ID_SS} bind:checked={scrollSmooth} />
    </div>
    <div class="setting-input">
        <label for={ID_NTBC}>New Tab Background Color:</label>
        <input id={ID_NTBC}
               name={ID_NTBC}
               bind:value={newTabBackgroundColor}
               onchange={saveSettings}
               type="color"
        >
    </div>
    <div class="setting-input">
        <label for={ID_RTSI}>Reddit Thumbnail Size Increment:</label>
        <input id={ID_RTSI}
               name={ID_RTSI}
               bind:value={redditThumbnailSizeIncrement}
               onkeyup={handleSettingInputKey}
               type="number"
               min="1"
               max="50"
        >
    </div>
    <div class="setting-input">
        <label for={ID_CRTS}>Reddit Thumbnail Size:</label>
        <input id={ID_CRTS}
               name={ID_CRTS}
               bind:value={currentRedditThumbnailSize}
               onkeyup={handleSettingInputKey}
               type="number"
               min="30"
               max="250"
        >
    </div>
    <div class="setting-input">
        <label for={ID_APNCSV}>AWS Profile Names:</label>
        <input id={ID_APNCSV}
               name={ID_APNCSV}
               bind:value={awsProfileNamesCSV}
               onkeydown={handleSettingInputKey}
               spellcheck="false"
               autocomplete="off"
               placeholder="sema4ai-backend-dev, sema4ai-backend-prod"
        >
    </div>
    <div class="setting-input">
        <label for="resetStorage">Reset Storage:</label>
        <button id="resetStorage" onclick={() => resetStorage().then(window.close)}>Reset Storage</button>
    </div>
</div>

<style lang="scss">
    @use '../assets/colors' as *;
    @use '../assets/mixins' as *;

    .readme-container {
        @include system-font;
        display: flex;
        flex-direction: column;
        color: $kh-light;
        padding: 0 15px 50px 15px;
    }

    .li {
        margin: 3px;

        &:before {
            content: "•  "
        }
    }

    .setting-input {
        @include system-font;
        display: flex;
        height: 45px;
        align-items: baseline;
        font-size: 15px;

        &.align-center {
            align-items: center;
        }

        label {
            margin-right: 10px;
            width: 35%;
        }

        button {
            outline: 0;
            font-size: 1.2rem;
            line-height: 1.2;
            background-color: $kh-red;
            color: $kh-white;
            border-radius: 5px;
            border: 0;
        }

        input {
            flex-grow: 1;
            margin-top: 5px;
            padding: 10px 10px;
            font-size: 15px;
            color: $kh-black;
            background-color: $kh-white;
            border: 1px solid $kh-silver;
            border-radius: 5px;

            &:invalid, &.invalid {
                outline: 1px solid $kh-red;
            }
        }

        input[type="color"] {
            padding: 0;
        }
    }

    h1, h2 {
        @include border-hr;
        text-align: center;
        margin: 15px 0 5px;
    }

    p {
        font-size: 15px;
        padding: 0 10px;
        margin: 10px 0;
        line-height: 1.4em;
    }
</style>
