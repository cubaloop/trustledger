const http = require('http');
const https = require('https');

/**
 * 24/7 Wake-Lock Heartbeat Daemon for Render Container Anti-Sleep
 * Automatically emits an HTTP/S pulse every 6 minutes to keep container warm.
 */
function startWakeLockDaemon(targetUrl = null, intervalMs = 360000) {
  // If no external URL provided, check RENDER_EXTERNAL_URL environment variable or fallback to localhost
  const urlToPing = targetUrl || process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;
  const healthEndpoint = `${urlToPing.replace(/\/$/, '')}/healthz`;

  console.log(`[WakeLock Daemon] Initialized. Target: ${healthEndpoint} (Interval: ${intervalMs / 60000} min)`);

  const client = healthEndpoint.startsWith('https') ? https : http;

  const ping = () => {
    try {
      const req = client.get(healthEndpoint, { timeout: 10000 }, (res) => {
        console.log(`[WakeLock Pulse] Ping sent to ${healthEndpoint} -> HTTP ${res.statusCode} at ${new Date().toISOString()}`);
        res.resume(); // drain response
      });

      req.on('error', (err) => {
        // Expected when server starts or during external DNS resolution
        console.log(`[WakeLock Pulse Warning] Network ping issue: ${err.message}`);
      });

      req.on('timeout', () => {
        req.destroy();
        console.log('[WakeLock Pulse] Request timed out, destroyed cleanly.');
      });
    } catch (e) {
      console.error('[WakeLock Pulse Error]', e.message);
    }
  };

  // Initial pulse after 30 seconds
  setTimeout(ping, 30000);

  // Periodic interval
  const timer = setInterval(ping, intervalMs);
  timer.unref(); // Prevent blocking process shutdown if needed

  return timer;
}

module.exports = {
  startWakeLockDaemon
};
