import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";
const MAX_BYTES = 8 * 1024 * 1024;

// Uploads an image to R2 via the backend and returns its public URL.
export async function uploadImage(file, folder) {
  if (file.size > MAX_BYTES) throw new Error("Image must be 8 MB or smaller");
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const { data } = await api.post("/admin/uploads", form);
  return data.url;
}

const errorMessage = (err) => err?.response?.data?.detail || err?.message || "Upload failed";

function PickButton({ folder, onUploaded, multiple = false, testId, label }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  const onChange = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      for (const file of files) onUploaded(await uploadImage(file, folder));
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input ref={input} type="file" accept={ACCEPT} multiple={multiple} hidden onChange={onChange} />
      <button
        type="button"
        data-testid={testId}
        disabled={busy}
        onClick={() => input.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e4e8] bg-white px-3 py-2 text-[12px] font-semibold text-[#0f3d23] disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        {busy ? "Uploading…" : label}
      </button>
    </>
  );
}

export function ImageUpload({ value, onChange, folder }) {
  return (
    <div className="mt-1 flex items-center gap-3">
      {value ? (
        <img src={value} alt="" className="h-14 w-14 rounded-lg border border-[#e2e4e8] object-cover" />
      ) : (
        <span className="grid h-14 w-14 place-items-center rounded-lg border border-dashed border-[#e2e4e8] text-[10px] text-[#6d8a63]">
          None
        </span>
      )}
      <PickButton folder={folder} onUploaded={onChange} testId="form-image-upload" label={value ? "Replace" : "Upload"} />
    </div>
  );
}

export function GalleryUpload({ value = [], onChange, folder }) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      {value.map((url, i) => (
        <span key={url + i} className="relative">
          <img src={url} alt="" className="h-14 w-14 rounded-lg border border-[#e2e4e8] object-cover" />
          <button
            type="button"
            aria-label="Remove image"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#c04d13] text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <PickButton
        folder={folder}
        multiple
        onUploaded={(url) => onChange((prev) => [...prev, url])}
        testId="form-gallery-upload"
        label="Add images"
      />
    </div>
  );
}
