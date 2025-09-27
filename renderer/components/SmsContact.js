import { useState } from "react";
import Spinner from "./Spinner";

export default function SmsContact({ contact, onDelete, onViewConversation }) {
  const [deleting, setDeleting] = useState(false);

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

  function truncateMessage(message, maxLength = 40) {
    if (!message) return "";
    return message.length > maxLength
      ? message.substring(0, maxLength) + "..."
      : message;
  }

  async function handleDelete(e) {
    e.stopPropagation(); // Evitar que se active el click del contenedor
    if (deleting) return;

    setDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      console.error("Error deleting contact:", err);
    } finally {
      setDeleting(false);
    }
  }

  function handleViewConversation() {
    if (onViewConversation) {
      onViewConversation();
    }
  }

  return (
    <li className="pt-1 border-t border-gray-200 dark:border-gray-600 first:border-t-0 first:pt-0">
      <div className="flex items-start justify-between mb-2">
        <div
          className="flex-1 p-2 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={handleViewConversation}
          style={{ cursor: "pointer" }}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-sm font-medium ${
                contact.UnreadCount > 0 ? "text-blue-600" : "text-gray-600"
              } dark:text-blue-400`}
            >
              {contact.PhoneNumber?.[0] || "Desconocido"}{" "}
              {contact.UnreadCount > 0 && `(${contact.UnreadCount})`}
            </span>
            <div className="flex items-center space-x-1">
              {contact.UnreadCount > 0 && (
                <span
                  className="w-2 h-2 bg-red-500 rounded-full"
                  title={`${contact.UnreadCount} no leídos`}
                ></span>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1 transition-colors rounded hover:bg-red-100 dark:hover:bg-red-900"
                title="Eliminar conversación"
                style={{ cursor: "pointer" }}
              >
                {deleting ? (
                  <div className="w-4 h-4">
                    <Spinner />
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            {truncateMessage(contact.SMSContent)}
          </p>
          <div className="flex items-center justify-between mt-1">
            {contact.UnreadNum > 0 && (
              <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                {contact.UnreadNum}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
