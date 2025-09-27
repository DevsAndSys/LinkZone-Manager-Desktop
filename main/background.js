import { app, ipcMain, shell } from "electron";
import serve from "electron-serve";
import Store from "electron-store";
import cron from "node-cron";
import LinkZone from "../renderer/types/LinkZone.js";
import { createWindow } from "./helpers";

// Importar node-fetch usando require ya que es CommonJS
const fetch = require("node-fetch");

// Hacer fetch disponible globalmente para LinkZone
global.fetch = fetch;

const isProd = process.env.NODE_ENV === "production";
const store = new Store();

// Variables para los cron jobs
let turnOnJob = null;
let turnOffJob = null;
let linkZoneController = null;

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  // Inicializar LinkZone controller
  linkZoneController = new LinkZone();

  // Limpiar store de window state para aplicar nuevo tamaño (desarrollo)
  if (!isProd) {
    const Store = require("electron-store");
    const windowStore = new Store({ name: "window-state-main" });
    windowStore.clear();
    console.log("🔧 Window state cleared for development");
  }

  const mainWindow = createWindow("main", {
    width: 1440,
    height: 800,
    autoHideMenuBar: true,
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    // mainWindow.webContents.openDevTools();
  }

  // Restaurar programación guardada al iniciar
  const savedSchedulerConfig = store.get("scheduler-config");
  if (savedSchedulerConfig?.enabled) {
    setupScheduler(savedSchedulerConfig);
  }
})();

app.on("window-all-closed", () => {
  // Limpiar cron jobs antes de cerrar
  if (turnOnJob) turnOnJob.destroy();
  if (turnOffJob) turnOffJob.destroy();
  app.quit();
});

// Función para configurar los cron jobs
function setupScheduler(config) {
  console.log("=== SCHEDULER SETUP ===");
  console.log("Config received:", JSON.stringify(config, null, 2));
  console.log(
    "Current time:",
    new Date().toLocaleString("es-ES", { timeZone: "America/Havana" })
  );

  // Limpiar jobs existentes
  if (turnOnJob) {
    console.log("Destroying existing turnOnJob");
    turnOnJob.destroy();
    turnOnJob = null;
  }
  if (turnOffJob) {
    console.log("Destroying existing turnOffJob");
    turnOffJob.destroy();
    turnOffJob = null;
  }

  if (!config.enabled) {
    console.log("Scheduler DISABLED - no jobs will be created");
    return;
  }

  // Definir las tareas con parámetros nombrados para evitar confusión
  const schedulerTasks = {
    turnOn: {
      time: config.turnOnTime,
      action: "connect",
      description: "Turn ON device",
      emoji: "🟢",
      method: () => linkZoneController.connect(),
    },
    turnOff: {
      time: config.turnOffTime,
      action: "disconnect",
      description: "Turn OFF device",
      emoji: "🔴",
      method: () => linkZoneController.disconnect(),
    },
  };

  console.log("Scheduler tasks:");
  console.log(
    "  TURN ON:",
    `${schedulerTasks.turnOn.time} -> ${schedulerTasks.turnOn.action}()`
  );
  console.log(
    "  TURN OFF:",
    `${schedulerTasks.turnOff.time} -> ${schedulerTasks.turnOff.action}()`
  );

  // Crear jobs para cada tarea
  Object.entries(schedulerTasks).forEach(([taskName, task]) => {
    const [hour, minute] = task.time.split(":");
    const cronExpression = `${minute} ${hour} * * *`;

    console.log(`Creating ${taskName} job:`);
    console.log(`  Time: ${task.time}`);
    console.log(`  Cron: ${cronExpression}`);
    console.log(`  Action: ${task.action}()`);

    // Validar expresión cron
    if (!cron.validate(cronExpression)) {
      console.error(`INVALID CRON EXPRESSION for ${taskName}:`, cronExpression);
      return;
    }

    try {
      const job = cron.schedule(
        cronExpression,
        async () => {
          console.log(
            `${task.emoji} EXECUTING ${task.description.toUpperCase()} at`,
            new Date().toLocaleString("es-ES", { timeZone: "America/Havana" })
          );
          try {
            console.log(`Calling linkZoneController.${task.action}()...`);
            await task.method();
            console.log(`✅ ${task.description} successful`);
          } catch (error) {
            console.error(`❌ Error with ${task.description}:`, error);
          }
        },
        {
          scheduled: true,
          timezone: "America/Havana",
        }
      );

      // Asignar el job a la variable correspondiente
      if (taskName === "turnOn") {
        turnOnJob = job;
      } else if (taskName === "turnOff") {
        turnOffJob = job;
      }

      console.log(`✅ ${taskName} job created successfully`);
    } catch (error) {
      console.error(`❌ Error creating ${taskName} job:`, error);
    }
  });

  // Verificar estado de los jobs
  console.log("Job status:");
  console.log(
    "  Turn ON job running:",
    turnOnJob ? !turnOnJob.destroyed : false
  );
  console.log(
    "  Turn OFF job running:",
    turnOffJob ? !turnOffJob.destroyed : false
  );

  console.log(`🎯 SCHEDULER CONFIGURED:`);
  console.log(`   ON: ${config.turnOnTime} -> connect()`);
  console.log(`   OFF: ${config.turnOffTime} -> disconnect()`);
  console.log("=== SCHEDULER SETUP COMPLETE ===");
}

// IPC Handlers
// Handle scheduler configuration
ipcMain.handle("setup-scheduler", async (event, config) => {
  console.log("=== IPC SETUP SCHEDULER ===");
  console.log("Received config:", JSON.stringify(config, null, 2));

  try {
    // Guardar configuración en electron-store
    console.log("Saving config to electron-store...");
    store.set("scheduler-config", config);

    const savedConfig = store.get("scheduler-config");
    console.log("Verified saved config:", JSON.stringify(savedConfig, null, 2));

    // Configurar cron jobs
    console.log("Calling setupScheduler...");
    setupScheduler(config);

    console.log("✅ Scheduler configuration complete");
    return { success: true, message: "Scheduler configured successfully" };
  } catch (error) {
    console.error("❌ Error setting up scheduler:", error);
    return { success: false, error: error.message };
  }
});

// Get current scheduler configuration
ipcMain.handle("get-scheduler-config", async (event) => {
  console.log("=== IPC GET CONFIG ===");
  try {
    const config = store.get("scheduler-config", {
      enabled: false,
      turnOnTime: "08:00",
      turnOffTime: "22:00",
    });
    console.log("Retrieved config:", JSON.stringify(config, null, 2));
    return { success: true, config };
  } catch (error) {
    console.error("❌ Error getting scheduler config:", error);
    return { success: false, error: error.message };
  }
});

// Get scheduler status
ipcMain.handle("get-scheduler-status", async (event) => {
  console.log("=== IPC GET STATUS ===");
  try {
    const status = {
      turnOnJobActive: turnOnJob ? !turnOnJob.destroyed : false,
      turnOffJobActive: turnOffJob ? !turnOffJob.destroyed : false,
      config: store.get("scheduler-config"),
    };
    console.log("Current status:", JSON.stringify(status, null, 2));
    console.log("Turn ON job object exists:", !!turnOnJob);
    console.log("Turn OFF job object exists:", !!turnOffJob);
    if (turnOnJob) console.log("Turn ON job destroyed:", turnOnJob.destroyed);
    if (turnOffJob)
      console.log("Turn OFF job destroyed:", turnOffJob.destroyed);

    return { success: true, status };
  } catch (error) {
    console.error("❌ Error getting scheduler status:", error);
    return { success: false, error: error.message };
  }
});

// Test scheduler manually (for debugging)
ipcMain.handle("test-scheduler", async (event, action) => {
  console.log(`=== TEST SCHEDULER: ${action.toUpperCase()} ===`);
  try {
    if (action === "on") {
      console.log("Testing TURN ON command...");
      await linkZoneController.connect();
      console.log("✅ Manual turn ON test successful");
    } else if (action === "off") {
      console.log("Testing TURN OFF command...");
      await linkZoneController.disconnect();
      console.log("✅ Manual turn OFF test successful");
    } else if (action === "test-job") {
      console.log("Creating test cron job (will run in 1 minute)...");
      const testTime = new Date();
      testTime.setMinutes(testTime.getMinutes() + 1);
      const cronExpression = `${testTime.getMinutes()} ${testTime.getHours()} * * *`;

      console.log("Test cron expression:", cronExpression);
      console.log(
        "Will execute at:",
        testTime.toLocaleString("es-ES", { timeZone: "America/Havana" })
      );

      const testJob = cron.schedule(
        cronExpression,
        () => {
          console.log(
            "🧪 TEST CRON JOB EXECUTED at",
            new Date().toLocaleString("es-ES", { timeZone: "America/Havana" })
          );
          testJob.destroy();
        },
        {
          scheduled: true,
          timezone: "America/Havana",
        }
      );

      console.log("✅ Test job created");
    }

    return { success: true, message: `Test ${action} completed` };
  } catch (error) {
    console.error(`❌ Error testing ${action}:`, error);
    return { success: false, error: error.message };
  }
});

// Handle external link opening
ipcMain.handle("open-external-link", async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error("Failed to open external link:", error);
    return { success: false, error: error.message };
  }
});

// Handle LinkZone API requests
ipcMain.handle("linkzone-request", async (event, payload) => {
  try {
    console.log("IPC Handler - LinkZone request:", payload);

    // Use the linkZoneController instance that has fetch available
    const result = await linkZoneController.linkZoneRequest(payload);

    console.log("IPC Handler - LinkZone response:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("IPC Handler - LinkZone error:", error);
    return { success: false, error: error.message };
  }
});
