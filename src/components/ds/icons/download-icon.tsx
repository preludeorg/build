const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8.66665 6.66667H12L7.99998 10.6667L3.99998 6.66667H7.33331V2H8.66665V6.66667ZM2.66665 12.6667H13.3333V8H14.6666V13.3333C14.6666 13.5101 14.5964 13.6797 14.4714 13.8047C14.3464 13.9298 14.1768 14 14 14H1.99998C1.82317 14 1.6536 13.9298 1.52858 13.8047C1.40355 13.6797 1.33331 13.5101 1.33331 13.3333V8H2.66665V12.6667Z" />
    </svg>
  );
};

export default DownloadIcon;
