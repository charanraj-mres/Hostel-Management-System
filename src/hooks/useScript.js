// File: hooks/useScript.js
import { useState, useEffect } from "react";

export const useScript = (src) => {
  const [status, setStatus] = useState(src ? "loading" : "idle");

  useEffect(() => {
    if (!src) {
      setStatus("idle");
      return;
    }

    // Check if the script is already in the document
    let script = document.querySelector(`script[src="${src}"]`);

    if (!script) {
      // Create script element if it doesn't exist
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);

      // Store status in attribute on script
      const setAttributeFromEvent = (event) => {
        script.setAttribute(
          "data-status",
          event.type === "load" ? "ready" : "error"
        );
      };

      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
    } else {
      // Grab existing script status from attribute and set to state
      setStatus(script.getAttribute("data-status"));
    }

    // Script event handler to update status in state
    const setStateFromEvent = (event) => {
      setStatus(event.type === "load" ? "ready" : "error");
    };

    // Add event listeners
    script.addEventListener("load", setStateFromEvent);
    script.addEventListener("error", setStateFromEvent);

    // Remove event listeners on cleanup
    return () => {
      if (script) {
        script.removeEventListener("load", setStateFromEvent);
        script.removeEventListener("error", setStateFromEvent);
      }
    };
  }, [src]);

  return status;
};
