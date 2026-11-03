/** Decorative corner marks (shadcn-style blueprint frame) */
export function FrameCorners() {
  const corner =
    "absolute h-4 w-4 border-white/20 before:absolute before:h-px before:w-2 before:bg-white/20 after:absolute after:h-2 after:w-px after:bg-white/20";
  return (
    <>
      <span className={`${corner} left-0 top-0 border-l border-t before:left-0 before:top-0 after:left-0 after:top-0`} />
      <span className={`${corner} right-0 top-0 border-r border-t before:right-0 before:top-0 after:right-0 after:top-0`} />
      <span className={`${corner} bottom-0 left-0 border-b border-l before:bottom-0 before:left-0 after:bottom-0 after:left-0`} />
      <span className={`${corner} bottom-0 right-0 border-b border-r before:bottom-0 before:right-0 after:bottom-0 after:right-0`} />
    </>
  );
}
