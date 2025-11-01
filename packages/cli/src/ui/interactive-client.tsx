/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useContext } from 'react';
import { Box, Text, Newline, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { AppContext } from './app-context.js';

interface InteractiveClientProps {
  sendMessage: (type: string, payload: unknown) => void;
}

export function InteractiveClient({ sendMessage }: InteractiveClientProps) {
  const [input, setInput] = useState('');
  const { messages, addMessage } = useContext(AppContext);

  useInput((_input, key) => {
    if (key.return) {
      if (input.trim() !== '') {
        addMessage(`You: ${input}`);
        sendMessage('sendMessage', input);
        setInput('');
      }
    }
  });

  useEffect(() => {
    // This effect will be used to receive messages from the server
    // For now, we'll just add a placeholder.
    // In a real scenario, this would be handled by the `onClientMessage` callback in gemini.tsx
    // and then passed down to this component via context or props.
  }, []);

  return (
    <Box flexDirection="column">
      {messages.map((msg, i) => (
        <Text key={i}>{msg}</Text>
      ))}
      <Newline />
      <Box>
        <Text>{'>'}</Text>
        <TextInput value={input} onChange={setInput} onSubmit={() => {}} />
      </Box>
    </Box>
  );
}
