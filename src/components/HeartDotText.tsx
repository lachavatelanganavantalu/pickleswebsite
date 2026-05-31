"use client";

/**
 * Renders Latin text with ♥ replacing dots on i / j (e.g. "Homemade" → H♥omemade style).
 */
export default function HeartDotText({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((char, index) => {
        if (char === "i") {
          return (
            <span key={`${index}-i`} className="heart-dot-letter">
              ı<span className="heart-dot-mark" aria-hidden="true">♥</span>
            </span>
          );
        }
        if (char === "I") {
          return (
            <span key={`${index}-I`} className="heart-dot-letter heart-dot-letter-cap">
              I<span className="heart-dot-mark" aria-hidden="true">♥</span>
            </span>
          );
        }
        if (char === "j") {
          return (
            <span key={`${index}-j`} className="heart-dot-letter heart-dot-letter-j">
              ȷ<span className="heart-dot-mark heart-dot-mark-j" aria-hidden="true">♥</span>
            </span>
          );
        }
        if (char === "J") {
          return (
            <span key={`${index}-J`} className="heart-dot-letter heart-dot-letter-cap heart-dot-letter-j">
              J<span className="heart-dot-mark heart-dot-mark-j" aria-hidden="true">♥</span>
            </span>
          );
        }
        return <span key={`${index}-${char}`}>{char}</span>;
      })}
    </>
  );
}
