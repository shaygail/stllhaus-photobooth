/**
 * Visible while the dynamic segment loads — no Tailwind required for first paint.
 */
export default function DigitalKeepsakeLoading() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100dvh",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ece8e3",
        color: "#57534e",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 15,
        padding: 24,
        textAlign: "center",
      }}
    >
      Loading your keepsake…
    </div>
  );
}
