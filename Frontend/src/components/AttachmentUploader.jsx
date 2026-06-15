import { useRef, useState } from "react";
import { uploadTaskAttachment } from "../services/api";

export default function AttachmentUploader({ taskId }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      await uploadTaskAttachment(taskId, file);
      event.target.value = "";
    } catch (error) {
      setError(error.message || "Failed to upload attachment");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="attachment-uploader">
      <input
        ref={inputRef}
        className="attachment-uploader__input"
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.doc,.docx"
      />

      <button
        type="button"
        className="attachment-uploader__button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Add attachment"}
      </button>

      {error && <p className="attachment-uploader__error">{error}</p>}
    </div>
  );
}