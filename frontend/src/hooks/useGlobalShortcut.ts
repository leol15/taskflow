import { useEffect } from "react";

export function useGlobalShortcut(key: string, callback: () => void, requireCtrl: boolean = true) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is already typing in an input (except if requireCtrl is true)
      if (!requireCtrl && e.target instanceof HTMLInputElement && e.target.type === "text") {
        return; // Let people type isolated keys if not requiring Ctrl
      }
      
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const hasModifier = isMac ? e.metaKey : e.ctrlKey;
      
      if ((requireCtrl ? hasModifier : true) && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, requireCtrl]);
}
