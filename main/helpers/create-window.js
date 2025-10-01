import { app, BrowserWindow, Menu, screen, Tray } from "electron";
import Store from "electron-store";
import path from "path";
import LinkZone from "../../renderer/types/LinkZone";

export default function createWindow(windowName, options) {
  const key = "window-state";
  const name = `window-state-${windowName}`;
  const store = new Store({ name });
  const defaultSize = {
    width: options.width,
    height: options.height,
  };
  let state = {};
  let win;

  // ✅ AGREGADO: Variable para controlar el cierre de la aplicación
  let isQuiting = false;

  const restore = () => {
    const saved = store.get(key, defaultSize);

    // En desarrollo, usar siempre el tamaño especificado en options
    if (process.env.NODE_ENV !== "production") {
      return {
        ...saved,
        width: defaultSize.width,
        height: defaultSize.height,
      };
    }

    return saved;
  };

  const getCurrentPosition = () => {
    const position = win.getPosition();
    const size = win.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  };

  const windowWithinBounds = (windowState, bounds) => {
    return (
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    );
  };

  const resetToDefaults = () => {
    const bounds = screen.getPrimaryDisplay().bounds;
    return Object.assign({}, defaultSize, {
      x: (bounds.width - defaultSize.width) / 2,
      y: (bounds.height - defaultSize.height) / 2,
    });
  };

  const ensureVisibleOnSomeDisplay = (windowState) => {
    const visible = screen.getAllDisplays().some((display) => {
      return windowWithinBounds(windowState, display.bounds);
    });
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults();
    }
    return windowState;
  };

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
    store.set(key, state);
  };

  state = ensureVisibleOnSomeDisplay(restore());

  win = new BrowserWindow({
    ...options,
    ...state,
    webPreferences: {
      webSecurity: false,
      allowRunningInsecureContent: true,
      nodeIntegration: true,
      contextIsolation: false,
      ...options.webPreferences,
    },
  });

  // ❌ TU CÓDIGO ORIGINAL: Problema con la ruta del ícono
  // const getTrayIconPath = () => {
  //   const isDev = process.env.NODE_ENV !== "production";
  //   if (isDev) {
  //     // ❌ Esta ruta está mal: __dirname apunta al directorio compilado
  //     return path.join(__dirname, "..", "main", "logo (2).png");
  //   } else {
  //     return path.join(process.resourcesPath, "logo (2).png");
  //   }
  // };

  // ✅ CÓDIGO CORREGIDO: Función para obtener la ruta correcta del ícono del tray
  const getTrayIconPath = () => {
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
      // En desarrollo, usar el ícono desde resources/ (mismo que la aplicación)
      return path.join(process.cwd(), "resources", "icon.png");
    } else {
      // En producción, usar el ícono desde extraResources
      return path.join(process.resourcesPath, "icon.png");
    }
  }; // ✅ AGREGADO: Variable para el tray (para poder manejarlo después)
  let tray = null;

  try {
    // Minimize to tray instead of closing
    const iconPath = getTrayIconPath();
    console.log("Attempting to create tray with icon:", iconPath);

    // Check if icon file exists (for debugging)
    const fs = require("fs");
    if (!fs.existsSync(iconPath)) {
      console.error("Tray icon file not found:", iconPath);
      console.log(
        "Available files in resources:",
        fs.readdirSync(path.dirname(iconPath)).filter((f) => f.includes("icon"))
      );
    }

    tray = new Tray(iconPath);
    tray.setToolTip("Link Zone Manager");

    // ✅ FUNCIÓN PARA ACTUALIZAR EL MENÚ DINÁMICAMENTE
    const updateTrayMenu = async () => {
      let isConnected = false;

      try {
        const linkZoneController = new LinkZone();
        const status = await linkZoneController.getSystemStatus();
        isConnected = status?.Connected || false;
      } catch (error) {
        // Si no se puede obtener el estado, mantener como desconectado
        console.log("No se pudo obtener el estado para el menú:", error);
      }

      tray.setContextMenu(
        Menu.buildFromTemplate([
          {
            label: "Abrir App",
            click: function () {
              win.show();
              win.focus();
            },
          },
          {
            label: isConnected ? "Desconectar" : "Conectar",
            click: async () => {
              const linkZoneController = new LinkZone();
              let status = null;
              try {
                status = await linkZoneController.getSystemStatus();
                console.log({ status });
              } catch (error) {
                console.log("Aqui no vive nadie: ");
                console.log({ error });
              }

              if (status?.Connected) {
                console.log("Desconectando...");
                linkZoneController
                  .disconnect()
                  .then(() => {
                    tray.displayBalloon({
                      title: "Link Zone Manager",
                      content: "Desconectado exitosamente.",
                    });
                    // Actualizar el menú después de desconectar
                    setTimeout(() => updateTrayMenu(), 2000);
                  })
                  .catch((error) => {
                    console.log("ERROR AL DESCONECTAR:");
                    console.log({ error });
                    tray.displayBalloon({
                      title: "Error",
                      content: "No se pudo desconectar el Link Zone.",
                    });
                  });
              } else {
                console.log("Conectando...");
                linkZoneController
                  .connect()
                  .then(() => {
                    tray.displayBalloon({
                      title: "Link Zone Manager",
                      content: "Conectado exitosamente.",
                    });
                    // Actualizar el menú después de conectar
                    setTimeout(() => updateTrayMenu(), 2000);
                  })
                  .catch((error) => {
                    console.log("ERROR AL CONECTAR");
                    console.log({ error });
                    tray.displayBalloon({
                      title: "Error",
                      content: "No se pudo conectar el Link Zone.",
                    });
                  });
              }
            },
          },
          {
            label: "Quit",
            click: function () {
              isQuiting = true;
              app.quit();
            },
          },
        ])
      );
    };

    // ✅ CREAR EL MENÚ INICIAL
    updateTrayMenu();

    // ✅ ACTUALIZAR EL MENÚ CADA 30 SEGUNDOS AUTOMÁTICAMENTE
    const menuUpdateInterval = setInterval(() => {
      updateTrayMenu();
    }, 30000);

    // ✅ AGREGADO: Manejar doble click en el tray para mostrar/ocultar
    tray.on("double-click", () => {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
        win.focus();
      }
    });
  } catch (error) {
    // ✅ AGREGADO: Manejo de errores si no se puede crear el tray
    console.error("Failed to create tray icon:", error);
  }
  // ✅ MEJORADO: Prevenir minimizar a la barra de tareas
  win.on("minimize", (event) => {
    event.preventDefault();
    win.hide();
    // ✅ AGREGADO: Mostrar notificación la primera vez
    if (tray && !win.wasMinimizedToTray) {
      tray.displayBalloon({
        title: "Link Zone Manager",
        content:
          "La aplicación continúa ejecutándose en la bandeja del sistema.",
      });
      win.wasMinimizedToTray = true;
    }
  });

  // ✅ MEJORADO: Manejar el evento close correctamente
  win.on("close", (event) => {
    if (!isQuiting) {
      event.preventDefault();
      win.hide();
      return false;
    }
    // ✅ AGREGADO: Limpiar el interval de actualización del menú
    if (menuUpdateInterval) {
      clearInterval(menuUpdateInterval);
    }
    // ✅ AGREGADO: Limpiar el tray al cerrar
    if (tray) {
      tray.destroy();
    }
    saveState();
  });

  return win;
}
