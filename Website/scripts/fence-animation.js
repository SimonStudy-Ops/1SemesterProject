// Listen for when the user scrolls the page
window.addEventListener("scroll", function () {
    // Get references to the fence container, both fences, and the chicken
    const fenceDiv = document.getElementById("fence-div");
    const fence1 = document.getElementById("fence1");
    const fence2 = document.getElementById("fence2");
    const chicken2 = document.getElementById("chicken2");

    // Get the position of the fence container relative to the viewport
    const rect = fenceDiv.getBoundingClientRect();

    // Get the height of the browser window
    const windowHeight = window.innerHeight;

    // Calculate how far the fence container has scrolled into view
    // "progress" goes from 0 (not visible) to 1 (fully in view)
    const progress = 1 - Math.max(0, Math.min(1, rect.top / windowHeight));

    // Set how far the fences should move (in pixels)
    const maxTranslate = 200;

    // Move the left fence to the left and the right fence to the right
    // The more the user scrolls, the more the fences move apart
    fence1.style.transform = `translate(-${progress * maxTranslate}px)`;
    fence2.style.transform = `translate(${progress * maxTranslate}px)`;

    // If the fences are at least 65% open, show the chicken
    if (progress >= 0.65) {
        // Make the chicken fully visible and scale it to normal size
        chicken2.style.opacity = "1";
        chicken2.style.transform = "translate(-50%, -50%) scale(1)";
    } else {
        // Otherwise, hide the chicken and make it smaller
        chicken2.style.opacity = "0";
        chicken2.style.transform = "translate(-50%, -50%) scale(0.8)";
    }
});
