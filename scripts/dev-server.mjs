import { spawn } from 'node:child_process';
import os from 'node:os';

function getLocalNetworkIp() {
  const nets = os.networkInterfaces();

  // Check standard Wi-Fi or Ethernet adapter first
  for (const name of Object.keys(nets)) {
    if (/wi-fi|wireless|wlan|ethernet|local area/i.test(name)) {
      for (const net of nets[name] || []) {
        if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
          return net.address;
        }
      }
    }
  }

  // Fallback: any active interface excluding tunnels/VPNs (wintun, vgate0, tap, etc.)
  for (const name of Object.keys(nets)) {
    if (/wintun|vgate|vpn|tap|tun|docker|virtual|vmware|vbox/i.test(name)) continue;
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal && !net.address.startsWith('169.254')) {
        return net.address;
      }
    }
  }

  return '127.0.0.1';
}

const networkIp = getLocalNetworkIp();

// Pass extra arguments if any
const nextBin = process.platform === 'win32' ? 'cmd.exe' : 'npx';
const nextArgs = process.platform === 'win32'
  ? ['/c', 'npx', 'next', 'dev', '--webpack', '-H', '0.0.0.0', ...process.argv.slice(2)]
  : ['next', 'dev', '--webpack', '-H', '0.0.0.0', ...process.argv.slice(2)];

const child = spawn(nextBin, nextArgs, {
  stdio: ['inherit', 'pipe', 'inherit']
});

child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  // Replace 0.0.0.0 in the Network log line with the real Wi-Fi IP
  const replaced = text.replace(
    /(- Network:\s+https?:\/\/)0\.0\.0\.0(:[0-9]+)/g,
    `$1${networkIp}$2`
  );
  process.stdout.write(replaced);
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
