// Listen for the scroll event on the window
window.addEventListener("scroll", function () {
    // Get the fence container and the two fence elements
    const fenceDiv = document.getElementById("fence-div");
    const fence1 = document.getElementById("fence1");
    const fence2 = document.getElementById("fence2");

    // Get the position of the fence container relative to the viewport
    const rect = fenceDiv.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate progress: 0 when the element is below the viewport, 1 when it's in the middle or higher
    const progress = 1 - Math.max(0, Math.min(1, rect.top / windowHeight));

    // Set the maximum translation distance in pixels
    const maxTranslate = 200;
    // Calculate how much to move the fences based on scroll progress
    const translateX = progress * maxTranslate;

    // Move fence1 to the left and fence2 to the right
    fence1.style.transform = `translateX(-${translateX}px)`;
    fence2.style.transform = `translateX(${translateX}px)`;
});
