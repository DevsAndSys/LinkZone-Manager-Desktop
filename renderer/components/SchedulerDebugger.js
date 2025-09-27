const SchedulerDebugger = () => {
  const testScheduler = async (action) => {
    try {
      console.log(`Testing scheduler action: ${action}`);
      const { ipcRenderer } = window.require("electron");
      const result = await ipcRenderer.invoke("test-scheduler", action);
      console.log("Test result:", result);
      alert(
        `Test ${action}: ${result.success ? "SUCCESS" : "FAILED"}\n${
          result.message || result.error
        }`
      );
    } catch (error) {
      console.error("Test error:", error);
      alert(`Test ${action} FAILED: ${error.message}`);
    }
  };

  const getStatus = async () => {
    try {
      const { ipcRenderer } = window.require("electron");
      const result = await ipcRenderer.invoke("get-scheduler-status");
      console.log("Status result:", result);
      alert(`Status:\n${JSON.stringify(result.status, null, 2)}`);
    } catch (error) {
      console.error("Status error:", error);
      alert(`Status FAILED: ${error.message}`);
    }
  };

  return (
    <div className="bg-red-100 border border-red-400 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold text-red-800 mb-4">
        🐛 Scheduler Debugger
      </h3>
      <p className="text-sm text-red-600 mb-4">
        Herramientas de debugging para el scheduler. Eliminar después de
        solucionar el problema.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => testScheduler("on")}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
        >
          Test Turn ON
        </button>

        <button
          onClick={() => testScheduler("off")}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
        >
          Test Turn OFF
        </button>

        <button
          onClick={() => testScheduler("test-job")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
        >
          Test Cron Job
        </button>

        <button
          onClick={getStatus}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm"
        >
          Get Status
        </button>
      </div>

      <div className="mt-4 text-xs text-red-600">
        <p>
          <strong>Test Turn ON/OFF:</strong> Prueba los comandos directamente
        </p>
        <p>
          <strong>Test Cron Job:</strong> Crea un job que se ejecutará en 1
          minuto
        </p>
        <p>
          <strong>Get Status:</strong> Muestra el estado actual de los jobs
        </p>
      </div>
    </div>
  );
};

export default SchedulerDebugger;
