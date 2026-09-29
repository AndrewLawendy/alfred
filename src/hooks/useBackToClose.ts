import { useEffect, useLayoutEffect, useRef } from "react";

import { layerDepth, pushLayer } from "utils/history";

// While `isOpen`, the layer owns a history entry: Back (gesture, button or
// browser) calls `onClose`, and closing it any other way removes the entry.
const useBackToClose = (isOpen: boolean, onClose: () => void) => {
  // The latest onClose, for the popstate listener set up below
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return;

    const depth = pushLayer();
    let poppedByBack = false;
    const onPopState = () => {
      if (layerDepth() < depth) {
        poppedByBack = true;
        onCloseRef.current();
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // Closed from the UI (button, swipe, tap outside): drop our entry
      if (!poppedByBack && layerDepth() === depth) window.history.back();
    };
  }, [isOpen]);
};

export default useBackToClose;
