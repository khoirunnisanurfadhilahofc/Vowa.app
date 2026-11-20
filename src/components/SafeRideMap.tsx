import React, { useEffect, useRef, useState } from 'react';
import {
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { AlertTriangle, Navigation, Car, Bike } from 'lucide-react';
import { TripSession } from '../types';
import { useMapsAvailability } from './MapsProviderWrapper';

interface SafeRideMapProps {
  trip: TripSession;
  onRouteMetrics?: (metrics: { distanceKm: number; durationMinutes: number }) => void;
  onOpenFakeCall: () => void;
}

interface RoutePolylineLayerProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  originText?: string;
  destinationText?: string;
  vehicleType: TripSession['vehicleType'];
  isDeviated: boolean;
  onRouteMetrics?: (metrics: { distanceKm: number; durationMinutes: number }) => void;
}

const RoutePolylineLayer: React.FC<RoutePolylineLayerProps> = ({
  origin,
  destination,
  originText,
  destinationText,
  vehicleType,
  isDeviated,
  onRouteMetrics,
}) => {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;

    // Clean up existing polylines before computing a new route
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    let cancelled = false;
    const travelMode = vehicleType === 'Motor (Bike)' ? 'TWO_WHEELER' : 'DRIVING';
    const useOrigin =
      originText && originText.trim().length > 4 && originText !== 'Lokasi Penjemputan Anda'
        ? originText
        : origin;
    const useDest =
      destinationText && destinationText.trim().length > 4 && destinationText !== 'Titik Tujuan Anda'
        ? destinationText
        : destination;

    const request: any = {
      origin: useOrigin,
      destination: useDest,
      travelMode,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    };

    const RouteClass = (routesLib as any).Route;
    if (!RouteClass || typeof RouteClass.computeRoutes !== 'function') {
      return;
    }

    RouteClass.computeRoutes(request)
      .then((res: any) => {
        if (cancelled) return;
        const primaryRoute = res?.routes?.[0];
        if (!primaryRoute) return;

        if (typeof primaryRoute.createPolylines === 'function') {
          const newPolylines: google.maps.Polyline[] = primaryRoute.createPolylines();
          newPolylines.forEach((polyline) => {
            polyline.setOptions({
              strokeColor: isDeviated ? '#ef4444' : '#6366f1',
              strokeWeight: 6,
              strokeOpacity: 0.9,
            });
            polyline.setMap(map);
          });
          polylinesRef.current = newPolylines;
        }

        if (primaryRoute.viewport) {
          map.fitBounds(primaryRoute.viewport, 48);
        }

        if (onRouteMetrics && (primaryRoute.distanceMeters || primaryRoute.durationMillis)) {
          onRouteMetrics({
            distanceKm: Number(((primaryRoute.distanceMeters || 0) / 1000).toFixed(1)),
            durationMinutes: Math.max(1, Math.round((primaryRoute.durationMillis || 0) / 60000)),
          });
        }
      })
      .catch((err: any) => {
        const msg = String(err?.message || err || '');
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        // Fallback: fit map to known coordinates
        if (map && !cancelled) {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(origin);
          bounds.extend(destination);
          map.fitBounds(bounds, 56);
        }
      });

    return () => {
      cancelled = true;
      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [
    routesLib,
    map,
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng,
    originText,
    destinationText,
    vehicleType,
    isDeviated,
  ]);

  return null;
};

const InteractiveGoogleMapInner: React.FC<SafeRideMapProps> = ({
  trip,
  onRouteMetrics,
  onOpenFakeCall,
}) => {
  const status = useApiLoadingStatus();
  const [vehicleMarkerRef, vehicleMarker] = useAdvancedMarkerRef();
  const [pickupMarkerRef, pickupMarker] = useAdvancedMarkerRef();
  const [destMarkerRef, destMarker] = useAdvancedMarkerRef();

  const [openInfo, setOpenInfo] = useState<'vehicle' | 'pickup' | 'dest' | null>('vehicle');

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return <FallbackRadarMap trip={trip} onOpenFakeCall={onOpenFakeCall} />;
  }

  // Interpolate vehicle position along route or slightly off-route when deviated
  const progressRatio = Math.min(0.95, Math.max(0.05, trip.progressPercent / 100));
  const pickupPos = trip.coords;
  const destPos = trip.destinationCoords;
  const vehiclePos: google.maps.LatLngLiteral = {
    lat:
      pickupPos.lat +
      (destPos.lat - pickupPos.lat) * progressRatio +
      (trip.isDeviated ? -0.0085 : 0),
    lng:
      pickupPos.lng +
      (destPos.lng - pickupPos.lng) * progressRatio +
      (trip.isDeviated ? 0.0095 : 0),
  };

  return (
    <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-stone-800 bg-stone-950">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={vehiclePos}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={false}
        streetViewControl={false}
        mapTypeControl={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="w-full h-full"
      >
        <RoutePolylineLayer
          origin={pickupPos}
          destination={destPos}
          originText={trip.pickupLocation}
          destinationText={trip.destinationLocation}
          vehicleType={trip.vehicleType}
          isDeviated={trip.isDeviated}
          onRouteMetrics={onRouteMetrics}
        />

        {/* Pickup Marker */}
        <AdvancedMarker
          ref={pickupMarkerRef}
          position={pickupPos}
          title={`Titik Jemput: ${trip.pickupLocation}`}
          onClick={() => setOpenInfo(openInfo === 'pickup' ? null : 'pickup')}
        >
          <Pin background="#10b981" borderColor="#065f46" glyphColor="#ffffff" />
        </AdvancedMarker>

        {openInfo === 'pickup' && pickupMarker && (
          <InfoWindow anchor={pickupMarker} onCloseClick={() => setOpenInfo(null)}>
            <div className="p-1 text-stone-900 max-w-[200px]">
              <div className="text-[10px] font-bold uppercase text-emerald-700">Titik Jemput</div>
              <div className="text-xs font-semibold mt-0.5">{trip.pickupLocation}</div>
            </div>
          </InfoWindow>
        )}

        {/* Destination Marker */}
        <AdvancedMarker
          ref={destMarkerRef}
          position={destPos}
          title={`Titik Tujuan: ${trip.destinationLocation}`}
          onClick={() => setOpenInfo(openInfo === 'dest' ? null : 'dest')}
        >
          <Pin background="#e11d48" borderColor="#881337" glyphColor="#ffffff" />
        </AdvancedMarker>

        {openInfo === 'dest' && destMarker && (
          <InfoWindow anchor={destMarker} onCloseClick={() => setOpenInfo(null)}>
            <div className="p-1 text-stone-900 max-w-[200px]">
              <div className="text-[10px] font-bold uppercase text-rose-700">Titik Tujuan</div>
              <div className="text-xs font-semibold mt-0.5">{trip.destinationLocation}</div>
            </div>
          </InfoWindow>
        )}

        {/* Live Moving Vehicle Marker */}
        <AdvancedMarker
          ref={vehicleMarkerRef}
          position={vehiclePos}
          title={`${trip.serviceProvider} · ${trip.licensePlate}`}
          onClick={() => setOpenInfo(openInfo === 'vehicle' ? null : 'vehicle')}
        >
          <div
            className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-white transition-colors ${
              trip.isDeviated ? 'bg-red-600' : 'bg-indigo-600'
            }`}
          >
            <span
              className={`absolute inset-0 rounded-full animate-ping opacity-40 ${
                trip.isDeviated ? 'bg-red-500' : 'bg-indigo-400'
              }`}
            />
            {trip.vehicleType === 'Motor (Bike)' ? (
              <Bike className="w-5 h-5 text-white relative z-10" />
            ) : (
              <Car className="w-5 h-5 text-white relative z-10" />
            )}
          </div>
        </AdvancedMarker>

        {openInfo === 'vehicle' && vehicleMarker && (
          <InfoWindow anchor={vehicleMarker} onCloseClick={() => setOpenInfo(null)}>
            <div className="p-1 text-stone-900 min-w-[190px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase text-indigo-700">
                  {trip.serviceProvider} · {trip.licensePlate}
                </span>
                <span className="text-[10px] font-mono font-bold text-stone-600">
                  {trip.currentSpeedKmh} km/j
                </span>
              </div>
              <div className="text-xs font-bold mt-0.5">{trip.driverName}</div>
              <div
                className={`text-[11px] font-semibold mt-1 ${
                  trip.isDeviated ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {trip.isDeviated ? '⚠️ Peringatan: Jalur Menyimpang' : '✓ Jalur Aman Terpantau'}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 z-10 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700 text-[11px] flex items-center gap-2 text-white shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold">Google Maps Live</span>
        <span className="text-stone-500">·</span>
        <span className="text-stone-300 font-mono">
          {vehiclePos.lat.toFixed(4)}, {vehiclePos.lng.toFixed(4)}
        </span>
      </div>

      {/* Deviation Alert Overlay */}
      {trip.isDeviated && (
        <div className="absolute bottom-3 left-3 right-3 z-10 bg-red-950/95 border border-red-700/80 rounded-2xl p-3 text-xs text-red-200 flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="font-bold text-red-100 block">Penyimpangan Jalur Terdeteksi!</span>
              <span className="text-[11px] text-red-300">
                Kendaraan keluar dari rute utama. Tekan Panggilan Tiruan atau SOS jika merasa terancam.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenFakeCall}
            className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            Buka Fake Call
          </button>
        </div>
      )}
    </div>
  );
};

const FallbackRadarMap: React.FC<SafeRideMapProps> = ({ trip, onOpenFakeCall }) => {
  return (
    <div className="relative h-72 sm:h-80 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 rounded-2xl border border-stone-800 overflow-hidden flex items-center justify-center">
      <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 350" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
          <linearGradient id="deviatedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
        </defs>
        <path d="M 0,80 L 800,80" stroke="#262626" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 0,160 L 800,160" stroke="#262626" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 0,240 L 800,240" stroke="#262626" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 180,0 L 180,350" stroke="#262626" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 380,0 L 380,350" stroke="#262626" strokeWidth="1" strokeDasharray="4 4" />
        <path d="M 580,0 L 580,350" stroke="#262626" strokeWidth="1" strokeDasharray="4 4" />
        <path
          d="M 120,240 C 240,240 280,120 400,120 C 520,120 620,190 700,190"
          fill="none"
          stroke="#404040"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {!trip.isDeviated ? (
          <path
            d="M 120,240 C 240,240 280,120 400,120"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 120,240 C 200,240 240,160 300,170 C 340,180 350,290 440,310"
            fill="none"
            stroke="url(#deviatedGradient)"
            strokeWidth="7"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />
        )}
        <circle cx="120" cy="240" r="8" fill="#10B981" />
        <circle cx="120" cy="240" r="16" fill="#10B981" fillOpacity="0.2" />
        <circle cx="700" cy="190" r="8" fill="#F43F5E" />
        <circle cx="700" cy="190" r="16" fill="#F43F5E" fillOpacity="0.2" />
        {!trip.isDeviated ? (
          <g transform="translate(400, 120)">
            <circle cx="0" cy="0" r="16" fill="#6366F1" fillOpacity="0.3" className="animate-ping" />
            <circle cx="0" cy="0" r="10" fill="#6366F1" stroke="#FFFFFF" strokeWidth="2.5" />
          </g>
        ) : (
          <g transform="translate(440, 310)">
            <circle cx="0" cy="0" r="18" fill="#EF4444" fillOpacity="0.4" className="animate-ping" />
            <circle cx="0" cy="0" r="11" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
          </g>
        )}
      </svg>

      <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800 text-[11px] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-stone-300">Radar GPS VOWA Aktif</span>
        <span className="text-stone-500">·</span>
        <span className="text-stone-400 font-mono">
          {trip.coords.lat.toFixed(4)}, {trip.coords.lng.toFixed(4)}
        </span>
      </div>

      <a
        href={`https://www.google.com/maps/dir/?api=1&origin=${trip.coords.lat},${trip.coords.lng}&destination=${trip.destinationCoords.lat},${trip.destinationCoords.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 bg-stone-800/90 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-xl border border-stone-700 text-[11px] font-semibold flex items-center gap-1.5"
      >
        <Navigation className="w-3 h-3 text-rose-400" />
        <span>Buka di Google Maps</span>
      </a>

      {trip.isDeviated && (
        <div className="absolute bottom-3 left-3 right-3 bg-red-950/95 border border-red-700/80 rounded-2xl p-3 text-xs text-red-200 flex items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="font-bold text-red-100 block">Penyimpangan Jalur Terdeteksi!</span>
              <span className="text-[11px] text-red-300">
                Kendaraan berbelok dari rute standar. Tekan Panggilan Tiruan atau SOS jika merasa terancam.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenFakeCall}
            className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            Buka Fake Call
          </button>
        </div>
      )}
    </div>
  );
};

export const SafeRideMap: React.FC<SafeRideMapProps> = (props) => {
  const { hasMapsKey } = useMapsAvailability();
  if (!hasMapsKey) {
    return <FallbackRadarMap {...props} />;
  }
  return <InteractiveGoogleMapInner {...props} />;
};
