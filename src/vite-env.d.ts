/// <reference types="vite/client" />

declare module "react-dom/client" {
  import { ReactElement } from "react";
  export function createRoot(container: Element | DocumentFragment): {
    render(element: ReactElement): void;
    unmount(): void;
  };
}
