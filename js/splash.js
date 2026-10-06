// Splash Screen Animation Controller for KEC FOOD COURT

export function initSplash() {
  const splash = document.getElementById('splash-screen');
  const progressBar = document.getElementById('splash-progress-bar');
  const statusText = document.getElementById('splash-status-text');
  const skipBtn = document.getElementById('splash-skip-btn');

  if (!splash) return;

  const STATUS_MESSAGES = [
    { at: 10, text: "Firing up smart kitchen network..." },
    { at: 35, text: "Connecting Kongu Engineering College Stalls..." },
    { at: 65, text: "Syncing live digital token counters..." },
    { at: 90, text: "Food Court Ready. Welcome!" }
  ];

  let progress = 0;
  const durationMs = 3600; // 3.6 seconds total animation duration
  const intervalMs = 36;
  const step = 100 / (durationMs / intervalMs);

  let timer = setInterval(() => {
    progress += step;
    if (progress > 100) progress = 100;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Update status text
    const matched = [...STATUS_MESSAGES].reverse().find(m => progress >= m.at);
    if (matched && statusText && statusText.textContent !== matched.text) {
      statusText.textContent = matched.text;
    }

    if (progress >= 100) {
      clearInterval(timer);
      setTimeout(finishSplash, 300);
    }
  }, intervalMs);

  function finishSplash() {
    clearInterval(timer);
    splash.classList.add('hidden');
    document.body.classList.remove('splash-active');
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', finishSplash);
  }

  // Provide a function to replay splash intro
  window.replaySplashIntro = function() {
    splash.classList.remove('hidden');
    document.body.classList.add('splash-active');
    if (progressBar) progressBar.style.width = '0%';
    if (statusText) statusText.textContent = "Re-initializing KEC Food Court...";
    setTimeout(() => {
      initSplash();
    }, 100);
  };
}
