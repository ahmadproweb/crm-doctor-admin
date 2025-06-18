export const secureFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const defaultHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "API error");
  }
  return res.json();
};

// PDF upload ke liye — FormData ke sath:
export const secureUpload = async (url, formData) =>
  secureFetch(url, {
    method: "POST",
    body: formData,           // NOTE: header Content‑Type ko set na kare; browser khud karega
  });
