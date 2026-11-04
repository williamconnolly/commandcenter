import { storage, type VideoSeekRule } from '../storage';
import { Msg, sendMessage } from '../comms/messages';
import { type ContentUrls, CSS_VAR_REDDIT_THUMBNAIL, queryEach, queryEachAnchor, retryAction, triggerRedditThumbnailSize, urlIncludes } from './utils';
import pre = $effect.pre;

type SiteScript = {
    urls: ContentUrls;
    description: string;
    setup: () => void;
}
export const SITE_SCRIPTS: SiteScript[] = [];

function siteScript(urls: ContentUrls, description: string, setup: () => void) {
    SITE_SCRIPTS.push({ urls, description, setup });
}

function insertStyle(dedupeId: string, cssText: string) {
    if (document.getElementById(dedupeId)) {
        return;
    }
    const style = document.createElement('style');
    style.id = dedupeId;
    style.textContent = cssText;
    document.head.appendChild(style);
}

siteScript('k2s.cc', 'Keep2Share player width', () => {
    insertStyle('commandcenter-k2s-player-width', `
        #root #app #wrapper div:has(> div > div > [data-testid="video-player"]) {
            width: 900px !important;
        }
    `);
});

siteScript('jira.dev.lithium.com', 'Jira', () => {
    // make the popup dialogs actually use all the screen real estate
    const style = document.createElement('style');
    style.id = 'commandcenter-jira';
    style.textContent = `
        section#create-issue-dialog, section#edit-issue-dialog {
            top: 10px;
            bottom: 10px;
            width: 80%;
        }
        
        .jira-dialog.popup-width-large {
            width: 80% !important;
        }

        .aui-dialog2-content.jira-dialog-core-content {
            max-height: 100%;
        }
        
        .tox .tox-edit-area__iframe[title="Rich Text Area"] {
            /*padding: 0 7px !important;*/
        }
        `;
    document.head.appendChild(style);
});


siteScript('ycombinator.com', 'HackerNews', () => {
    queryEachAnchor('td.subtext a:not([class]):not([onclick])', a => a.target = '_blank');
    queryEachAnchor('a.titlelink', a => a.target = '_blank');
});

siteScript('reddit.com', 'Reddit', () => {
    queryEachAnchor('a.author', a => {
        if (a.href.match(/\/u(ser)?\/[^\/]+$/g)) {
            a.href = a.href + '/submitted/?sort=top&t=all';
        }
    });
    queryEachAnchor('a.subreddit', a => {
        if (a.href.match(/\/r\/[^\/]+$/g)) {
            a.href = a.href + 'top/?sort=top&t=all';
        }
    });
    queryEach<HTMLImageElement>('a.thumbnail > img', img => {
        img.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            const parentDiv = img.closest<HTMLDivElement>('div.thing');
            
            if (parentDiv) {
                parentDiv.querySelector<HTMLAnchorElement>('a.expando-button')?.click();
            }
        };
    });
    queryEach<HTMLImageElement>('div.entry', entry => {
        const title = entry.querySelector<HTMLAnchorElement>('a.title');
        const expandoButton = entry.querySelector<HTMLAnchorElement>('a.expando-button');
        if (!title || !expandoButton) {
            return;
        }
        title.onclick = e => {
            e.preventDefault();
            expandoButton?.click();
        };
    });

    // todo: import .scss file instead of inline string?
    // todo: some keybinding to raise/lower size
    insertStyle('commandcenter-reddit', `
        :root {
            ${CSS_VAR_REDDIT_THUMBNAIL}: 100px;
        }


        .linklisting .link a.thumbnail {
            width: var(${CSS_VAR_REDDIT_THUMBNAIL});
            margin: 0 7px 0 0;
        }

        .linklisting .link a.thumbnail img {
            width: var(${CSS_VAR_REDDIT_THUMBNAIL});
            height: auto;
            max-height: calc(var(${CSS_VAR_REDDIT_THUMBNAIL}) * 1.5);
        }
        `
    );

    document.addEventListener('keydown', function (event) {
        const keyLower = event.key.toLowerCase();
        if (event.ctrlKey && event.shiftKey) {
            if (keyLower === 'b') {
                triggerRedditThumbnailSize(1);
                event.preventDefault();

            } else if (keyLower === 'v') {
                triggerRedditThumbnailSize(-1);
                event.preventDefault();

            }
        }
    });
});


siteScript('github.com', 'GitHub', () => {
    function retryStatusActions() {
        retryAction(100, 500, () => {
            let foundOne = false;
            queryEachAnchor('a.status-actions', a => {
                a.href = a.href.replace('/display/redirect', '')
                a.target = '_blank';
                foundOne = true;
            });
            return foundOne;
        });
    }

    retryAction(100, 500, () => {
        let foundOne = false;
        queryEachAnchor('.statuses-toggle-closed', a => {
            a.onclick = retryStatusActions;
        });
        return foundOne;
    });
    retryStatusActions();
});

siteScript('meet.google.com', 'Google Meet', () => {
    retryAction(15, 100, () => {
        let didMute = false;
        const muteButtons = document.querySelectorAll<HTMLButtonElement>('[role="button"][data-is-muted="false"]');
        if (muteButtons.length === 2) {
            muteButtons.forEach((muteButton) => muteButton.click());
            didMute = true;
        }
        return didMute;
    });

    const MUTE_SELECTOR = '[role="button"][data-is-muted]'
    const toggleMute = () => document.querySelector<HTMLButtonElement>(MUTE_SELECTOR)?.click();
    const MI_ID = 'commandcenter-muteindicator';
    setInterval(() => {
        if (!document.querySelector('c-wiz')) {
            return;
        }
        let muteIndicator = document.getElementById(MI_ID) as HTMLSpanElement;
        if (!muteIndicator) {
            muteIndicator = document.createElement('span');
            muteIndicator.id = MI_ID;
            muteIndicator.style.cssText = `
                position: absolute;
                border-radius: 26px;
                font-size: 1rem;
                padding: 10px 20px;
                width: 80px;
                text-align: center;
                cursor: pointer;
                top: 90px;
                right: 32px;
                height: 20px;
                z-index: 100000000;
                `;

            muteIndicator.onclick = toggleMute;
            muteIndicator.addEventListener('mouseenter', () => {
              muteIndicator.style.filter = 'brightness(0.8)';
            });

            muteIndicator.addEventListener('mouseleave', () => {
              muteIndicator.style.filter = '';
            });
            document.querySelector('c-wiz')?.appendChild(muteIndicator);
        }
        const isMuted = document.querySelector(MUTE_SELECTOR)?.getAttribute('data-is-muted') === 'true';
        if (isMuted) {
            muteIndicator.textContent = 'Muted';
            muteIndicator.style.backgroundColor = '#dc362e';
            muteIndicator.style.border = '1px solid #dc362e';
            muteIndicator.style.color = 'white';
        } else {
            muteIndicator.textContent = 'Unmuted';
            muteIndicator.style.backgroundColor = 'initial';
            muteIndicator.style.color = 'initial';
            muteIndicator.style.border = '1px solid black';
        }
    }, 200);
});

siteScript('awsapps.com', 'AWS SSO', () => {
    insertStyle('commandcenter-aws-sso', `
        [data-testid="account-list"] {
            display: flex !important;
            flex-direction: column !important;
        }
        [data-testid="account-list"] > div.commandcenter-favorite-profile {
            order: -1 !important;
        }
    `);

    retryAction(5, 100, () => {
        const accountList = document.querySelector('[data-testid="account-list"]');
        if (accountList) {
            storage.get().then(({ awsProfileNamesCSV }) => {
                const profileNames = awsProfileNamesCSV
                    .split(',')
                    .map(name => name.trim())
                    .filter(name => name.length > 0);
                
                function markFavorites() {
                    const allButtons = document.querySelectorAll<HTMLButtonElement>(
                        'button[data-testid="account-list-cell"]'
                    );
                    allButtons.forEach(button => {
                        const accountNameSpan = button.querySelector<HTMLSpanElement>('strong span');
                        if (accountNameSpan) {
                            const accountName = accountNameSpan.textContent?.trim() || '';
                            let accountContainer = button.parentElement;
                            while (accountContainer && accountContainer.parentElement !== accountList) {
                                accountContainer = accountContainer.parentElement;
                            }
                            if (accountContainer && accountContainer.parentElement === accountList) {
                                if (profileNames.includes(accountName)) {
                                    accountContainer.classList.add('commandcenter-favorite-profile');
                                } else {
                                    accountContainer.classList.remove('commandcenter-favorite-profile');
                                }
                            }
                        }
                    });
                }

                markFavorites();
                
                const observer = new MutationObserver(() => {
                    markFavorites();
                });
                observer.observe(accountList, { childList: true, subtree: true });
                
                retryAction(3, 20, () => {
                    const collapsedButtons = document.querySelectorAll<HTMLButtonElement>(
                        'button[data-testid="account-list-cell"][aria-expanded="false"]'
                    );
                    if (collapsedButtons?.length) {
                        collapsedButtons.forEach(button => {
                            const accountNameSpan = button.querySelector<HTMLSpanElement>('strong span');
                            if (accountNameSpan) {
                                const accountName = accountNameSpan.textContent?.trim() || '';
                                if (profileNames.includes(accountName)) {
                                    button.click();
                                }
                            }
                        });
                        markFavorites();
                        return true;
                    }
                    return false;
                });
            });
            return true;
        }
        return false;
    });
});

siteScript('erles', 'erles', () => {
    retryAction(5, 50, () => {
        const modals = document.querySelectorAll<HTMLDivElement>('.ml-image-modal-data');
        if (modals.length) {
            let markedUp = false;
            modals.forEach((modal, i) => {
                const previewButton = modal.querySelector<HTMLSpanElement>('span.mag-icon-wrapper[data-image-view-modal-codename]');
                if (!previewButton) {
                    return;
                }

                const clickables = Array.from(modal.querySelectorAll<HTMLImageElement>('a.img-container, a.img-strip-overlay'));
                if (!clickables) {
                    return;
                }
                clickables.forEach(clickable => {
                    // add on click listener to img
                    clickable.onclick = e => {
                        if (!e.metaKey) {
                            e.preventDefault();
                            previewButton.click();
                        }
                    };
                });
                markedUp = true;
            });
            return markedUp;
        }
        return false;
    });
});

siteScript('imagebam', 'ImageBam', () => {
    retryAction(5, 50, () => {
        const continueLink = document.querySelector<HTMLAnchorElement>('#continue a[href]');
        if (continueLink) {
            continueLink.click();
            return true;
        }
        return false;
    });
});

siteScript('tineye', 'Tineye', () => {
    retryAction(5, 50, () => {
        const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href][title]');
        if (anchors.length) {
            anchors.forEach(a => a.target = '_blank');
            return true;
        }
        return false;
    });
});

siteScript('s.cc', 's.cc theatre mode', () => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
        if (Date.now() - startedAt >= 60_000) {
            clearInterval(interval);
            return;
        }

        const theatreButton = document.querySelector<HTMLElement>('.fluid_button_theatre');
        if (theatreButton) {
            theatreButton.click();
            clearInterval(interval);
        }
    }, 50);
});

export function setupVideoSeekControls(videoSeekRules: VideoSeekRule[]) {
    const matchedRule = videoSeekRules.find(({ urlPattern }) => urlPattern && urlIncludes(urlPattern));
    if (!matchedRule) {
        return;
    }
    const rule: VideoSeekRule = matchedRule;

    const SEEK_SECONDS = 5;
    const FINE_SEEK_SECONDS = 3;
    const LARGE_SEEK_SECONDS = 10;
    const LOG_PREFIX = `[CommandCenter:video-seek:${rule.urlPattern}]`;
    console.info(`${LOG_PREFIX} installing ${SEEK_SECONDS}-second keyboard seeking, ${FINE_SEEK_SECONDS} seconds with Shift+A/D, ${LARGE_SEEK_SECONDS} seconds with Ctrl+A/D`);

    function getVideo(): HTMLVideoElement | null {
        const selector = rule.videoSelector.trim();
        if (!selector) {
            return document.querySelector<HTMLVideoElement>('video');
        }

        try {
            return document.querySelector<HTMLVideoElement>(selector);
        } catch (error) {
            console.warn(`${LOG_PREFIX} invalid video selector "${selector}"`, error);
            return null;
        }
    }

    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase();
        const isLargeSeek = event.ctrlKey && (key === 'a' || key === 'd');
        if (event.metaKey || event.altKey || (event.ctrlKey && !isLargeSeek)) {
            return;
        }

        const seekDirection = key === 'arrowleft' || key === 'a'
            ? -1
            : key === 'arrowright' || key === 'd'
                ? 1
                : 0;
        const isSpacebar = event.code === 'Space';
        const isCloseTab = key === 'x';
        if (!seekDirection && !isSpacebar && !isCloseTab) {
            return;
        }

        const target = event.target;
        if (target instanceof HTMLElement && target.matches('input, select, textarea, [contenteditable="true"]')) {
            console.debug(`${LOG_PREFIX} ignoring ${event.key} while editing text`);
            return;
        }

        if (isCloseTab) {
            event.preventDefault();
            event.stopImmediatePropagation();
            console.info(`${LOG_PREFIX} X: closing current tab`);
            sendMessage(Msg.closeCurrentTab);
            return;
        }

        const video = getVideo();
        if (!video) {
            console.warn(`${LOG_PREFIX} received ${event.key}, but no player video was found`);
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (isSpacebar) {
            video.focus();
            console.info(`${LOG_PREFIX} Space: focused video player`);
            return;
        }

        const previousTime = video.currentTime;
        const seekSeconds = isLargeSeek
            ? LARGE_SEEK_SECONDS
            : event.shiftKey && (key === 'a' || key === 'd')
                ? FINE_SEEK_SECONDS
                : SEEK_SECONDS;
        const requestedTime = previousTime + (seekDirection * seekSeconds);
        const nextTime = Number.isFinite(video.duration)
            ? Math.min(Math.max(0, requestedTime), video.duration)
            : Math.max(0, requestedTime);

        video.currentTime = nextTime;
        console.info(`${LOG_PREFIX} ${event.key}: ${previousTime.toFixed(2)}s -> ${nextTime.toFixed(2)}s (${seekSeconds}s)`);
    }, true);
}

siteScript(['sdxdemo.com', 'response.lithium.com', 'app.khoros.com'], 'Care', () => {
    if (urlIncludes('/account/login') && !urlIncludes('manual-c01')) {
        window.location.href = window.location.href.replace('/account/login', '/khoros/login');
        return;
    }

    function makeConversationNumberClickable() {
        const conversationNumber = document.querySelector<HTMLDivElement>('[tooltip="Conversation Number"]');
        if (conversationNumber && conversationNumber.textContent && conversationNumber.textContent.length > 1) {
            const caseId = conversationNumber.textContent.slice(1);
            conversationNumber.onclick = () => {
                window.open(`/api/v2/conversations/displayIds/${caseId}`, '_blank');
            }
        }
    }

    setInterval(() => {
        if (urlIncludes('console/agent')) {
            makeConversationNumberClickable();
        }
    }, 2000)
});

// siteScript(['eurf', 'viper'], 'Eurf/Ergi thumbnail click', () => {
//     function setupThumbnailClicks() {
//         let foundOne = false;
//         queryEach<HTMLAnchorElement>('a[id^="attachment"][target="_blank"]', anchor => {
//             const thumbnail = anchor.querySelector<HTMLImageElement>('img.thumbnail[alt]');
//             if (thumbnail && thumbnail.alt) {
//                 thumbnail.onclick = e => {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     // Open in new tab without focusing (like cmd-shift-click)
//                     window.open(anchor.href, '_blank');
//                 };
//                 foundOne = true;
//             }
//         });
//         return foundOne;
//     }

//     retryAction(5, 100, setupThumbnailClicks);
    
//     // Also set up a MutationObserver to handle dynamically added elements
//     const observer = new MutationObserver(() => {
//         setupThumbnailClicks();
//     });
    
//     observer.observe(document.body, {
//         childList: true,
//         subtree: true
//     });
// });

export function setupSiteScripts() {
    SITE_SCRIPTS.forEach(script => {
        if (urlIncludes(script.urls)) {
            script.setup();
        }
    });
}
