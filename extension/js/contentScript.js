console.log("Loading LCARS...")

let lastProcessedContent = ""; // Global variable to store the last processed content

function main() {
    // Create the overlay element
    const overlay = document.createElement('div');
    overlay.setAttribute('id', 'myExtensionOverlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)'; // Semi-transparent black background
    overlay.style.zIndex = '10000'; // High z-index to cover other elements
    overlay.style.display = 'none'; // Start hidden
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    console.log("Setting overlay...")
    // Create the iframe within the overlay
    const iframe = document.createElement('iframe');
    iframe.style.width = '80%'; // 80% of the viewport width
    iframe.style.height = '80%'; // 80% of the viewport height
    iframe.style.borderRadius = '10px'; // Optional: rounded corners
    iframe.style.border = 'none'; // No border for a cleaner look

    // Append the iframe to the overlay
    overlay.appendChild(iframe);
    // Append two buttons on the top left corner of the overlay, one to go back and one forward.
    const backButton = document.createElement('button');
    backButton.style.position = 'absolute';
    backButton.style.top = '0';
    backButton.style.left = '0';
    backButton.style.width = '50px';
    backButton.style.height = '50px';
    backButton.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    backButton.style.color = 'white';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '50%';
    backButton.style.fontSize = '24px';
    backButton.style.cursor = 'pointer';
    backButton.textContent = '⬅️'
    backButton.addEventListener('click', function() {
        // Will add features for history to go back and forward later
    });
    overlay.appendChild(backButton);
        
    const forwardButton = document.createElement('button');
    forwardButton.style.position = 'absolute';
    forwardButton.style.top = '0';
    forwardButton.style.left = '50px';
    forwardButton.style.width = '50px';
    forwardButton.style.height = '50px';
    forwardButton.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    forwardButton.style.color = 'white';
    forwardButton.style.border = 'none';
    forwardButton.style.borderRadius = '50%';
    forwardButton.style.fontSize = '24px';
    forwardButton.style.cursor = 'pointer';
    forwardButton.textContent = '➡️'
    forwardButton.addEventListener('click', function() {
        // Will add features for history to go back and forward later
    });
    overlay.appendChild(forwardButton);

    // Append a button to set the textarea as active
    const button = document.createElement('button');
    button.style.position = 'absolute';
    button.style.top = '0';
    button.style.right = '0';
    button.style.width = '50px';
    button.style.height = '50px';
    button.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '50%';
    button.style.fontSize = '24px';
    button.style.cursor = 'pointer';
    button.textContent = '🗨️'
    button.addEventListener('click', function() {
        const chat = document.querySelector('#prompt-textarea');
        if (chat) {
            // Increase the opacity of the overlay
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            // Set focus on the text area
            chat.focus();
        }
    });
    overlay.appendChild(button);
    // Append the overlay to the body of the document
    document.body.appendChild(overlay);

    function showOverlayWithContent(htmlContent) {
        if (htmlContent.startsWith('<!doctype html>') && htmlContent.endsWith('</html>')) {
            // Set the HTML content directly to srcdoc
            iframe.srcdoc = htmlContent;

            // Add an event listener to handle when the iframe is loaded
            iframe.onload = function() {
                // Access the iframe's document
                let doc = iframe.contentDocument || iframe.contentWindow.document;

                // Inject CSS
                let link = doc.createElement('link');
                link.rel = 'stylesheet';
                link.href = chrome.runtime.getURL('css/lcars.css');
                doc.head.appendChild(link);

                // Inject JavaScript
                let script = doc.createElement('script');
                script.src = chrome.runtime.getURL('js/htmx.js');
                script.defer = true;
                doc.head.appendChild(script);

                // Add an on click to all divs with gpt-get attribute
                let divs = doc.querySelectorAll('div[gpt-get]');
                console.log("Adding click events to " + divs.length + " divs.");
                divs.forEach((div) => {
                    div.addEventListener('click', function(event) {
                        console.log("Clicked on " + div.getAttribute('gpt-get'));
                        // Grab the submission form text area and submit button
                        const textarea = document.querySelector('#prompt-textarea');
                        const submitButton = document.querySelector('button[data-testid="send-button"]');
                        route = div.getAttribute('gpt-get').trim();
                        target = div.getAttribute('gpt-target').trim();
                        // Make sure the button is enabled
                        submitButton.disabled = false;
                        // Set focus on text area and set the value to the route
                        textarea.focus();
                        prompt = route + " " + target.substring(1);
                        function simulateClick(targetElement) {
                            const clickEvent = new MouseEvent('click', {
                                view: window,
                                bubbles: true,
                                cancelable: true
                            });
                            targetElement.dispatchEvent(clickEvent);
                        }
                        function simulateTyping(targetElement, text) {
                            const focusEvent = new Event('focus', { bubbles: true });
                            const inputEvent = new InputEvent('input', {
                                inputType: 'insertText',
                                data: text,
                                bubbles: true,
                                cancelable: true
                            });
                        
                            targetElement.dispatchEvent(focusEvent);
                            targetElement.value += text;  // Directly set the value if event dispatch doesn't do it
                            targetElement.dispatchEvent(inputEvent);
                        }
                        function simulateEnter(targetElement) {
                            const enterEvent = new KeyboardEvent('keydown', {
                                key: 'Enter',
                                keyCode: 13,
                                code: 'Enter',
                                bubbles: true,
                                cancelable: true
                            });
                            targetElement.dispatchEvent(enterEvent);
                        }
                        simulateTyping(textarea, prompt);
                        simulateEnter(textarea);                                                                       
                    });
                });

            };

            // Make the overlay visible
            overlay.style.display = 'flex';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';

        } else {
            console.log("Decoded HTML is invalid or incomplete.");
        }
    }


    // Function to hide the overlay
    function hideOverlay() {
        overlay.style.display = 'none'; // Hide the overlay
    }

    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            overlay.style.display = 'flex';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
        }
    });

    function checkForAppOrBlock(find_last = false) {
        // We assume any change might affect the last message, so we check it after any mutation
        const messages = document.querySelectorAll('div[data-message-author-role="assistant"]');
        let loc = messages.length - 1;
        lastMessage = messages[loc];  // Get the most recent assistant message
        repeat = true;
        console.log(find_last);
        while (lastMessage && repeat) {
            // Use a parser to decode and check HTML content
            const parser = new DOMParser();
            const doc = parser.parseFromString(lastMessage.innerHTML, 'text/html');
            const decodedHtml = doc.documentElement.textContent.trim();
            // Check if the content starts with <!doctype html> and ends with </html> and is not the same as last processed
            if (decodedHtml.startsWith('<!doctype html>') && decodedHtml.endsWith('</html>') && decodedHtml !== lastProcessedContent) {
                console.log("App Validated. Loading...");
                lastProcessedContent = decodedHtml;  // Update last processed content

                // Your function to handle valid and new content, e.g., show in overlay
                showOverlayWithContent(decodedHtml); 
                repeat = false;
            } else if (decodedHtml.startsWith("GPT-TARGET=") && decodedHtml.endsWith("<--END-->") && decodedHtml !== lastProcessedContent && !find_last) {
                lastProcessedContent = decodedHtml;
               // Extract the target which should be anything preceeding the first tag, and separate it from the content
                let target = decodedHtml.substring(11, decodedHtml.indexOf('<'));
                console.log("Block Validated. Loading..." + target);
                let content = decodedHtml.substring(decodedHtml.indexOf('<'), decodedHtml.length - 10);
                // Remove the <!--END--> tag from the end of content.
                content = content.substring(0, content.length - 10);
                
                // Inject the new block into the div with the target
                let doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc) {
                    // Get the div with id target
                    const targetDiv = doc.getElementById(target);
                    if (targetDiv) {
                        targetDiv.innerHTML = content;
                        // Make sure overlay is visible
                        overlay.style.display = 'flex';
                        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
                    } else {
                        console.log("Block target not found.");
                    }
                }
                repeat = false;
            } else {
                if (find_last && loc > 0) {
                    loc = loc - 1;
                    lastMessage = messages[loc];
                } else {
                    repeat = false;
                }
                
            }
        }
    }

    first = true;
    const observer = new MutationObserver(mutations => {
        // Iterate over each mutation
        mutations.forEach(mutation => {
          if (first) {
            const messages = document.querySelectorAll('div[data-message-author-role="assistant"]');
            if (messages.length > 0) {
                first = false;
                checkForAppOrBlock(true);
            }
          } else {
            checkForAppOrBlock();
          }
        });
    });


    // Configuration to observe more broadly
    const config = { childList: true, subtree: true, characterData: false };

    // Observing the body or a larger part of the document
    observer.observe(document.body, config); // You might adjust this to a specific container if possible
}

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();  // DOMContentLoaded has already fired
}
