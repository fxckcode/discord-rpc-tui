'use client';

import { useState, useCallback } from 'react';
import type { Presence } from '@/types';

interface ApplyCommandProps {
  presence: Presence;
}

function generateCommand(presence: Presence): string {
  const activity = presence.activity;
  const parts: string[] = [];

  parts.push('rpc-tui set-activity');

  const jsonObj: Record<string, unknown> = {
    type: activity.type
  };

  if (activity.name) jsonObj.name = activity.name;
  if (activity.state) jsonObj.state = activity.state;
  if (activity.details) jsonObj.details = activity.details;
  if (activity.largeImageKey) jsonObj.largeImageKey = activity.largeImageKey;
  if (activity.largeImageText) jsonObj.largeImageText = activity.largeImageText;
  if (activity.smallImageKey) jsonObj.smallImageKey = activity.smallImageKey;
  if (activity.smallImageText) jsonObj.smallImageText = activity.smallImageText;
  if (activity.buttons && activity.buttons.length > 0) {
    jsonObj.buttons = activity.buttons;
  }

  const json = JSON.stringify(jsonObj, null, 2);
  const indentedJson = json
    .split('\n')
    .map(line => `  ${line}`)
    .join('\n')
    .trim();

  parts.push(`'${indentedJson}'`);

  return parts.join(' ');
}

export function ApplyCommand({ presence }: ApplyCommandProps) {
  const [copied, setCopied] = useState(false);

  const command = generateCommand(presence);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where clipboard API is not available
      const textarea = document.createElement('textarea');
      textarea.value = command;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [command]);

  return (
    <div>
      <div className="border-hairline bg-canvas-soft mb-3 overflow-hidden rounded-lg border">
        <div className="border-hairline flex items-center gap-1.5 border-b px-4 py-2">
          <span className="bg-timeline-done/60 h-2.5 w-2.5 rounded-full" />
          <span className="bg-timeline-thinking/60 h-2.5 w-2.5 rounded-full" />
          <span className="bg-timeline-grep/60 h-2.5 w-2.5 rounded-full" />
          <span className="text-muted-soft ml-2 text-[10px]">bash</span>
        </div>
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
          <code>
            <span className="text-semantic-success">$</span>{' '}
            {command.split('\n').map((line, i, arr) => (
              <span key={i}>
                {i > 0 && (
                  <span className="text-muted-soft select-none"> </span>
                )}
                {line}
                {i < arr.length - 1 && '\n'}
              </span>
            ))}
          </code>
        </pre>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className={`btn-download w-full no-underline transition-all duration-200 ${
          copied ? '!bg-semantic-success scale-[0.98]' : ''
        }`}
      >
        {copied ? (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Command
          </>
        )}
      </button>
    </div>
  );
}
