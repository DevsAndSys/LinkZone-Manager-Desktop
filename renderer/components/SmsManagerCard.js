import { useEffect, useState } from "react";
import SmsContactList from "./SmsContactList";
import SmsConversation from "./SmsConversation";
import SmsStats from "./SmsStats";
import Spinner from "./Spinner";

export default function SmsManagerCard({ linkZoneController }) {
  const [smsContacts, setSmsContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storageInfo, setStorageInfo] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  function loadSmsData() {
    setLoading(true);

    Promise.all([
      linkZoneController.getSmsInbox(),
      linkZoneController.getSmsStorageState(),
    ])
      .then(([contactsData, storageData]) => {
        console.log("Loaded SMS Data:", contactsData, storageData);
        setSmsContacts(contactsData.Messages || []);
        setStorageInfo(storageData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading SMS:", err);
        setLoading(false);
      });
  }

  function handleRefresh() {
    setRefreshing(true);
    loadSmsData();
    setTimeout(() => setRefreshing(false), 1000);
  }

  function handleDeleteContact(contactId) {
    return linkZoneController
      .deleteSms(contactId)
      .then((res) => {
        loadSmsData(); // Reload after delete
        return res;
      })
      .catch((err) => {
        console.error("Error deleting SMS:", err);
        throw err;
      });
  }

  function handleViewConversation(contact) {
    setSelectedContact(contact);
  }

  function handleCloseConversation() {
    setSelectedContact(null);
    // Recargar datos para actualizar contadores después de ver mensajes
    loadSmsData();
  }

  function handleDeleteMessage() {
    // Recargar después de eliminar un mensaje individual
    loadSmsData();
  }

  useEffect(() => {
    loadSmsData();
  }, []);

  return (
    <>
      <div
        className="max-w-xs p-4 m-5 bg-white rounded-lg shadow-lg w-72 dark:bg-gray-800"
        style={{
          maxHeight: 500,
          minHeight: 420,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pt-4 text-2xl font-bold leading-normal text-black dark:text-white">
          <div className="flex items-center">
            SMS
            <span className="px-2 py-1 ml-2 text-sm text-blue-800 bg-blue-100 rounded-full">
              {storageInfo.UnreadSMSCount || 0}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="p-1 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              style={{ cursor: "pointer" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${
                  refreshing ? "animate-spin" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            {loading && <Spinner />}
          </div>
        </div>

        {/* Contact List */}
        <SmsContactList
          contacts={smsContacts}
          loading={loading}
          onDeleteContact={handleDeleteContact}
          onViewConversation={handleViewConversation}
          style={{ flex: 1, minHeight: 0 }}
        />

        {/* Statistics */}
        <SmsStats contacts={smsContacts} storageInfo={storageInfo} />
      </div>

      {/* Modal para ver conversación */}
      {selectedContact && (
        <SmsConversation
          contact={selectedContact}
          linkZoneController={linkZoneController}
          onClose={handleCloseConversation}
          onDeleteMessage={handleDeleteMessage}
        />
      )}
    </>
  );
}
