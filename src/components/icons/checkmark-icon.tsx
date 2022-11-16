const CheckmarkIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6.66674 10.1148L12.7947 3.98608L13.7381 4.92875L6.66674 12.0001L2.42407 7.75742L3.36674 6.81475L6.66674 10.1148Z" />
    </svg>
  );
};

export default CheckmarkIcon;
