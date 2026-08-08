const CONCEPT_TOUR_VERSION = 5;
const RELOADED_KEY = 'commandcenter:sema4ai-tour-skip-reloaded';
const CSRF_COOKIE_NAME = 'as2026_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

function csrfToken() {
    const cookie = document.cookie.split(';').map(value => value.trim()).find(value => value.startsWith(`${CSRF_COOKIE_NAME}=`));
    return cookie?.slice(CSRF_COOKIE_NAME.length + 1);
}

if (!sessionStorage.getItem(RELOADED_KEY)) {
    const loadingStyle = document.createElement('style');
    loadingStyle.textContent = 'html { visibility: hidden !important; }';
    document.documentElement.appendChild(loadingStyle);
    const token = csrfToken();

    void fetch('/api/v1/auth/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { [CSRF_HEADER_NAME]: token } : {}),
        },
        body: JSON.stringify({ welcome_seen_version: CONCEPT_TOUR_VERSION }),
    }).then(response => {
        if (!response.ok) {
            loadingStyle.remove();
            return;
        }

        sessionStorage.setItem(RELOADED_KEY, 'true');
        window.location.reload();
    }).catch(() => {
        // The tour is a convenience only; an unavailable API must not affect the app.
        loadingStyle.remove();
    });
}
