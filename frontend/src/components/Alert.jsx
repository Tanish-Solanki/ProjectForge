const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`p-3 rounded-md border text-sm flex items-start justify-between ${
        styles[type] || styles.info
      } mb-4`}
      role="alert"
    >
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-sm font-semibold opacity-70 hover:opacity-100"
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
