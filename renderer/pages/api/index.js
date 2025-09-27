import { linkZoneApiUrl } from "../../config";

export default async function linkZoneRequest(req, res) {
  if (req.method !== "POST") {
    res
      .status(405)
      .json({ error: "Method not allowed. Only POST requests are accepted." });
    return;
  }

  try {
    const payload = req.body;

    console.log("API Route - Received payload:", payload);
    console.log("API Route - Forwarding to:", linkZoneApiUrl);

    // Use fetch instead of axios for better compatibility in Electron
    const response = await fetch(linkZoneApiUrl + `?api=${payload.method}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("API Route - LinkZone response:", data);
    res.status(200).json(data);
  } catch (error) {
    console.error("API Route - Error:", error.message);

    if (error.message.includes("fetch")) {
      res.status(503).json({
        error: "Cannot connect to LinkZone device",
        details:
          "Make sure the device is connected and accessible at " +
          linkZoneApiUrl,
      });
    } else {
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
