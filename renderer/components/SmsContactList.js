import SmsContact from "./SmsContact";

export default function SmsContactList({
  contacts,
  loading,
  onDeleteContact,
  onViewConversation,
  style = {},
}) {
  if (loading) {
    return (
      <div className="mt-4 overflow-y-auto max-h-96">
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <div className="w-8 h-8 mx-auto mb-4 animate-spin">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
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
          </div>
          Cargando conversaciones...
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-y-auto max-h-72" style={style}>
      {contacts.length === 0 ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 mx-auto mb-4 opacity-50"
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
          No hay conversaciones SMS
        </div>
      ) : (
        <ul className="space-y-1">
          {contacts.map((contact, index) => (
            <SmsContact
              key={contact.ContactId || index}
              contact={contact}
              onDelete={() => onDeleteContact(contact.ContactId)}
              onViewConversation={() => onViewConversation(contact)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
