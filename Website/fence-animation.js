window.addEventListener("scroll", function () {
  const fenceDiv = document.getElementById("fence-div");
  const fence1 = document.getElementById("fence1");
  const fence2 = document.getElementById("fence2");

  const rect = fenceDiv.getBoundingClientRect();
  const windowHeight = window.innerHeight;

// How much of #fence-div is visible in the viewport (from 0 to 1)
  const progress = 1 - Math.max(0, Math.min(1, rect.top / windowHeight));

  const maxTranslate = 200; // max translation in pixels
  const translateX = progress * maxTranslate;

  fence1.style.transform = `translateX(-${translateX}px)`;
  fence2.style.transform = `translateX(${translateX}px)`;
});
