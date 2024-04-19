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
                        textarea.value = div.getAttribute('gpt-get');
                        // Function to mimic an event more naturally
                        function triggerEvent(element, eventType) {
                            const event = new Event(eventType, {
                                bubbles: true,    // Whether the event bubbles up through the DOM
                                cancelable: true  // Whether the event can be canceled
                            });
                            element.dispatchEvent(event);
                        }

                        // Dispatch events to mimic entering text and clicking the button
                        triggerEvent(textarea, 'input');  // Mimic typing in the textarea
                        triggerEvent(textarea, 'change'); // Mimic changing the text

                        // Make sure the button is enabled
                        submitButton.disabled = false;

                        // Trigger a click event on the button
                        triggerEvent(submitButton, 'click');

                    });
                });

            };

            // Make the overlay visible
            overlay.style.display = 'flex';
        } else {
            console.log("Decoded HTML is invalid or incomplete.");
        }
    }


    // Function to hide the overlay
    function hideOverlay() {
        overlay.style.display = 'none'; // Hide the overlay
    }

    // Add a click event listener to the overlay for hiding
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            hideOverlay(); // Hide when clicking outside the iframe
        }
    });

    function checkForAppOrBlock() {
      // We assume any change might affect the last message, so we check it after any mutation
      const messages = document.querySelectorAll('div[data-message-author-role="assistant"]');
      const lastMessage = messages[messages.length - 1];  // Get the most recent assistant message

        if (lastMessage) {
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
          } else if (decodedHtml.startsWith("GPT-TARGET=") && decodedHtml.endsWith("<--END-->") && decodedHtml !== lastProcessedContent) {
              // Extract the target which is the rest of the first line, and split the remaining as the content
              lines = decodedHtml.split('\n');
              const target = lines[0].substring(10);
              const content = lines.slice(1).join('\n');
              console.log("Block Validated. Loading...");
              lastProcessed = decodedHtml;  // Update last processed content

              // Inject the new block into the div with the target
              let doc = iframe.contentDocument || iframe.contentWindow.document;
              if (doc) {
                // Get the div with id target
                const targetDiv = doc.getElementById(target);
                if (targetDiv) {
                    targetDiv.innerHTML = content;
                    } else {
                        console.log("Block target not found.");
                    }  
                }
                // Make sure overlay is visible
                overlay.style.display = 'flex';
           }
        }
    }
    const observer = new MutationObserver(mutations => {
        // Iterate over each mutation
        mutations.forEach(mutation => {
          checkForAppOrBlock();
        });
    });


    // Configuration to observe more broadly
    const config = { childList: true, subtree: true, characterData: false };

    // Observing the body or a larger part of the document
    observer.observe(document.body, config); // You might adjust this to a specific container if possible

    // Run initial check for existing app.
    checkForAppOrBlock();

}

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();  // DOMContentLoaded has already fired
}
