import React, { createContext, useContext, useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

interface MapsContextValue {
  hasMapsKey: boolean;
  isLoadingKey: boolean;
  apiKey: string;
}

const MapsAvailabilityContext = createContext<MapsContextValue>({
  hasMapsKey: false,
  isLoadingKey: true,
  apiKey: '',
});

export const useMapsAvailability = () => useContext(MapsAvailabilityContext);

export const MapsProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';
  const [apiKey, setApiKey] = useState<string>(envKey);
  const [isLoadingKey, setIsLoadingKey] = useState<boolean>(!envKey);

  useEffect(() => {
    if (envKey) {
      setApiKey(envKey);
      setIsLoadingKey(false);
      return;
    }

    let cancelled = false;
    fetch('/api/maps/config')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.apiKey) {
          setApiKey(data.apiKey);
        }
      })
      .catch(() => {
        // Silent fallback if config endpoint unreachable
      })
      .finally(() => {
        if (!cancelled) setIsLoadingKey(false);
      });

    return () => {
      cancelled = true;
    };
  }, [envKey]);

  const hasMapsKey = Boolean(apiKey && apiKey !== 'MY_GOOGLE_MAPS_API_KEY');

  return (
    <MapsAvailabilityContext.Provider value={{ hasMapsKey, isLoadingKey, apiKey }}>
      {hasMapsKey ? (
        <APIProvider
          apiKey={apiKey}
          language="id"
          region="ID"
          libraries={['marker', 'routes', 'places']}
        >
          {children}
        </APIProvider>
      ) : (
        children
      )}
    </MapsAvailabilityContext.Provider>
  );
};
