/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import { useState, useCallback, useEffect } from 'react';
import { render } from 'ink';
import { startServer } from './server.js';
import { runClient } from './client.js';
import { parseArguments } from './config/config.js';
import { loadSettings, migrateDeprecatedSettings } from './config/settings.js';
import { cleanupCheckpoints } from './utils/cleanup.js';
import { ExtensionManager } from './config/extension-manager.js';
import { requestConsentNonInteractive } from './config/extensions/consent.js';
import { InteractiveClient } from './ui/interactive-client.js';
import { AppContext } from './ui/app-context.js';

async function ensureServerIsRunning() {
  const socketPath = '/tmp/gemini-server.sock'; // Placeholder
  if (!fs.existsSync(socketPath)) {
    const args = [process.argv[1], '--daemon'];
    const child = spawn(process.execPath, args, {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
    // It might take a moment for the server to start and create the socket
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export function setupUnhandledRejectionHandler() {
  let unhandledRejectionOccurred = false;
  process.on('unhandledRejection', (_reason, _promise) => {
    // appEvents.emit(AppEvent.LogError, errorMessage);
    if (!unhandledRejectionOccurred) {
      unhandledRejectionOccurred = true;
      // appEvents.emit(AppEvent.OpenDebugConsole);
    }
  });
}

export async function main() {
  setupUnhandledRejectionHandler();
  const settings = loadSettings();
  migrateDeprecatedSettings(
    settings,
    // Temporary extension manager only used during this non-interactive UI phase.
    new ExtensionManager({
      workspaceDir: process.cwd(),
      settings: settings.merged,
      enabledExtensionOverrides: [],
      requestConsent: requestConsentNonInteractive,
      requestSetting: null,
    }),
  );
  await cleanupCheckpoints();

  await ensureServerIsRunning();

  const argv = await parseArguments(settings.merged);

  if (argv.daemon) {
    startServer();
    return;
  }

  const App = () => {
    const [messages, setMessages] = useState<string[]>([]);

    const addMessage = useCallback((message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    }, []);

    const onClientMessage = (message: string) => {
      try {
        const parsedMessage = JSON.parse(message);
        console.log('Client received:', parsedMessage);
        addMessage(`Server: ${JSON.stringify(parsedMessage)}`);
      } catch (error) {
        console.error('Error parsing server message:', error);
        addMessage(`Server (raw): ${message}`);
      }
    };
    const sendMessage = runClient(onClientMessage);

    // Temporary test: send a message to the server
    useEffect(() => {
      sendMessage('sendMessage', 'Hello from client with new protocol!');
      sendMessage('createSession', { sessionId: 'new-session' });
      sendMessage('switchSession', { sessionId: 'new-session' });
      sendMessage('listSessions', {});
      sendMessage('getMessages', {});
    }, [sendMessage]);

    return (
      <AppContext.Provider value={{ messages, addMessage }}>
        <InteractiveClient sendMessage={sendMessage} />
      </AppContext.Provider>
    );
  };

  render(<App />);
}
