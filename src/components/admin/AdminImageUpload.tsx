"use client";

interface Props {
  label?: string;
  previewSrc?: string;
  onPick: (dataUrl: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export default function AdminImageUpload({
  label = "Product photo",
  previewSrc,
  onPick,
  onClear,
  disabled,
}: Props) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-xs text-muted">JPG or PNG, under 2 MB</p>

      {previewSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt="Preview"
          className="mt-3 max-h-40 max-w-full rounded-lg border border-border object-contain"
        />
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-3 py-2 text-xs font-semibold text-brand hover:border-brand/40">
          Upload photo
          <input
            type="file"
            accept="image/*"
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") onPick(reader.result);
              };
              reader.readAsDataURL(file);
              e.target.value = "";
            }}
          />
        </label>
        {previewSrc && onClear && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-red-600 disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
