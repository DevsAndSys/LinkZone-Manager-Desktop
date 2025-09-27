import { useCallback } from "react";

const useExternalLinks = () => {
  const openExternalLink = useCallback(async (url) => {
    try {
      // Verificar si estamos en el entorno de Electron
      if (typeof window !== "undefined" && window.require) {
        try {
          // Usar require para acceder a ipcRenderer
          const { ipcRenderer } = window.require("electron");
          const result = await ipcRenderer.invoke("open-external-link", url);
          if (result.success) {
            return;
          } else {
            console.error("Failed to open external link:", result.error);
          }
        } catch (electronError) {
          console.error("Electron IPC error:", electronError);
        }
      }

      // Fallback: usar window.open para desarrollo o si falla IPC
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening external link:", error);
      // Último fallback
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  return { openExternalLink };
};

export default useExternalLinks;
