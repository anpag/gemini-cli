/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as net from 'node:net';

const socketPath = '/tmp/gemini-server.sock';

export function runClient(onMessage: (message: string) => void) {
  const client = net.createConnection({ path: socketPath }, () => {
    console.log('Connected to server.');
  });

  client.on('data', (data) => {
    onMessage(data.toString());
  });

  client.on('end', () => {
    console.log('Disconnected from server.');
  });

  client.on('error', (err) => {
    console.error('Error connecting to server:', err);
  });

  return (type: string, payload: unknown) => {
    client.write(JSON.stringify({ type, payload }));
  };
}
