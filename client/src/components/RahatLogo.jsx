/**
 * RahatLogo — official RAHAT emblem.
 * The word "RAHAT" is shown separately next to this mark.
 */
export default function RahatLogo({ size = 40 }) {
  return (
    <img
      src="/rahat-logo.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      style={{
        display: 'block',
        flexShrink: 0,
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: '50%',
      }}
    />
  );
}
