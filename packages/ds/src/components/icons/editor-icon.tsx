export const EditorIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.276 9.66667L9.03733 2.90534L8.09467 1.96267L1.33333 8.72401V9.66667H2.276ZM2.82867 11H0V8.17134L7.62333 0.548005C7.74835 0.423024 7.91789 0.352814 8.09467 0.352814C8.27144 0.352814 8.44098 0.423024 8.566 0.548005L10.452 2.434C10.577 2.55902 10.6472 2.72856 10.6472 2.90534C10.6472 3.08211 10.577 3.25165 10.452 3.37667L2.82867 11ZM0 12.3333H12V13.6667H0V12.3333Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
};
