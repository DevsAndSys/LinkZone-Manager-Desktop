import React, { useEffect } from "react";
import useScheduler from "../hooks/useScheduler";

export default function PlannerCard() {
  const [open, setOpen] = React.useState(false);
  const { config, loading, saveConfig, updateConfig } = useScheduler();

  const handleOpenPlanner = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const handleCancelButton = (e) => {
    e.preventDefault();
    setOpen(false);
  };

  const handleSaveButton = async (e) => {
    e.preventDefault();
    const result = await saveConfig(config);
    if (result.success) {
      setOpen(false);
    } else {
      console.error("Failed to save scheduler config:", result.error);
    }
  };

  const handleSchedulingToggle = (enabled) => {
    updateConfig({ ...config, enabled });
  };

  const handleTimeChange = (field, value) => {
    updateConfig({ ...config, [field]: value });
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-10 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              aria-hidden="true"
              onClick={handleCancelButton}
            ></div>

            {/* Modal centering trick */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            {/* Modal panel */}
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-gray-800">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-gray-800 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                      id="modal-title"
                    >
                      Programar Encendido/Apagado
                    </h3>

                    <div className="mt-4">
                      {/* Checkbox para activar programación */}
                      <div className="flex items-center mb-4">
                        <input
                          id="schedule-checkbox"
                          type="checkbox"
                          checked={config.enabled}
                          onChange={(e) =>
                            handleSchedulingToggle(e.target.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label
                          htmlFor="schedule-checkbox"
                          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                        >
                          Activar programación automática
                        </label>
                      </div>

                      {/* Formulario de horarios - solo visible si está activado */}
                      {config.enabled && (
                        <div className="space-y-4">
                          {/* Horario de encendido */}
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Horario de encendido
                            </label>
                            <div className="relative">
                              <input
                                type="time"
                                value={config.turnOnTime}
                                onChange={(e) =>
                                  handleTimeChange("turnOnTime", e.target.value)
                                }
                                className="w-full p-2 text-gray-800 bg-white border-2 border-gray-300 rounded dark:text-white dark:border-gray-600 dark:bg-gray-700 focus:border-blue-500 focus:outline-none"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                  />
                                </svg>
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              El dispositivo se encenderá a esta hora
                            </p>
                          </div>

                          {/* Horario de apagado */}
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Horario de apagado
                            </label>
                            <div className="relative">
                              <input
                                type="time"
                                value={config.turnOffTime}
                                onChange={(e) =>
                                  handleTimeChange(
                                    "turnOffTime",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 text-gray-800 bg-white border-2 border-gray-300 rounded dark:text-white dark:border-gray-600 dark:bg-gray-700 focus:border-blue-500 focus:outline-none"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                  />
                                </svg>
                              </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              El dispositivo se apagará a esta hora
                            </p>
                          </div>

                          {/* Información adicional */}
                          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                            <div className="flex">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="flex-shrink-0 w-5 h-5 mr-2 text-blue-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div>
                                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                  Información importante
                                </h4>
                                <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                                  La programación se ejecutará diariamente.
                                  Asegúrate de que los horarios sean correctos.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mensaje cuando está desactivado */}
                      {!config.enabled && (
                        <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 mx-auto mb-2 opacity-50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <p className="text-sm">
                            Activa la casilla para programar horarios
                            automáticos
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones del modal */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white transition-all bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveButton}
                  disabled={
                    loading ||
                    (config.enabled &&
                      (!config.turnOnTime || !config.turnOffTime))
                  }
                >
                  {loading
                    ? "Guardando..."
                    : config.enabled
                    ? "Programar"
                    : "Guardar"}
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm dark:text-gray-300 dark:bg-gray-600 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCancelButton}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Icono del planificador posicionado en la esquina superior derecha */}
      <div className="absolute border-2 top-5 right-14">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-6 h-6 cursor-pointer transition-colors ${
            config.enabled
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          onClick={handleOpenPlanner}
          style={{ cursor: "pointer" }}
          title={
            config.enabled
              ? "Programación activa - Click para modificar"
              : "Programar encendido/apagado"
          }
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </>
  );
}
