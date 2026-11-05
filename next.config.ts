import type { NextConfig } from "next";
import os from "node:os";

// Collect all network IPs dynamically so any device on your Wi-Fi or LAN is allowed
const localIps: string[] = [];
try {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.address.startsWith("169.254")) {
        localIps.push(iface.address);
      }
    }
  }
} catch {
  // Ignore fallback
}

const nextConfig: NextConfig = {
  // Allow other devices on the local network to access dev chunks, HMR WebSockets, and scripts
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.50.196",
    ...localIps,
  ],
};

export default nextConfig;
