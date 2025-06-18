import { useState } from "react";
import { secureUpload } from "../pages/api";
import toast from "react-hot-toast";

const AddAnalysisModal = ({ open, onClose, patientId, onSaved }) => {
  const [analysisName, setName] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

 const handleSave = async () => {
  if (!analysisName || !file) {
    toast.error("Name and  file required");
    return;
  }

  try {
    setSaving(true);
    const form = new FormData();
    form.append("analysisName", analysisName);
    form.append("file", file);

    await secureUpload(`http://localhost:2642/api/${patientId}/analysis`, form);

    toast.success("Analysis successfully added!");
    onSaved();
    onClose();
  } catch (err) {
    const backendMessage =
      err?.response?.data?.message || err?.message || "Something went wrong";
    toast.error(`Failed: ${backendMessage}`);
  } finally {
    setSaving(false);
  }
};


  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <h3>Add Analysis PDF</h3>

        <label>
          Analysis Name
          <input
            value={analysisName}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. blood test, x-ray, etc."
          />
        </label>

        <label>
          PDF File
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <div className="buttons">
          <button className="cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAnalysisModal;
