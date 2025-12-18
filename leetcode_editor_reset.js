// ==UserScript==
// @name         Reset LeetCode.cn Editor on Load
// @namespace    https://leetcode.cn/
// @version      1.0
// @description  Reset LeetCode.cn editor on load to avoid seeing previously submitted solutions
// @author       laurensent
// @match        https://leetcode.cn/problems/*
// @icon         https://leetcode.cn/favicon.ico
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    const COPY_KEY = 'copyBeforeReset';

    function isCopyEnabled() {
        return GM_getValue(COPY_KEY, false);
    }

    function toggleCopy() {
        const current = isCopyEnabled();
        GM_setValue(COPY_KEY, !current);
        location.reload();
    }

    GM_registerMenuCommand(
        `${isCopyEnabled() ? '✅' : '❌'} Copy code before reset`,
        toggleCopy
    );

    let confirmAttempts = 0;
    const MAX_ATTEMPTS = 3;

    function copyCode() {
        try {
            const code = document.querySelector('.view-lines')?.innerText;
            if (code) {
                navigator.clipboard.writeText(code).then(() => {
                    console.log('[LeetCode Reset] Code copied to clipboard');
                }).catch(err => {
                    console.warn('[LeetCode Reset] Failed to copy:', err);
                });
                return true;
            }
        } catch (e) {
            console.warn('[LeetCode Reset] Could not get code:', e);
        }
        return false;
    }

    function confirm() {
        let confirm_button = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.trim() === '确认');
        if (confirm_button) {
            confirm_button.click();
        } else if (++confirmAttempts < MAX_ATTEMPTS) {
            setTimeout(confirm, 100);
        }
    }

    function reset() {
        let svg = document.querySelector('svg[data-icon="arrow-rotate-left"]');
        let reset_button = svg ? svg.closest('button') : null;
        if (reset_button) {
            if (isCopyEnabled()) {
                copyCode();
            }
            reset_button.click();
            setTimeout(confirm, 100);
        }
    }

    function waitForEditor() {
        const svg = document.querySelector('svg[data-icon="arrow-rotate-left"]');
        const viewLines = document.querySelector('.view-lines');
        if (svg && viewLines) {
            setTimeout(reset, 200);  // 元素就绪后再等 200ms 确保稳定
        } else {
            setTimeout(waitForEditor, 300);
        }
    }

    waitForEditor();
})();