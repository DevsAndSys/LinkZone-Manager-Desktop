import { useCallback, useEffect, useState } from "react";

const useScheduler = () => {
  const [config, setConfig] = useState({
    enabled: false,
    turnOnTime: "08:00",
    turnOffTime: "22:00",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar configuración inicial
  const loadConfig = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && window.require) {
        const { ipcRenderer } = window.require("electron");
        const result = await ipcRenderer.invoke("get-scheduler-config");
        if (result.success) {
          setConfig(result.config);
          setIsInitialized(true);
        }
      }
    } catch (error) {
      console.error("Error loading scheduler config:", error);
    }
  }, []);

  // Función para actualizar config localmente (sin guardar)
  const updateConfig = useCallback((newConfig) => {
    console.log("Updating config locally:", newConfig);
    setConfig(newConfig);
  }, []);

  // Guardar configuración
  const saveConfig = useCallback(async (newConfig) => {
    setLoading(true);
    try {
      if (typeof window !== "undefined" && window.require) {
        const { ipcRenderer } = window.require("electron");
        const result = await ipcRenderer.invoke("setup-scheduler", newConfig);
        if (result.success) {
          setConfig(newConfig);
          console.log("Scheduler configured successfully");
          return { success: true };
        } else {
          console.error("Error configuring scheduler:", result.error);
          return { success: false, error: result.error };
        }
      }
      return { success: false, error: "Electron not available" };
    } catch (error) {
      console.error("Error saving scheduler config:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener estado del scheduler
  const getStatus = useCallback(async () => {
    try {
      if (typeof window !== "undefined" && window.require) {
        const { ipcRenderer } = window.require("electron");
        const result = await ipcRenderer.invoke("get-scheduler-status");
        if (result.success) {
          setStatus(result.status);
          return result.status;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting scheduler status:", error);
      return null;
    }
  }, []);

  // Cargar configuración al inicializar (solo una vez)
  useEffect(() => {
    if (!isInitialized) {
      loadConfig();
    }
  }, [loadConfig, isInitialized]);

  return {
    config,
    loading,
    status,
    saveConfig,
    loadConfig,
    getStatus,
    updateConfig,
  };
};

export default useScheduler;
