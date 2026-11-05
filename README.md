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


## AWS account hover labels

In the extension popup or options, use **AWS account mappings** to paste AWS CLI
config text with SSO profiles, or a JSON array like:

```json
[{"id":"123456789012","name":"Example dev","profiles":["example-dev"]}]
```

Save replaces the mapping; `[]` clears it. Config import extracts only
`sso_account_id` and profile names, combining profiles that share an account.
Names initially come from the first profile and can be edited in JSON. Mapping
data stays in this browser's local storage and does not sync across devices.

On HTTPS pages, pause the pointer over a known 12-digit ID (including within an
ARN) for 300 ms. Unknown IDs stay untouched. Refresh existing tabs after updating
the extension. The feature can be disabled in its settings.

Lookup checks only the text under the pointer, with a bounded 25-character slice
and an in-memory map. There is no page scan, mutation observer, polling, network
lookup, or rewriting of page text. Dynamically loaded text works automatically.
Browser text hit-testing and tooltip positioning still perform layout work on
hover. Editable fields, frames, shadow DOM, canvas, and IDs split across text
nodes are not supported. IDs have no persistent highlight.
