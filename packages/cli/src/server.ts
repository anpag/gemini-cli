/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

console.log('Server file loaded.');

import * as net from 'node:net';
import * as fs from 'node:fs';
import { SessionManager } from './session-manager.js';

const socketPath = '/tmp/gemini-server.sock';

export function startServer() {
  // Clean up old socket file if it exists
  if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
  }

  const sessionManager = new SessionManager();

  const server = net.createServer((socket) => {
    console.log('Client connected.');

    socket.on('data', (data) => {
      const message = JSON.parse(data.toString());
      console.log(`Received: ${JSON.stringify(message)}`);

      switch (message.type) {
        case 'sendMessage':
          sessionManager.addMessageToCurrentSession(message.payload);
          socket.write(
            JSON.stringify({
              type: 'messageReceived',
              payload: `Server received: ${message.payload}`,
            }),
          );
          break;
        case 'createSession':
          try {
            sessionManager.createSession(message.payload.sessionId);
            socket.write(
              JSON.stringify({
                type: 'sessionCreated',
                payload: sessionManager.getCurrentSessionId(),
              }),
            );
          } catch (error: unknown) {
            socket.write(
              JSON.stringify({
                type: 'error',
                payload: (error as Error).message,
              }),
            );
          }
          break;
        case 'switchSession':
          try {
            sessionManager.switchSession(message.payload.sessionId);
            socket.write(
              JSON.stringify({
                type: 'sessionSwitched',
                payload: sessionManager.getCurrentSessionId(),
              }),
            );
          } catch (error: unknown) {
            socket.write(
              JSON.stringify({
                type: 'error',
                payload: (error as Error).message,
              }),
            );
          }
          break;
        case 'listSessions':
          socket.write(
            JSON.stringify({
              type: 'sessionList',
              payload: sessionManager.listSessions(),
            }),
          );
          break;
        case 'getMessages':
          socket.write(
            JSON.stringify({
              type: 'currentSessionMessages',
              payload: sessionManager.getMessagesForCurrentSession(),
            }),
          );
          break;
        default:
          socket.write(
            JSON.stringify({
              type: 'error',
              payload: 'Unknown message type',
            }),
          );
          break;
      }
    });

    socket.on('end', () => {
      console.log('Client disconnected.');
    });
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  server.listen(socketPath, () => {
    console.log('Server listening on ' + socketPath);
    console.log('Server ready');
  });

  process.on('exit', () => {
    if (fs.existsSync(socketPath)) {
      fs.unlinkSync(socketPath);
    }
  });
}
