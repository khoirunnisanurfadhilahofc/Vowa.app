import React, { useEffect, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Loader2 } from 'lucide-react';
import { useMapsAvailability } from './MapsProviderWrapper';

interface PlaceAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (placeData: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const AutocompleteWithSdk: React.FC<PlaceAutocompleteInputProps> = ({
  value,
  onChange,
  onPlaceSelected,
  placeholder,
  required,
  className,
}) => {
  const placesLib = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const skipNextFetchRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!placesLib) return;

    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }

        setIsLoading(true);
        const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['id'],
          language: 'id',
        });

        setSuggestions(res?.suggestions || []);
        setShowDropdown((res?.suggestions || []).length > 0);
      } catch (err: any) {
        const msg = String(err?.message || err || '');
        if (
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('429')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 320);

    return () => clearTimeout(timeout);
  }, [placesLib, value]);

  const handleSelectSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!placesLib || !suggestion.placePrediction) return;

    const label = suggestion.placePrediction.text.text;
    skipNextFetchRef.current = true;
    onChange(label);
    setShowDropdown(false);

    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });

      const loc = place.location;
      if (loc && onPlaceSelected) {
        onPlaceSelected({
          address: place.formattedAddress || place.displayName || label,
          lat: loc.lat(),
          lng: loc.lng(),
        });
      }
    } catch (err: any) {
      const msg = String(err?.message || err || '');
      if (
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('OVER_QUERY_LIMIT') ||
        msg.includes('429')
      ) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
    } finally {
      sessionTokenRef.current = null;
      setSuggestions([]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value.trim().length >= 3) {
              setShowDropdown(true);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          className={className}
        />
        {isLoading && (
          <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg max-h-52 overflow-y-auto divide-y divide-stone-100">
          {suggestions.map((suggestion, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-3 py-2.5 text-left text-xs text-stone-800 hover:bg-rose-50 hover:text-rose-950 flex items-start gap-2 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{suggestion.placePrediction?.text.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const PlaceAutocompleteInput: React.FC<PlaceAutocompleteInputProps> = (props) => {
  const { hasMapsKey } = useMapsAvailability();

  if (!hasMapsKey) {
    return (
      <input
        type="text"
        required={props.required}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className={props.className}
      />
    );
  }

  return <AutocompleteWithSdk {...props} />;
};
