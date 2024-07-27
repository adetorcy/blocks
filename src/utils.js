// Cannot rely on autoFocus JSX param (?)
// We make our own using a ref callback
// https://react.dev/reference/react-dom/components/common#ref-callback
export const autoFocusRef = (node) => node?.focus();

export function padScore(score) {
  return score.toString().padStart(3, "0");
}

export function clearCanvas(canvas) {
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}
