import { useEffect, useState } from "react";
import Spinner from "./Spinner";

export default function SmsConversation({
  contact,
  linkZoneController,
  onClose,
  onDeleteMessage,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState(null);

  function loadMessages() {
    if (!contact?.ContactId) return;

    setLoading(true);

    // Usar getSmsContent para obtener los mensajes del contacto
    linkZoneController
      .getSmsContent(contact.ContactId)
      .then((data) => {
        console.log("Messages loaded:", data);
        setMessages(data.Messages.filter((msg) => msg.SMSType === 0) || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading messages:", err);
        setLoading(false);
      });
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return dateString;
    }
  }

  async function handleDeleteMessage(contactId, messageId) {
    console.log("Deleting message:", messageId);
    setDeletingMessage(messageId);
    try {
      await linkZoneController.deleteSms(contactId, messageId);
      // Recargar mensajes después de eliminar
      loadMessages();
      if (onDeleteMessage) {
        onDeleteMessage(messageId);
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    } finally {
      setDeletingMessage(null);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [contact]);

  const phoneNumber = contact?.PhoneNumber?.[0] || "Desconocido";

  const reversedList = [...messages].reverse();

  console.log("Rendering conversation for :", messages);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {phoneNumber}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-full hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ cursor: "pointer" }}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
              <span className="ml-2 text-gray-500">Cargando mensajes...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              No hay mensajes en esta conversación
            </div>
          ) : (
            <div className="space-y-3">
              {reversedList.map((message, index) => (
                <div
                  key={message.SMSId || index}
                  className={`flex ${
                    message.Type === 1 ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-center border-b w-full justify-between px-4 py-2 rounded-lg ${
                      message.Type === 1
                        ? "bg-blue-500 text-white"
                        : "text-gray-900 dark:text-white font-bold"
                    }`}
                  >
                    <p className="text-sm break-words">{message.SMSContent}</p>

                    <button
                      onClick={() =>
                        handleDeleteMessage(contact.ContactId, message.SMSId)
                      }
                      disabled={deletingMessage === message.Index}
                      className={`ml-2 p-1 border border-red-500 rounded hover:bg-red-500 hover:text-white text-red-500 ${
                        message.Type === 1 ? "text-blue-200" : "text-gray-400"
                      }`}
                      style={{ cursor: "pointer" }}
                      title="Eliminar mensaje"
                    >
                      {deletingMessage === message.Index ? (
                        <div className="w-3 h-3">
                          <Spinner />
                        </div>
                      ) : (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
            style={{ cursor: "pointer" }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
