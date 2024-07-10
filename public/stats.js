/**
 * Config
 */

(function () {
  if (window.rtcstats) {
    console.warn('[RTCStats] Already declared');
    return;
  }

  window.rtcstats = this;

  const _config = Object.assign(
    { interval: 1, writeInterval: 5 },
    document.currentScript.dataset
  );

  // Master array of PeerConnections
  const pcArray = [];

  /**
   * Global Methods
   */
  async function writeBatch(batchCollection) {
    // batchCollection = array of every PeerConnection's reports (arbitrary amount)
    if (!_config.key || !_config.url) {
      return false;
    }

    const reportArray = []; // what we send to the logger

    batchCollection.forEach((b) => {
      // grab the reports and empty the array (batch is cleared)
      const reports = b.splice(0, b.length).forEach((data) =>
        reportArray.push({
          test_id: _config.testid,
          data,
        })
      );
    });

    if (!reportArray.length) {
      return;
    }

    console.info('[RTCStats] Logging data...', reportArray);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${_config.key}`,
      },
      body: JSON.stringify(reportArray),
    };
    const res = await fetch(`${_config.url}/log`, options);
  }

  /**
   * Ride or die
   */

  if (!['key', 'url', 'testid', 'clientid'].every((k) => k in _config)) {
    console.warn('[RTCStats] Missing env keys. Exiting');
  } else {
    console.info('[RTCStats] Init');
    RTCPeerConnection = new Proxy(RTCPeerConnection, {
      construct(target, args) {
        const pc = new target(...args);

        const TICK = _config.interval * 1000;

        // Init
        pc.batch = [];
        pc.reportNum = 0;
        pc.connectionId = crypto.randomUUID();

        // Append to global array
        pcArray.push(pc);

        console.warn('PeerConnection instantiated', pc);

        // Add the _getStats method to the peer connection instance
        pc._getStats = async function (getStatsPromise) {
          //@TODO try catch
          //@TODO promise failure return null...
          const stats = await getStatsPromise;
          const r = Object.fromEntries(stats.entries());

          if (!r) return;

          this.batch.push({
            clientId: _config.clientid,
            testId: _config.testid,
            region: _config.region,
            connectionId: this.connectionId,
            reportNum: this.reportNum,
            ...r,
          });
          this.reportNum += 1;
        };

        // Listen for connection state, start harvesting when connected
        pc.addEventListener('connectionstatechange', () => {
          clearInterval(pc._statsInterval);

          if (pc.connectionState === 'connected') {
            pc._getStats(pc.getStats());

            // Start collecting data every TICK...
            pc._statsInterval = setInterval(() => {
              if (pc.connectionState !== 'connected')
                return clearInterval(pc._statsInterval);

              // Yummy yummy data in my tummy
              pc._getStats(pc.getStats());
            }, TICK);
          }
        });

        return pc;
      },
    });

    // Master write interval
    setInterval(() => {
      if (!pcArray.length) {
        return;
      }
      // Create an array of every connected PeerConnections reports
      const batchCollection = pcArray
        .filter((pc) => pc.batch.length) // filter out PeerConnections with empty batches (no reports)
        .map((pc) => pc.batch); // return the batch array containing all the reports (arbitrary amount)
      if (batchCollection.length) writeBatch(batchCollection);
    }, _config.writeInterval * 1000);
  }
})();
