'use client';

import Link from 'next/link';
import { DocsSidebar } from '@/components/docs/sidebar';

function TerminalBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-hairline bg-canvas-soft mb-6 overflow-hidden rounded-lg border">
      <div className="border-hairline flex items-center gap-1.5 border-b px-4 py-2">
        <span className="bg-timeline-done/60 h-2.5 w-2.5 rounded-full" />
        <span className="bg-timeline-thinking/60 h-2.5 w-2.5 rounded-full" />
        <span className="bg-timeline-grep/60 h-2.5 w-2.5 rounded-full" />
        <span className="text-muted-soft ml-2 text-[10px]">bash</span>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}

function ConfigBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-hairline bg-canvas-soft mb-6 overflow-hidden rounded-lg border">
      <div className="border-hairline flex items-center gap-1.5 border-b px-4 py-2">
        <span className="bg-timeline-done/60 h-2.5 w-2.5 rounded-full" />
        <span className="bg-timeline-thinking/60 h-2.5 w-2.5 rounded-full" />
        <span className="bg-timeline-grep/60 h-2.5 w-2.5 rounded-full" />
        <span className="text-muted-soft ml-2 text-[10px]">json</span>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="display-sm mb-6 scroll-mt-24">
      {children}
    </h2>
  );
}

export default function DocsPage() {
  return (
    <div className="container-wide">
      <div className="flex gap-10 pt-12 pb-24">
        <div className="hidden w-56 shrink-0 md:block">
          <DocsSidebar />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="display-md mb-2">Documentation</h1>
          <p className="body-md text-muted mb-12">
            Everything you need to know about setting up and using{' '}
            <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">RPCraft</code>.
          </p>

          {/* Section 1: Quick Start */}
          <SectionHeading id="quick-start">Quick Start</SectionHeading>
          <div className="body-md space-y-4 mb-8">
            <p>
              Get your Discord Rich Presence up and running in three steps.
            </p>

            <div>
              <p className="title-sm mb-3">1. Install</p>
              <TerminalBlock>
                <span className="text-semantic-success">$</span> git clone https://github.com/fxckcode/discord-rpc-tui.git<br />
                <span className="text-semantic-success">$</span> cd discord-rpc-tui<br />
                <span className="text-semantic-success">$</span> bash install.sh
              </TerminalBlock>
            </div>

            <div>
              <p className="title-sm mb-3">2. Start the service</p>
              <TerminalBlock>
                <span className="text-semantic-success">$</span> systemctl --user start discord-rpc-tui
              </TerminalBlock>
            </div>

            <div>
              <p className="title-sm mb-3">3. Verify it works</p>
              <TerminalBlock>
                <span className="text-semantic-success">$</span> rpc-tui set-activity &apos;{`{`}&quot;state&quot;:&quot;Hello Discord!&quot;,&quot;type&quot;:0{`}`}&apos;
              </TerminalBlock>
              <p className="text-muted-soft text-sm">
                Your Discord profile should now show &quot;Playing Hello Discord!&quot;. If it doesn&apos;t,
                check the{' '}
                <Link href="#troubleshooting" className="text-primary hover:underline">
                  Troubleshooting
                </Link>{' '}
                section.
              </p>
            </div>
          </div>

          <hr className="border-hairline my-14" />

          {/* Section 2: Setup Discord Developer Portal */}
          <SectionHeading id="setup-discord">Setup Discord Developer Portal</SectionHeading>
          <div className="body-md space-y-5 mb-8">
            <p>
              To use custom images and your own application identity, you need to register
              an application on Discord&apos;s Developer Portal.
            </p>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">1.</span>
                Open the Discord Developer Portal
              </p>
              <p>
                Go to{' '}
                <a
                  href="https://discord.com/developers/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  discord.com/developers/applications
                </a>
              </p>
            </div>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">2.</span>
                Create a New Application
              </p>
              <p>
                Click <strong>New Application</strong> and give it a name — this will be the
                name shown in your Discord presence.
              </p>
            </div>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">3.</span>
                Open the Rich Presence section
              </p>
              <p>
                Navigate to <strong>Rich Presence</strong> in the left sidebar (or{' '}
                <strong>Artifacts</strong> depending on Discord&apos;s current UI layout).
                This is where you upload images for your presence.
              </p>
            </div>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">4.</span>
                Upload images
              </p>
              <p>
                Click <strong>Add Image(s)</strong> and select your PNG or JPG files
                (the Developer Portal only accepts static images — see below for animated GIF support).
                These images appear as the large or small icons in your Rich Presence.
              </p>
            </div>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">5.</span>
                Note the Asset Name
              </p>
              <p>
                Discord assigns an <strong>Asset Name</strong> to each uploaded image
                (e.g., <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">imagen</code>,{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">myimage</code>).
                You&apos;ll use this name in your activity configuration as{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">largeImageKey</code>.
                Asset names are <strong>case-sensitive</strong>.
              </p>
            </div>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">6.</span>
                Copy your Application ID
              </p>
              <p>
                Go to <strong>General Information</strong> and copy the{' '}
                <strong>Application ID</strong> (also called Client ID).
              </p>
            </div>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">7.</span>
                Set the Client ID in your config
              </p>
              <p>
                Paste the Application ID into your config file at{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">~/.config/discord-rpc-tui/config.json</code>.
              </p>
            </div>
          </div>

          <hr className="border-hairline my-14" />

          {/* Section 3: Configuration */}
          <SectionHeading id="configuration">Configuration</SectionHeading>
          <div className="body-md space-y-5 mb-8">
            <p>
              The config file at{' '}
              <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">~/.config/discord-rpc-tui/config.json</code>{' '}
              controls everything about your Rich Presence. Here&apos;s the full structure:
            </p>

            <ConfigBlock>
              {`{
  "clientId": "123456789012345678",
  "profiles": [
    {
      "name": "Coding",
      "activity": {
        "state": "Working on a feature",
        "details": "VS Code",
        "type": 0,
        "largeImageKey": "vscode",
        "largeImageText": "Visual Studio Code",
        "buttons": [
          { "label": "View Project", "url": "https://github.com/user/repo" }
        ]
      }
    }
  ],
  "rotationInterval": 30
}`}
            </ConfigBlock>

            <div className="space-y-4">
              <div>
                <p className="title-sm mb-1">clientId</p>
                <p className="text-muted">
                  Your Discord Application ID (step 6 above). Required.
                </p>
              </div>

              <div>
                <p className="title-sm mb-1">profiles</p>
                <p className="text-muted">
                  An array of activity profiles that rotate if you set{' '}
                  <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">rotationInterval</code>.
                  Each profile has:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                  <li>
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">name</code> — a label for the profile
                  </li>
                  <li>
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">activity</code> — the Rich Presence payload with{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">state</code>,{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">details</code>,{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">type</code>,{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">largeImageKey</code> /{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">largeImageUrl</code>,{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">buttons</code>, and more
                  </li>
                </ul>
              </div>

              <div>
                <p className="title-sm mb-1">rotationInterval</p>
                <p className="text-muted">
                  Seconds between profile rotations. Set to{' '}
                  <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">0</code> to
                  disable rotation (stays on the current profile).
                </p>
              </div>

              <div>
                <p className="title-sm mb-1">Activity type values</p>
                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-hairline">
                        <th className="text-left py-2 pr-4 font-medium text-ink">Value</th>
                        <th className="text-left py-2 pr-4 font-medium text-ink">Status</th>
                        <th className="text-left py-2 font-medium text-ink">Example</th>
                      </tr>
                    </thead>
                    <tbody className="text-body">
                      <tr className="border-b border-hairline">
                        <td className="py-2 pr-4 font-mono">0</td>
                        <td className="py-2 pr-4">Playing</td>
                        <td className="py-2">Playing Minecraft</td>
                      </tr>
                      <tr className="border-b border-hairline">
                        <td className="py-2 pr-4 font-mono">1</td>
                        <td className="py-2 pr-4">Streaming</td>
                        <td className="py-2">Streaming on Twitch</td>
                      </tr>
                      <tr className="border-b border-hairline">
                        <td className="py-2 pr-4 font-mono">2</td>
                        <td className="py-2 pr-4">Listening</td>
                        <td className="py-2">Listening to Spotify</td>
                      </tr>
                      <tr className="border-b border-hairline">
                        <td className="py-2 pr-4 font-mono">3</td>
                        <td className="py-2 pr-4">Watching</td>
                        <td className="py-2">Watching a Movie</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono">5</td>
                        <td className="py-2 pr-4">Competing</td>
                        <td className="py-2">Competing in Valorant</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p className="title-sm mb-2">Image fields — Asset Keys vs External URLs</p>
                <p className="text-muted mb-3">
                  You have two ways to set images in your Rich Presence:
                </p>
                <div className="overflow-x-auto mt-2 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-hairline">
                        <th className="text-left py-2 pr-4 font-medium text-ink">Method</th>
                        <th className="text-left py-2 pr-4 font-medium text-ink">Field</th>
                        <th className="text-left py-2 pr-4 font-medium text-ink">Source</th>
                        <th className="text-left py-2 font-medium text-ink">Animated GIF</th>
                      </tr>
                    </thead>
                    <tbody className="text-body">
                      <tr className="border-b border-hairline">
                        <td className="py-2 pr-4 font-medium">Asset Key</td>
                        <td className="py-2 pr-4 font-mono">largeImageKey / smallImageKey</td>
                        <td className="py-2 pr-4">Developer Portal (Rich Presence → Art Assets)</td>
                        <td className="py-2">❌ No</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium">External URL</td>
                        <td className="py-2 pr-4 font-mono">largeImageUrl / smallImageUrl</td>
                        <td className="py-2 pr-4">Any public HTTPS URL (Imgur, your own server, etc.)</td>
                        <td className="py-2">✅ Yes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-muted">
                  <strong>Asset Keys</strong> reference images uploaded to Discord's Developer Portal.
                  Discord only accepts <strong>static PNG/JPEG</strong> files for upload — no GIF support.
                </p>
                <p className="text-muted mt-2">
                  <strong>External URLs</strong> let you use any publicly hosted image, including animated
                  GIFs. Use image hosting services like Imgur. Supported formats:{' '}
                  <strong>jpg, png, webp, gif</strong>. This is how tools like{' '}
                  <a href="https://customrp.xyz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CustomRP</a>{' '}
                  and{' '}
                  <a href="https://vencord.dev/plugins/CustomRPC" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vencord CustomRPC</a>{' '}
                  achieve animated Rich Presence images.
                </p>
                <ConfigBlock>
                  {`{
  "activity": {
    "largeImageUrl": "https://i.imgur.com/your-animated-gif.gif",
    "largeImageText": "My animated image"
  }
}`}
                </ConfigBlock>
              </div>
            </div>
          </div>

          <hr className="border-hairline my-14" />

          {/* Section 4: Using Presences */}
          <SectionHeading id="using-presences">Using Presences from the Gallery</SectionHeading>
          <div className="body-md space-y-4 mb-8">
            <p>
              The Gallery makes it simple to try out and apply Rich Presences.
              Here&apos;s how it works:
            </p>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">1.</span>
                Browse the Gallery
              </p>
              <p>
                Head to the{' '}
                <a href="/presences" className="text-primary hover:underline">
                  Gallery page
                </a>{' '}
                and browse through curated presences organized by category — Coding, Music,
                Gaming, Creative, and Social.
              </p>
            </div>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">2.</span>
                Click a presence card
              </p>
              <p>
                Each card shows a preview of the activity. Click it to see the full detail
                page with all the configured fields.
              </p>
            </div>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">3.</span>
                Copy the command
              </p>
              <p>
                On the detail page, you&apos;ll see a terminal command like this:
              </p>
              <TerminalBlock>
                <span className="text-semantic-success">$</span> rpc-tui set-activity &apos;{`{`}{'\n  '}&quot;state&quot;: &quot;Coding in TypeScript&quot;,{'\n  '}&quot;details&quot;: &quot;VS Code&quot;,{'\n  '}&quot;type&quot;: 0,{'\n  '}&quot;largeImageKey&quot;: &quot;vscode&quot;{'\n'}{`}`}&apos;
              </TerminalBlock>
              <p>Click <strong>Copy Command</strong> to copy it to your clipboard.</p>
            </div>

            <div>
              <p className="title-sm mb-2">
                <span className="text-primary mr-2">4.</span>
                Run the command
              </p>
              <p>
                Paste the command in your terminal and press Enter. The tool updates your
                config file automatically and restarts the service. Your Discord presence
                updates within seconds.
              </p>
            </div>
          </div>

          <hr className="border-hairline my-14" />

          {/* Section 5: Troubleshooting */}
          <SectionHeading id="troubleshooting">Troubleshooting</SectionHeading>
          <div className="body-md space-y-5 mb-8">
            <div className="card p-5">
              <p className="title-sm mb-1 text-semantic-error">Connection failed</p>
              <p className="text-muted">
                Make sure Discord is running on your system.{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">discord-rpc-tui</code>{' '}
                requires an active Discord client to establish the RPC connection.
              </p>
            </div>

            <div className="card p-5">
              <p className="title-sm mb-1 text-semantic-error">Image not showing</p>
              <p className="text-muted">
                <strong>If using asset keys</strong> — check that the asset name in your config matches exactly (including case)
                the name shown in the Discord Developer Portal. Asset names are
                case-sensitive —{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">MyImage</code> and{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">myimage</code> are
                different.
              </p>
              <p className="text-muted mt-2">
                <strong>If using external URLs</strong> — make sure the URL is publicly accessible (HTTPS).
                Discord only loads images from HTTPS URLs. Test the URL in your browser first.
                If your image is a GIF and it's not animating, check that you're using{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">largeImageUrl</code>{' '}
                (not <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">largeImageKey</code>)
                — asset keys never animate.
              </p>
            </div>

            <div className="card p-5">
              <p className="title-sm mb-1 text-semantic-error">Service not running</p>
              <p className="text-muted mb-3">
                If the systemd service isn&apos;t active, start it manually:
              </p>
              <TerminalBlock>
                <span className="text-semantic-success">$</span> systemctl --user start discord-rpc-tui
              </TerminalBlock>
              <p className="text-muted">
                You can also check the service status with{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">systemctl --user status discord-rpc-tui</code>.
              </p>
            </div>

            <div className="card p-5">
              <p className="title-sm mb-1 text-semantic-error">Permission denied</p>
              <p className="text-muted">
                Make sure{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">rpc-tui</code> is
                in your <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">PATH</code>.
                Restart your shell after installation or add the install directory to your
                PATH manually in{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">~/.bashrc</code> or{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">~/.zshrc</code>.
              </p>
            </div>
          </div>

          <hr className="border-hairline my-14" />

          {/* Section 6: AI Agent Integration (MCP) */}
          <SectionHeading id="mcp-integration">AI Agent Integration (MCP)</SectionHeading>
          <div className="body-md space-y-5 mb-8">
            <p>
              RPCraft includes a{' '}
              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Model Context Protocol
              </a>{' '}
              (MCP) server that lets AI coding agents control your Discord Rich Presence
              programmatically. Your agent can set activities, switch profiles, and check
              connection status — all through natural language.
            </p>

            <div className="card p-5 !border-primary/20 !bg-primary/[0.02]">
              <p className="title-sm mb-1">Start the MCP server</p>
              <p className="text-muted mb-3">
                First, make sure the service is running, then start the MCP server:
              </p>
              <TerminalBlock>
                <span className="text-semantic-success">$</span> rpc-tui mcp
              </TerminalBlock>
              <p className="text-muted text-sm">
                This starts the server in <strong>stdio</strong> mode — the default for CLI agents.
                For HTTP clients, use{' '}
                <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">rpc-tui mcp --sse --port 3100</code>.
              </p>
            </div>

            <div>
              <p className="title-sm mb-3">Setup by agent</p>

              <div className="space-y-4">
                <div className="card p-5">
                  <p className="title-sm mb-1">Hermes Agent</p>
                  <p className="text-muted mb-2">
                    Add as an MCP server via the CLI:
                  </p>
                  <TerminalBlock>
                    <span className="text-semantic-success">$</span> hermes mcp add rpcraft --command &quot;rpc-tui mcp&quot;<br />
                    <span className="text-semantic-success">$</span> hermes mcp test rpcraft
                  </TerminalBlock>
                  <p className="text-muted-soft text-sm">
                    Or add it to{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">~/.hermes/config.yaml</code>:
                  </p>
                  <ConfigBlock>
{`mcp:
  servers:
    rpcraft:
      command: rpc-tui
      args: [mcp]`}
                  </ConfigBlock>
                  <p className="text-muted-soft text-sm mt-2">
                    After adding, tell Hermes: &quot;Set my Discord presence to Coding in TypeScript&quot;.
                  </p>
                </div>

                <div className="card p-5">
                  <p className="title-sm mb-1">Claude Code</p>
                  <p className="text-muted mb-2">
                    Add to your project&apos;s{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">CLAUDE.md</code> or global config:
                  </p>
                  <ConfigBlock>
{`{
  "mcpServers": {
    "rpcraft": {
      "command": "rpc-tui",
      "args": ["mcp"]
    }
  }
}`}
                  </ConfigBlock>
                  <p className="text-muted-soft text-sm mt-2">
                    Claude Code discovers MCP tools automatically. Try: &quot;Update my Discord status to show I&apos;m coding&quot;.
                  </p>
                </div>

                <div className="card p-5">
                  <p className="title-sm mb-1">Codex CLI / OpenCode</p>
                  <p className="text-muted mb-2">
                    Add the MCP server in{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">opencode.json</code>:
                  </p>
                  <ConfigBlock>
{`{
  "mcpServers": {
    "rpcraft": {
      "command": "rpc-tui",
      "args": ["mcp"]
    }
  }
}`}
                  </ConfigBlock>
                  <p className="text-muted-soft text-sm">
                    Both Codex CLI and OpenCode follow the same format.
                  </p>
                </div>

                <div className="card p-5">
                  <p className="title-sm mb-1">Cursor</p>
                  <p className="text-muted mb-2">
                    Add to{' '}
                    <code className="font-mono text-sm bg-surface-strong rounded px-1.5 py-0.5">.cursor/mcp.json</code>:
                  </p>
                  <ConfigBlock>
{`{
  "mcpServers": {
    "rpcraft": {
      "command": "rpc-tui",
      "args": ["mcp"]
    }
  }
}`}
                  </ConfigBlock>
                  <p className="text-muted-soft text-sm">
                    Cursor loads MCP servers from the project root automatically.
                  </p>
                </div>

                <div className="card p-5">
                  <p className="title-sm mb-1">Gemini CLI</p>
                  <p className="text-muted mb-2">
                    Configure via commands:
                  </p>
                  <TerminalBlock>
                    <span className="text-semantic-success">$</span> gemini config set mcpServers.rpcraft.command rpc-tui<br />
                    <span className="text-semantic-success">$</span> gemini config set mcpServers.rpcraft.args &apos;[&quot;mcp&quot;]&apos;
                  </TerminalBlock>
                </div>
              </div>
            </div>

            <div>
              <p className="title-sm mb-3 mt-6">Available MCP Tools</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-hairline">
                      <th className="text-left py-2 pr-4 font-medium text-ink">Tool</th>
                      <th className="text-left py-2 pr-4 font-medium text-ink">Description</th>
                      <th className="text-left py-2 font-medium text-ink">Key params</th>
                    </tr>
                  </thead>
                  <tbody className="text-body">
                    <tr className="border-b border-hairline">
                      <td className="py-2 pr-4 font-mono text-sm">set_activity</td>
                      <td className="py-2 pr-4">Set custom Rich Presence</td>
                      <td className="py-2">state, details, type, largeImageKey</td>
                    </tr>
                    <tr className="border-b border-hairline">
                      <td className="py-2 pr-4 font-mono text-sm">set_profile</td>
                      <td className="py-2 pr-4">Activate a saved profile</td>
                      <td className="py-2">name</td>
                    </tr>
                    <tr className="border-b border-hairline">
                      <td className="py-2 pr-4 font-mono text-sm">list_profiles</td>
                      <td className="py-2 pr-4">List saved profiles</td>
                      <td className="py-2">—</td>
                    </tr>
                    <tr className="border-b border-hairline">
                      <td className="py-2 pr-4 font-mono text-sm">get_status</td>
                      <td className="py-2 pr-4">Check connection status</td>
                      <td className="py-2">—</td>
                    </tr>
                    <tr className="border-b border-hairline">
                      <td className="py-2 pr-4 font-mono text-sm">connect</td>
                      <td className="py-2 pr-4">Connect to Discord RPC</td>
                      <td className="py-2">—</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-mono text-sm">disconnect</td>
                      <td className="py-2 pr-4">Disconnect from Discord</td>
                      <td className="py-2">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p className="body-sm text-muted-soft mt-4">
              💡 <strong>Pro tip:</strong> Once the MCP server is configured, you can ask your agent
              things like &quot;Set my Discord status to studying&quot; or &quot;Rotate between my coding and
              music profiles every 10 minutes&quot; — and it just works.
            </p>
          </div>

          <hr className="border-hairline my-14" />

          <div className="card p-6 text-center">
            <p className="body-md mb-3">Ready to try some presences?</p>
            <a href="/presences" className="btn-primary no-underline">
              Browse the Gallery
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
