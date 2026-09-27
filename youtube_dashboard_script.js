(function() {
    // Prevent multiple injections
    if (document.getElementById('yt-ce-wrapper')) return;

    // 1. Create the Toggle Button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'yt-ce-wrapper';
    toggleBtn.innerText = '🛠️ Auto-Extractor';
    toggleBtn.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 999999; padding: 12px 20px; background: #cc0000; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-family: Roboto, Arial, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 14px;';
    document.body.appendChild(toggleBtn);

    // 2. Create the Dashboard Wrapper
    const dashboard = document.createElement('div');
    dashboard.style.cssText = 'display: none; position: fixed; bottom: 75px; right: 20px; z-index: 999999; width: 320px; background: #282828; color: #fff; border-radius: 8px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-family: Roboto, Arial, sans-serif; border: 1px solid #3f3f3f;';

    // Header
    const h3 = document.createElement('h3');
    h3.textContent = '1-Click Comment Extractor';
    h3.style.cssText = 'margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #3f3f3f; padding-bottom: 8px;';

    // Status Text
    const statusText = document.createElement('p');
    statusText.textContent = 'Status: Waiting to start...';
    statusText.style.cssText = 'margin: 5px 0 10px 0; font-size: 13px; color: #aaaaaa; font-style: italic; min-height: 18px;';

    // Stats
    const statsDiv = document.createElement('div');
    statsDiv.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;';
    
    const loadedLabel = document.createElement('span');
    loadedLabel.textContent = 'Loaded: ';
    const loadedCount = document.createElement('span');
    loadedCount.textContent = '0';
    loadedCount.style.cssText = 'font-weight: bold; color: #4CAF50;';
    loadedLabel.appendChild(loadedCount);

    const progressLabel = document.createElement('span');
    progressLabel.textContent = 'Progress: ';
    const progressCount = document.createElement('span');
    progressCount.textContent = '0%';
    progressCount.style.cssText = 'font-weight: bold; color: #2196F3;';
    progressLabel.appendChild(progressCount);

    statsDiv.appendChild(loadedLabel);
    statsDiv.appendChild(progressLabel);

    // Progress Bar Background
    const progressBg = document.createElement('div');
    progressBg.style.cssText = 'width: 100%; height: 8px; background: #444; border-radius: 4px; overflow: hidden; margin-bottom: 15px;';
    
    // Progress Bar Fill
    const progressFill = document.createElement('div');
    progressFill.style.cssText = 'width: 0%; height: 100%; background: #2196F3; transition: width 0.3s ease;';
    progressBg.appendChild(progressFill);

    // Action Button
    const actionBtn = document.createElement('button');
    actionBtn.textContent = '🚀 Start Auto-Extraction';
    actionBtn.style.cssText = 'width: 100%; padding: 12px; background: #065fd4; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px; transition: background 0.2s;';

    dashboard.appendChild(h3);
    dashboard.appendChild(statusText);
    dashboard.appendChild(statsDiv);
    dashboard.appendChild(progressBg);
    dashboard.appendChild(actionBtn);
    document.body.appendChild(dashboard);

    // Logic Variables
    let isRunning = false;
    let shouldAbort = false;
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Toggle Dashboard
    toggleBtn.addEventListener('click', () => {
        dashboard.style.display = dashboard.style.display === 'none' ? 'block' : 'none';
        if (dashboard.style.display === 'block') {
            updateLoadedCount();
        }
    });

    const updateLoadedCount = () => {
        const count = document.querySelectorAll('ytd-comment-view-model, ytd-comment-renderer').length;
        loadedCount.textContent = count;
        return count;
    };

    const setProgress = (percent) => {
        percent = Math.max(0, Math.min(100, percent));
        progressFill.style.width = percent + '%';
        progressCount.textContent = Math.floor(percent) + '%';
    };

    const setStatus = (text, color = '#aaaaaa') => {
        statusText.textContent = 'Status: ' + text;
        statusText.style.color = color;
    };

    // Main 1-Click Logic
    actionBtn.addEventListener('click', async () => {
        if (isRunning) {
            shouldAbort = true;
            actionBtn.textContent = 'Stopping...';
            actionBtn.style.background = '#606060';
            return;
        }

        isRunning = true;
        shouldAbort = false;
        actionBtn.textContent = '🛑 Stop Extraction';
        actionBtn.style.background = '#cc0000';
        setProgress(0);

        // Try to find the target total comments
        let targetTotal = 150; // default guess
        try {
            const headerCount = document.querySelector('ytd-comments-header-renderer #count yt-formatted-string, ytd-comments-header-renderer .count-text');
            if (headerCount) {
                const parsed = parseInt(headerCount.innerText.replace(/[^0-9]/g, ''));
                if (!isNaN(parsed) && parsed > 0) targetTotal = parsed;
            }
        } catch (e) {}

        // --- STEP 1: SCROLLING ---
        setStatus('Scrolling to load comments...', '#e6a800');
        let lastLoadedCount = 0;
        let idleTime = 0;

        while (!shouldAbort) {
            const threads = document.querySelectorAll('ytd-comment-thread-renderer');
            if (threads.length > 0) {
                threads[threads.length - 1].scrollIntoView({ behavior: 'auto', block: 'center' });
            } else {
                window.scrollTo(0, 1000);
            }
            
            let loaded = updateLoadedCount();
            
            // Map scroll progress roughly to 0-50%
            let scrollProgress = Math.min(50, (loaded / targetTotal) * 50);
            setProgress(scrollProgress);

            if (loaded === lastLoadedCount && loaded > 0) {
                idleTime += 250;
                if (idleTime >= 6000) {
                    break; // Reached bottom
                }
            } else {
                idleTime = 0;
                lastLoadedCount = loaded;
            }
            await wait(250);
        }

        if (shouldAbort) return resetUI('Aborted by user.');

        // --- STEP 2: EXPANDING REPLIES & READ MORE ---
        setStatus('Expanding hidden replies...', '#e6a800');
        let clickedAnything = true;
        let attempts = 0;
        const maxAttempts = 40;

        while (clickedAnything && attempts < maxAttempts && !shouldAbort) {
            clickedAnything = false;
            attempts++;

            // 1. Expand standard collapsed replies (using Polymer method or click fallback)
            document.querySelectorAll('ytd-comment-replies-renderer').forEach(replies => {
                const collapsed = replies.querySelector('#collapsed-threads');
                if (collapsed && !collapsed.hasAttribute('hidden')) {
                    if (typeof replies.handleIsShowMoreTap === 'function') {
                        replies.handleIsShowMoreTap();
                        clickedAnything = true;
                    } else {
                        const btn = replies.querySelector('#more-replies-sub-thread button, #more-replies button');
                        if (btn && btn.offsetWidth > 0 && btn.offsetHeight > 0) {
                            btn.click();
                            clickedAnything = true;
                        }
                    }
                }
            });

            // 2. Load more replies for deep threads (using Polymer continuation method)
            document.querySelectorAll('ytd-comment-replies-renderer ytd-continuation-item-renderer').forEach(c => {
                if (typeof c.triggerContinuation === 'function') {
                    c.triggerContinuation();
                    clickedAnything = true;
                } else if (typeof c.onVisible === 'function') {
                    c.onVisible();
                    clickedAnything = true;
                } else {
                    const btn = c.querySelector('button');
                    if (btn && btn.offsetWidth > 0 && btn.offsetHeight > 0 && !btn.closest('[hidden]')) {
                        btn.click();
                        clickedAnything = true;
                    }
                }
            });

            // 3. Expand truncated text (Read more)
            document.querySelectorAll('ytd-text-inline-expander #more, #expander #more').forEach(btn => {
                if (btn.offsetWidth > 0 && btn.offsetHeight > 0 && !btn.closest('[hidden]')) {
                    btn.click();
                }
            });

            let loaded = updateLoadedCount();
            let expandProgress = 50 + Math.min(40, (attempts / maxAttempts) * 40);
            setProgress(expandProgress);

            if (clickedAnything) await wait(1000); // Wait 1 second for fetch responses
        }

        if (shouldAbort) return resetUI('Aborted by user.');

        // --- STEP 3: EXTRACTION ---
        setStatus('Extracting data...', '#e6a800');
        setProgress(95);
        await wait(500);

        const commentElements = document.querySelectorAll('ytd-comment-view-model, ytd-comment-renderer');
        let extractedData = [];
        let seenIds = new Set();
        
        commentElements.forEach(commentEl => {
            const authorEl = commentEl.querySelector('#author-text');
            const textEl = commentEl.querySelector('#content-text');
            
            if (authorEl && textEl) {
                const author = authorEl.innerText.trim();
                const text = textEl.innerText.trim();
                
                const uniqueId = author + "||" + text;
                if (!seenIds.has(uniqueId)) {
                    seenIds.add(uniqueId);
                    extractedData.push(`Author: ${author}\nComment:\n${text}\n---------------------------------------------------`);
                }
            }
        });
        
        if (extractedData.length === 0) {
            return resetUI('Error: No comments found!');
        }

        // --- STEP 4: DOWNLOAD ---
        setStatus('Downloading file...', '#4CAF50');
        setProgress(100);

        const fileContent = `YouTube Comments Extraction\nVideo URL: ${window.location.href}\nTotal Comments Extracted: ${extractedData.length}\n\n===================================================\n\n` + extractedData.join('\n\n');
        const textBlob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(textBlob);
        const a = document.createElement('a');
        a.href = url;
        let videoTitle = document.title.replace(/[\\/:*?"<>|]/g, '');
        a.download = `youtube_comments_${videoTitle}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        resetUI('Finished! Check your downloads.', '#4CAF50');
        updateLoadedCount();
    });

    function resetUI(finalStatus, color = '#aaaaaa') {
        isRunning = false;
        shouldAbort = false;
        actionBtn.textContent = '🚀 Start Auto-Extraction';
        actionBtn.style.background = '#065fd4';
        setStatus(finalStatus, color);
    }

    console.log("%c YouTube Comment Extractor Injected! Click '🛠️ Auto-Extractor' button.", "color: green; font-size: 14px; font-weight: bold;");
})();
