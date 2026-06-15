export default function ErrorBanner({ message, onDismiss }) {
  if (!message) {
    return null;
  }

  return (
    <div className="error-banner" role="alert">
      <div>
        <strong>Something went wrong</strong>
        <p>{message}</p>
      </div>

      <button
        type="button"
        className="error-banner__close"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}