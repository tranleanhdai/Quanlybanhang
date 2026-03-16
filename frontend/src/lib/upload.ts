import { api } from "./api";

export type UploadResult = { url: string; publicId: string };

export async function uploadImage(file: File, folder?: string) {
  const fd = new FormData();
  fd.append("file", file);
  if (folder) fd.append("folder", folder);
  const { data } = await api.post("/api/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data as UploadResult; // { url, publicId }
}
