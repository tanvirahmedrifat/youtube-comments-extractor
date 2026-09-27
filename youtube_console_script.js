/**
 * YouTube Comment Extractor
 * 
 * Instructions:
 * 1. Open the YouTube video page.
 * 2. Open Developer Tools (Right-click -> Inspect, or F12).
 * 3. Go to the "Console" tab.
 * 4. Paste this entire script into the console and press Enter.
 * 5. Do not interact with the page while it scrolls.
 * 6. A text file containing the comments will download automatically when it reaches the bottom.
 */

(async function extractYoutubeComments() {
    console.log("%cStarting comment extraction... Please wait.", "color: green; font-size: 16px; font-weight: bold;");
    console.log("The script will now scroll to the bottom of the page to load all comments.");
    
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    
    let previousHeight = 0;
    let noChangeCount = 0;
    // How many times to try scrolling without seeing a change in page height before giving up (assume bottom reached)
    const maxNoChangeCount = 5; 
    
    // 1. Scroll down until all comments are loaded
    while (noChangeCount < maxNoChangeCount) {
        window.scrollTo(0, document.documentElement.scrollHeight);
        await wait(2500); // Wait 2.5 seconds for network requests and DOM updates
        
        let newHeight = document.documentElement.scrollHeight;
        if (newHeight === previousHeight) {
            noChangeCount++;
            console.log(`Reached bottom or loading... Retrying (${noChangeCount}/${maxNoChangeCount})`);
        } else {
            noChangeCount = 0; // Reset counter if height changed
            previousHeight = newHeight;
            
            // Optionally, check how many comments have been loaded so far
            const loaded = document.querySelectorAll('ytd-comment-view-model, ytd-comment-thread-renderer').length;
            console.log(`Scrolling... Loaded approx ${loaded} comments so far.`);
        }
    }
    
    console.log("%cFinished scrolling! Extracting comments now...", "color: blue; font-size: 14px; font-weight: bold;");
    
    // 2. Extract comments
    // YouTube uses different tags dynamically, checking both main comment containers
    const commentElements = document.querySelectorAll('ytd-comment-view-model, ytd-comment-thread-renderer');
    let extractedData = [];
    
    commentElements.forEach(commentEl => {
        // Find Author
        const authorEl = commentEl.querySelector('#author-text');
        const author = authorEl ? authorEl.innerText.trim() : 'Unknown Author';
        
        // Find Text
        const textEl = commentEl.querySelector('#content-text');
        const text = textEl ? textEl.innerText.trim() : '';
        
        if (text) {
            extractedData.push(`Author: ${author}\nComment:\n${text}\n---------------------------------------------------`);
        }
    });
    
    console.log(`%cSuccessfully extracted ${extractedData.length} comments.`, "color: green; font-size: 14px; font-weight: bold;");
    
    if (extractedData.length === 0) {
        console.error("No comments were found. Make sure you are on a YouTube video page and comments are not disabled.");
        return;
    }

    // 3. Save to a text file
    const fileContent = `YouTube Comments Extraction\nVideo URL: ${window.location.href}\nTotal Comments: ${extractedData.length}\n\n===================================================\n\n` + extractedData.join('\n\n');
    
    const textBlob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(textBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    
    // Create a safe filename using the video title if possible
    let videoTitle = document.title.replace(/[\\/:*?"<>|]/g, ''); // sanitize
    downloadLink.download = `youtube_comments_${videoTitle}.txt`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    console.log("%cDownload started! Check your downloads folder.", "color: green; font-size: 14px; font-weight: bold;");
})();
