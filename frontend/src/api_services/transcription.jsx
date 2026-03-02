import { apiClient } from "./client";

export const transcribe = async (formData) => {
    try {
        const response = await apiClient.post("transcription/transcribe", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("Error transcribing audio:", error);
        return null;
    }
}
