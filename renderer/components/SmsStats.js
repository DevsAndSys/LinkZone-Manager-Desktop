export default function SmsStats({ contacts, storageInfo }) {
  // Calcular estadísticas adicionales
  const totalContacts = contacts.length;
  const unreadMessages = storageInfo.UnreadSMSCount || 0;
  const usedStorage = storageInfo.TotalSms - storageInfo.LeftCount || 0;
  const totalStorage = storageInfo.TotalSms || 0;
  const availableStorage = storageInfo.LeftCount || 0;

  // Calcular porcentaje de uso
  const usagePercentage =
    totalStorage > 0 ? Math.round((usedStorage / totalStorage) * 100) : 0;

  return (
    <div className="pt-3 mt-4 border-t border-gray-200 dark:border-gray-600">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {totalContacts}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Conversaciones
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {unreadMessages}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            No leídos
          </div>
        </div>
      </div>

      {/* Capacidad de almacenamiento */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Capacidad SMS
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {usagePercentage}%
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              usagePercentage > 90
                ? "bg-red-500"
                : usagePercentage > 70
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {usedStorage} usados
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {availableStorage} disponibles
          </span>
        </div>
      </div>

      {/* Información adicional */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H9.414a1 1 0 01-.707-.293L6.293 13.293A1 1 0 005.586 13H3"
            />
          </svg>
          Total: {totalStorage}
        </span>
        <span className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-3 h-3 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {unreadMessages} nuevos
        </span>
      </div>

      {/* Advertencia de espacio bajo */}
      {usagePercentage > 90 && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
          <div className="flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              />
            </svg>
            Espacio de SMS casi lleno
          </div>
        </div>
      )}
    </div>
  );
}
