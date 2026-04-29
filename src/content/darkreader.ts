import { enable, setFetchMethod } from 'darkreader';

const HOST_PATTERNS = [
    /^[^.]*-admin\.app\.sema4ai\.dev$/,
    /(^|\.)zoom\.us$/,
];

if (HOST_PATTERNS.some((re) => re.test(location.hostname))) {
    // Dark Reader injects an inline <script class="darkreader--proxy"> for
    // page-world CSSOM/shadow-DOM hooks. Pages with a <meta> CSP forbidding
    // inline scripts block it. Suppress that one insertion; the base dark
    // theme still applies via injected <style>.
    const origInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(node: T, child: Node | null): T {
        if (
            node instanceof HTMLScriptElement &&
            node.classList.contains('darkreader--proxy')
        ) {
            return node;
        }
        return origInsertBefore.call(this, node, child) as T;
    };

    setFetchMethod(window.fetch);
    enable({ brightness: 100, contrast: 90, sepia: 0 });
}
