/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AppContextType {
  messages: string[];
  addMessage: (message: string) => void;
}

export const AppContext = React.createContext<AppContextType>({
  messages: [],
  addMessage: () => {},
});
