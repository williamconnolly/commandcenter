# CommandCenter

> Fuzzy search through bookmarks, commands and tabs. Accessible via New Tab or on any page with configured keybindings

## Todo
- [ ] Quick links popup with keyboard chords
- [ ] Don't allow mouseover list items until mouse has moved X pixels
  - [x] Fixed partially with mouseenter
- [ ] Favicon cache and overrides so it doesn't spam with failed network requests off VPN
- [ ] Set up opinionated auto linting
- [ ] Track frequency of the Bookmarks and weight recently used ones to the top
- [ ] Add option to Blacklist Current Domain like uBlock does
- [ ] Actually use settings.scrollSmooth
- [ ] Document code files for adding siteScripts and vimKeys
- [ ] GitHub Actions
    - [ ] Action to deploy build to Chrome Web Store
- [x] Handle hover mode better - it's hard to tell difference of selectedIndex and hover
- [x] Use Switch.svelte from other extension

## Development

```bash
# install dependencies
npm i

# build files to `/dist` directory
npm run start
```

## Build

```bash
# build files to `/dist` directory
$ npm run build
```

## Load unpacked extensions

1. Open the Extension Management page by navigating to `chrome://extensions`.
2. Enable Developer Mode by clicking the toggle switch next to `Developer mode`.
3. Click the `Load Unpacked` button and select the `/dist` directory.

<img width="1024" alt="LoadUnpackedExtension" src="https://github.com/williamconnolly/commandcenter/assets/30242826/0cdc81dc-375d-4596-9026-eca11a274de1">

## Trigger actions from macOS

With CommandCenter loaded on the active Brave webpage, run:

```bash
./scripts/trigger-action.scpt closeCurrentTab
./scripts/trigger-action.scpt submit
# Or: osascript scripts/trigger-action.scpt closeCurrentTab
```

Enable Brave's **View > Developer > Allow JavaScript from Apple Events**.
The wrapper dispatches `commandcenter:action:<actionName>` on the active tab.
Supported actions: `submit`, `closeCurrentTab`, `duplicateTab`, `openExtensions`,
`openCommandCenter`, `openTabCenter`, `openQuickLinks`, and `close` (close the overlay).
Reload the extension and webpage after rebuilding to register the action listeners.
