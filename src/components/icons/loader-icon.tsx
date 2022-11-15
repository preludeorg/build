const LoaderIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="url(#paint0_angular_277_764)"
        strokeWidth="2"
      />
      <defs>
        <radialGradient
          id="paint0_angular_277_764"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(12 17) rotate(-84.8056) scale(5.52268)"
        >
          <stop stopColor="#232323" />
          <stop offset="0.0001" stopColor="white" />
          <stop offset="0.623581" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export default LoaderIcon;
