/**
 * Vercel Speed Insights Integration
 * This module initializes Speed Insights on the client side to monitor
 * real-world performance metrics of the application.
 */

(function initSpeedInsights() {
  // Only run on client side
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Import and initialize Speed Insights
    import('@vercel/speed-insights').then(({ injectSpeedInsights }) => {
      if (typeof injectSpeedInsights === 'function') {
        injectSpeedInsights();
      }
    }).catch((error) => {
      // Silently fail if module not available
      console.debug('Speed Insights initialization skipped', error);
    });
  } catch (error) {
    // Silently fail if import fails
    console.debug('Speed Insights import failed', error);
  }
})();
