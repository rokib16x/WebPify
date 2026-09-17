import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const COUNTER_KEY = "webpify:images-converted";

const sendCount = (response, count) => {
  response.setHeader("Cache-Control", "no-store");
  return response.status(200).json({ count: Number(count) || 0 });
};

export default async function handler(request, response) {
  try {
    if (request.method === "GET") {
      const count = await redis.get(COUNTER_KEY);
      return sendCount(response, count);
    }

    if (request.method === "POST") {
      const body =
        typeof request.body === "string"
          ? JSON.parse(request.body || "{}")
          : request.body || {};
      const amount = Number(body.amount);

      if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
        return response.status(400).json({ error: "Amount must be between 1 and 1000." });
      }

      const count = await redis.incrby(COUNTER_KEY, amount);
      return sendCount(response, count);
    }

    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error("Unable to update conversion count:", error);
    return response.status(500).json({ error: "Unable to load conversion count." });
  }
}
