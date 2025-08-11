import { type ContentUrls, queryEachAnchor, retryAction, triggerRedditThumbnailSize, urlIncludes, CSS_VAR_REDDIT_THUMBNAIL, queryEach } from './utils';
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
    retryAction(5, 100, () => {
        const portalApplication = document.querySelector<HTMLDivElement>('portal-application');
        if (portalApplication) {
            portalApplication.click();

            retryAction(3, 20, () => {
                const expandIcons = document.querySelectorAll<HTMLImageElement>('.expandIcon');
                if (expandIcons?.length) {
                    expandIcons.forEach(ei => ei.click());
                    return true;
                }
                return false;
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

export function setupSiteScripts() {
    SITE_SCRIPTS.forEach(script => {
        if (urlIncludes(script.urls)) {
            script.setup();
        }
    });
}
