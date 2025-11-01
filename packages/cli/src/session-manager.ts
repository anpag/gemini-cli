/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export class SessionManager {
  private sessions: Map<string, string[]> = new Map();
  private currentSessionId: string | undefined;

  constructor() {
    // Initialize with a default session
    this.createSession('default');
    this.currentSessionId = 'default';
  }

  createSession(sessionId: string): void {
    if (this.sessions.has(sessionId)) {
      throw new Error(`Session '${sessionId}' already exists.`);
    }
    this.sessions.set(sessionId, []);
    console.log(`Session '${sessionId}' created.`);
  }

  switchSession(sessionId: string): void {
    if (!this.sessions.has(sessionId)) {
      throw new Error(`Session '${sessionId}' does not exist.`);
    }
    this.currentSessionId = sessionId;
    console.log(`Switched to session '${sessionId}'.`);
  }

  getCurrentSessionId(): string | undefined {
    return this.currentSessionId;
  }

  addMessageToCurrentSession(message: string): void {
    if (!this.currentSessionId) {
      throw new Error('No current session selected.');
    }
    this.sessions.get(this.currentSessionId)?.push(message);
    console.log(
      `Message added to session '${this.currentSessionId}': ${message}`,
    );
  }

  getMessagesForCurrentSession(): string[] {
    if (!this.currentSessionId) {
      return [];
    }
    return this.sessions.get(this.currentSessionId) || [];
  }

  listSessions(): string[] {
    return Array.from(this.sessions.keys());
  }
}
