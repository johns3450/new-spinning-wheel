const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spinButton');
const resultText = document.getElementById('resultText');
const claimPrize = document.getElementById('claimPrize');

let isSpinning = false;
let canSpin = true; // ✅ Allow spinning when the page loads

document.addEventListener("DOMContentLoaded", function () {
  const loadingScreen = document.getElementById("loading-screen");
  const loadingIcon = document.querySelector("#loading-screen video, dotlottie-player");

  // Add "loading" class to the body when the page starts loading
  document.body.classList.add("loading");

  // Minimum display times
  const minLoadingTime = 1800; // 2 seconds for the loading screen
  const minIconTime = 1800; // 1.5 seconds for the icon
  const startTime = performance.now();

  function hideLoader() {
      const elapsedTime = performance.now() - startTime;
      const remainingScreenTime = minLoadingTime - elapsedTime;
      const remainingIconTime = minIconTime - elapsedTime;

      // Hide the loading icon after 1.5s
      setTimeout(() => {
          if (loadingIcon) loadingIcon.style.display = "none";
      }, remainingIconTime > 0 ? remainingIconTime : 0);

      // Hide the loading screen after 2s
      setTimeout(() => {
          loadingScreen.classList.add("hidden"); // Fade out loader
          document.body.classList.remove("loading"); // Restore full opacity
          setTimeout(() => loadingScreen.style.display = "none", 400); // Fully remove loader
      }, remainingScreenTime > 0 ? remainingScreenTime : 0);
  }

  // Hide loader when everything is ready
  window.onload = hideLoader;
});

// Example: 8 segments with probabilities
const segments = [
  { label: '500', chance: 100 },
  { label: '20', chance: 0 },
  { label: '10', chance: 0 },
  { label: '200', chance: 0 },
  { label: '50', chance: 0 },
  { label: '100', chance: 0  },
  { label: '10', chance: 0  },
  { label: '50', chance: 0  }
];

let currentAngle = 0;
let startAngle = 0;
let targetAngle = 0;
let startTime = 0;
let duration = 6000; // Increase duration for a slower spin
let lastTickIndex = 0; // To track pin crossings

// ✅ Show pre-spin message before spinning
resultText.innerText = "Claim up to 500 Free Spins. No deposit required!";
resultText.style.display = "block"; // Ensure it's visible

function spinWheel() {
  if (isSpinning || !canSpin) return; // ✅ Prevent spinning until 'Claim Now' is clicked
    isSpinning = true;
    canSpin = false; // ✅ Disable further spins until reset
        // ✅ Hide pre-spin text when spin starts
        resultText.style.visibility = "none";
    resultText.innerText = "";
    claimPrize.style.display = "none";
  
    // Reset lastTickIndex if using tick logic, etc.
    lastTickIndex = Math.floor(currentAngle / (360 / segments.length));
  
    // 1) Probability-based selection
    const totalWeight = segments.reduce((sum, seg) => sum + seg.chance, 0);
    let rand = Math.random() * totalWeight;
    let cumulative = 0;
    let chosenSegment = segments[0];
    let chosenIndex = 0; // Store index of the chosen segment
    for (let i = 0; i < segments.length; i++) {
      cumulative += segments[i].chance;
      if (rand <= cumulative) {
        chosenSegment = segments[i];
        chosenIndex = i;
        break;
      }
    }
  
    // 2) Calculate rotation: each segment = 45°; offset half segment (22.5°)
    const degreesPerSegment = 360 / segments.length;
    const halfSegment = degreesPerSegment / 2;
    // For example, 3 full spins = 1080° plus the offset for the chosen segment.
    const landingAngle = 1102.5 - (chosenIndex * degreesPerSegment) - halfSegment;
    startAngle = currentAngle % 360;
    targetAngle = currentAngle + landingAngle;
  
    // Save chosenIndex in a global variable for use after the spin
    window.chosenIndexGlobal = chosenIndex;
  
    // 3) Animate spin
    startTime = null;
    requestAnimationFrame(animateSpin);
  }
  
  function animateSpin(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutCubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const angle = startAngle + ease * (targetAngle - startAngle);
    currentAngle = angle;
    wheel.style.transform = `translate(-50%, -50%) rotateX(15deg) rotate(${angle}deg)`;
  
    // Ticking logic (if any)
    const tickSpacing = 360 / segments.length;
    let currentTickIndex = Math.floor(currentAngle / tickSpacing);
    if (currentTickIndex > lastTickIndex) {
      tickTicker();
      lastTickIndex = currentTickIndex;
    }
  
    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      isSpinning = false;
      // Normalize currentAngle
      currentAngle = currentAngle % 360;
      
      // Use the stored chosen index rather than re-calculating from targetAngle.
      const finalSegment = segments[window.chosenIndexGlobal];
  
      resultText.innerText = `You've unlocked ${finalSegment.label} Free Spins & more!`;
      resultText.style.display = "block";
      spinButton.style.display = "none";
      claimPrize.style.display = "inline-block";
    }
  }  

// Trigger a tick animation on the ticker
function tickTicker() {
  const ticker = document.querySelector('.ticker');
  ticker.classList.add('tick');
  setTimeout(() => {
    ticker.classList.remove('tick');
  }, 100); // Duration of the tick animation (100ms)
}

spinButton.addEventListener('click', spinWheel);
wheel.addEventListener('click', spinWheel);
claimPrize.addEventListener('click', () => {
  window.location.href = "https://freespinking.com"; // Replace with your desired URL
});