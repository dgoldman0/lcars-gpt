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

    function checkForApp() {
      // We assume any change might affect the last message, so we check it after any mutation
      const messages = document.querySelectorAll('div[data-message-author-role="assistant"]');
      const lastMessage = messages[messages.length - 1];  // Get the most recent assistant message

      if (lastMessage) {
          console.log("Processing...")
          // Use a parser to decode and check HTML content
          const parser = new DOMParser();
          const doc = parser.parseFromString(lastMessage.innerHTML, 'text/html');
          const decodedHtml = doc.documentElement.textContent.trim();
          // Check if the content starts with <!doctype html> and ends with </html> and is not the same as last processed
          if (decodedHtml.startsWith('<!doctype html>') && decodedHtml.endsWith('</html>') && decodedHtml !== lastProcessedContent) {
              console.log("App Validated. Loading...");
              console.log(decodedHtml);
              lastProcessedContent = decodedHtml;  // Update last processed content

              // Your function to handle valid and new content, e.g., show in overlay
              showOverlayWithContent(decodedHtml);  // Assuming this function handles the display logic
          }
      }
    }
    const observer = new MutationObserver(mutations => {
        // Iterate over each mutation
        mutations.forEach(mutation => {
          checkForApp();
        });
    });


    // Configuration to observe more broadly
    const config = { childList: true, subtree: true, characterData: false };

    // Observing the body or a larger part of the document
    observer.observe(document.body, config); // You might adjust this to a specific container if possible

    // Run initial check for existing app.
    checkForApp();

}

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();  // DOMContentLoaded has already fired
}
