import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = () => {
    return json({
        status: "ok",
        timestamp: new Date().toISOString()
    });
}