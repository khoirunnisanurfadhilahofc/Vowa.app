import React from 'react';

interface VowaLogoProps {
  variant?: 'icon' | 'horizontal' | 'full' | 'wordmark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const VowaLogo: React.FC<VowaLogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
}) => {
  // Dimension tokens
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  }[size];

  // SVG Icon Subcomponent
  const IconSvg = () => (
    <svg
      viewBox="0 0 400 400"
      className={`${iconDimensions} shrink-0 drop-shadow-sm select-none`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vowaIconBg" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        <linearGradient id="vowaWingGradInner" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#EDE9FE" />
          <stop offset="100%" stopColor="#DDD6FE" />
        </linearGradient>

        <linearGradient id="vowaWingRightGradInner" x1="0.5" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5F3FF" />
          <stop offset="70%" stopColor="#DDD6FE" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>
      </defs>

      {/* Squircle Background */}
      <rect width="400" height="400" rx="92" fill="url(#vowaIconBg)" />
      {/* Subtle border highlight */}
      <rect x="6" y="6" width="388" height="388" rx="88" fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="3" />

      {/* Head */}
      <circle cx="200" cy="132" r="32" fill="#FFFFFF" />

      {/* Torso */}
      <path
        d="M 180,174 C 180,165 220,165 220,174 L 226,220 C 226,226 174,226 174,220 Z"
        fill="#DDD6FE"
      />

      {/* Sound / Voice Waves */}
      <path
        d="M 244,114 C 253,124 253,140 244,150"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 264,98 C 280,114 280,150 264,166"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* Right Wing Layer (Behind) */}
      <path
        d="M 200,296 C 230,296 265,260 286,220 C 298,198 290,175 272,175 C 255,175 240,192 230,210 C 220,230 205,255 190,265 Z"
        fill="url(#vowaWingRightGradInner)"
      />

      {/* Main Protective Embracing V-Shape */}
      <path
        d="M 132,112 C 148,102 166,112 174,130 L 192,185 C 200,215 210,240 200,270 C 192,295 180,305 162,305 C 142,305 125,285 110,250 L 84,188 C 75,166 78,142 94,124 C 104,112 118,105 132,112 Z"
        fill="url(#vowaWingGradInner)"
      />

      {/* Right Upward Hand of V */}
      <path
        d="M 160,302 C 178,304 200,292 220,272 L 285,188 C 298,172 316,170 326,184 C 336,198 332,218 318,236 L 242,316 C 214,342 172,342 144,318 L 138,312 C 146,307 153,304 160,302 Z"
        fill="url(#vowaWingGradInner)"
      />
    </svg>
  );

  // Stylized VOWA Wordmark
  const WordmarkSvg = ({ textColor = '#3B0764' }: { textColor?: string }) => (
    <svg
      viewBox="0 0 540 120"
      className="h-7 w-auto select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill={textColor}>
        {/* V */}
        <path d="M 0,16 C 0,7 8,0 18,0 C 26,0 32,5 35,13 L 58,74 L 81,13 C 84,5 90,0 98,0 C 108,0 116,7 116,16 C 116,21 114,25 112,31 L 76,108 C 72,117 65,120 58,120 C 51,120 44,117 40,108 L 4,31 C 2,25 0,21 0,16 Z" />

        {/* O as Speech Bubble */}
        <g transform="translate(130, 0)">
          <path d="M 58,0 C 90,0 116,26 116,58 C 116,90 90,116 58,116 C 46,116 35,112 26,106 L 10,116 C 6,118 1,116 2,111 L 5,92 C 2,82 0,70 0,58 C 0,26 26,0 58,0 Z" />
          <circle cx="58" cy="58" r="37" fill="#FFFFFF" />
          {/* Three dots */}
          <circle cx="41" cy="58" r="6" fill="#7C3AED" />
          <circle cx="58" cy="58" r="6" fill="#7C3AED" />
          <circle cx="75" cy="58" r="6" fill="#7C3AED" />
        </g>

        {/* W */}
        <g transform="translate(260, 0)">
          <path d="M 0,16 C 0,7 8,0 17,0 C 25,0 31,4 34,12 L 52,64 L 70,13 C 73,5 78,0 86,0 C 94,0 99,5 102,13 L 120,64 L 138,12 C 141,4 147,0 155,0 C 164,0 172,7 172,16 C 172,20 170,25 168,31 L 139,107 C 135,116 128,120 119,120 C 112,120 105,115 102,107 L 86,63 L 70,107 C 67,115 60,120 53,120 C 44,120 37,116 33,107 L 4,31 C 2,25 0,20 0,16 Z" />
        </g>

        {/* A (Chevron without crossbar) */}
        <g transform="translate(442, -5)">
          <path d="M 44,4 C 50,-2 58,-2 64,4 L 105,103 C 107,108 108,113 108,117 C 108,126 100,133 90,133 C 83,133 77,129 74,121 L 54,72 L 34,121 C 31,129 25,133 18,133 C 8,133 0,126 0,117 C 0,113 1,108 3,103 Z" />
        </g>
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return <IconSvg />;
  }

  if (variant === 'wordmark') {
    return <WordmarkSvg />;
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="w-24 h-24 mb-3">
          <IconSvg />
        </div>
        <div className="h-9 w-auto my-1">
          <WordmarkSvg textColor="#431C87" />
        </div>
        <p className="text-xs font-semibold text-purple-900 tracking-wide mt-1">
          Your Voice, Your Safety
        </p>
      </div>
    );
  }

  // Default: Horizontal lockup (Icon + VOWA Wordmark + optional tagline)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <IconSvg />
      <div className="flex flex-col justify-center">
        <div className="flex items-center">
          <WordmarkSvg textColor="#3B0764" />
        </div>
        <span className="text-[9px] font-bold text-purple-900 tracking-wide uppercase -mt-0.5">
          Your Voice, Your Safety
        </span>
      </div>
    </div>
  );
};
