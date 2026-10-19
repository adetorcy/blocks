// Score, lines or level, padded to 3 digits
export default function Stat({ label, value }) {
  return (
    <div>
      <div>{label}</div>
      <div className="digits">{String(value).padStart(3, "0")}</div>
    </div>
  );
}
