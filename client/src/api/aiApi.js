import api from "./axios";

export const askAI = (question) => {
    return api.post("/api/ai/ask", {
        question
    });
};