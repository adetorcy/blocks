// Cannot rely on autoFocus JSX param (?)
// We make our own using a ref callback
// https://react.dev/reference/react-dom/components/common#ref-callback
export const autoFocusRef = (node) => node?.focus();
