import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import Provider from 'providers/Provider';
import {
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
} from 'use-deep-compare';

export const TestContext = createContext();

const loadProvider = (provider, cb) => {
  import(`providers/${provider}`).then((res) => cb(res));
};

export const TestProvider = ({
  children,
  deviceId,
  providerConfig,
  onConclude,
  isHost,
}) => {
  const [state, setState] = useState(Provider.STATE_IDLE);
  const [participants, setParticipants] = useState([]);
  const [providerClass, setProviderClass] = useState();
  const [_config, setConfig] = useState({ ...providerConfig });
  const [statsData, setStatsData] = useState([]);
  const [isVideoDecodeReady, setIsVideoDecodeReady] = useState(false);
  const [join, setJoin] = useState(false);

  useDeepCompareEffect(() => {
    if (providerClass || !join) return;

    // reset stats
    sessionStorage.removeItem('resultData');

    // Load provider class
    loadProvider(providerConfig.provider, (res) => {
      const ProviderClass = res.default;

      console.log('👋 Provider Init');
      const providerObj = new ProviderClass(
        { ...providerConfig, isHost },
        deviceId
      );

      providerObj.addEventListener(Provider.EVENT_STATE_CHANGE, (e) => {
        console.log(`🔄 Provider state changed: ${e.data}`);
        setState(e.data);

        if (e.data === Provider.STATE_LEFT) {
          //@TODO: do final tear down, destroys etc here
          providerObj?.destroy();

          // Set data into session storage for results page
          setStatsData((s) => {
            if (s.length) {
              sessionStorage.setItem('resultData', JSON.stringify(s));
            }
            return [];
          });

          // Callback to redirect to results page
          onConclude();
        }
      });

      providerObj.addEventListener(Provider.EVENT_PARTICIPANTS_UPDATED, (e) => {
        console.log(`👋 Provider participants updated`);
        setParticipants(Object.values(e.data));
      });
      setProviderClass(providerObj);

      // Away we go...
      providerObj.join();

      providerObj.addEventListener(Provider.EVENT_STATS_UPDATE, (e) => {
        setStatsData((s) => [e.data, ...s]);
      });
    });
  }, [providerClass, deviceId, onConclude, providerConfig, join]);

  useEffect(() => {
    let timeout;
    if (providerConfig.provider === 'zoom' && providerClass) {
      providerClass.client.on('media-sdk-change', (payload) => {
        if (
          payload.type === 'video' &&
          payload.action === 'decode' &&
          payload.result === 'success'
        ) {
          timeout = setTimeout(() => setIsVideoDecodeReady(true), 1000);
        }
      });
    }
    return () => {
      if (providerConfig.provider === 'zoom' && providerClass) {
        providerClass.client.off('media-sdk-change');
        clearTimeout(timeout);
      }
    };
  }, [providerConfig.provider, providerClass]);

  /**
   * Selectors
   */
  const callState = useDeepCompareMemo(() => state, [state]);
  const config = useDeepCompareMemo(() => providerConfig, [providerConfig]);
  const participantsList = useDeepCompareMemo(
    () => participants,
    [participants]
  );
  const numParticipants = useDeepCompareMemo(
    () => participantsList.length,
    [participantsList.length]
  );

  const leave = useDeepCompareCallback(
    () => providerClass.leave(),
    [providerClass]
  );

  const destroy = useDeepCompareCallback(
    () => providerClass?.destroy(),
    [providerClass]
  );

  const joinCall = useCallback(() => setJoin(true), []);

  return (
    <TestContext.Provider
      value={{
        callState,
        config,
        leave,
        participants: participantsList,
        numParticipants,
        destroy,
        provider: providerClass,
        isVideoDecodeReady,
        joinCall,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export default TestProvider;

export const useTest = () => useContext(TestContext);
