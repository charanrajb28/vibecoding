
"use client";

import * as React from "react";

// A simple, global Set to hold all active listener callbacks.
export const fileTreeListeners = new Set<() => void>();

/**
 * Triggers a refresh for all subscribed file tree components.
 * This should be called after any filesystem mutation (e.g., save, new file, terminal command).
 */
export function triggerFileTreeRefresh() {
  // Iterate over all registered listeners and invoke them.
  fileTreeListeners.forEach(cb => cb());
}

/**
 * A React hook that subscribes a component to the global file tree refresh event.
 * @param cb The callback function to execute when a refresh is triggered.
 */
export function useFileTreeRefresh(cb: () => void) {
  React.useEffect(() => {
    // Add the callback to the listener set when the component mounts.
    fileTreeListeners.add(cb);
    // Remove the callback from the set when the component unmounts to prevent memory leaks.
    return () => {
      fileTreeListeners.delete(cb);
    };
  }, [cb]); // Re-subscribe if the callback function instance changes.
}
