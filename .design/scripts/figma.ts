// figma — canonical Figma local-cache toolchain (collect / read / list / status).
//
// The pixel-perfect build reads the maquette from a versioned local cache instead
// of the rate-limited Figma Dev Mode MCP. One `collect` pulls the whole designated
// page in a bounded number of REST calls and splits it per top-level frame; `read`
// then serves any node losslessly, 100% offline. `list`/`status` expose and audit
// the curated named index. See specs/004-figma-local-cache/.
//
// Run:
//   node [--env-file=.env.development] --import tsx .design/scripts/figma.ts <command> [args] [--flags]
//   npm run figma -- <command> [args]                  (wraps --import tsx)
//
// --env-file is only needed by the network commands (collect, status freshness).
// read / list are offline and read no secret.

import { runCollect } from "./lib/collect";
import { runList, runStatus } from "./lib/index-status";
import { runRead } from "./lib/read";

export interface ParsedArgs {
	/** Positional arguments, in order (e.g. the node id / target name). */
	positionals: string[];
	/** `--flag` (→ true) and `--flag=value` (→ value) options. */
	flags: Map<string, string | true>;
}

/** Split raw argv into positionals and `--flag[=value]` options. */
export function parseArgs(rest: string[]): ParsedArgs {
	const positionals: string[] = [];
	const flags = new Map<string, string | true>();
	for (const a of rest) {
		if (a.startsWith("--")) {
			const body = a.slice(2);
			const eq = body.indexOf("=");
			if (eq === -1) flags.set(body, true);
			else flags.set(body.slice(0, eq), body.slice(eq + 1));
		} else {
			positionals.push(a);
		}
	}
	return { positionals, flags };
}

/** A command returns its process exit code (0 ok · 1 usage/input · 2 network · 3 incoherent). */
export type CommandHandler = (args: ParsedArgs) => number | Promise<number>;

// Sub-command registry. Each command module is wired in by its own task
// (read → T007, collect → T014, list/status → T018/T022). Handlers are loaded
// lazily so the router stays runnable as the chain is built up incrementally.
const commands: Record<string, CommandHandler> = {};

commands.read = runRead;
commands.collect = runCollect;
commands.list = runList;
commands.status = runStatus;

const USAGE = `figma — local Figma cache & offline reader

Usage:
  figma collect [--page=<id>] [--no-images] [--only=<frameId>] [--images-only] [--json]
      Pull the designated page in a bounded number of calls, split it per
      top-level frame, download placed images. Resumable on quota. (network)
      --images-only fetches placed images for the cached frames (no structure pull).

  figma read <nodeId|name> [--depth=N] [--leaves] [--bp=desktop|tablet|mobile] [--raw] [--images]
      Print the complete, lossless subtree of a node from the cache. (offline)
      --images: list only the image slots (id · position · size · fit · asset).

  figma list [--json]
      List the curated named index targets (name · description · nodes). (offline)

  figma status [--offline] [--json]
      Report cache freshness (1 light call) + index↔cache consistency. (network)

Network commands (collect, status freshness) need --env-file=.env.development.
read and list never touch the network.`;

async function main(): Promise<void> {
	const argv = process.argv.slice(2);
	const cmd = argv[0];
	if (!cmd || cmd === "--help" || cmd === "-h") {
		console.log(USAGE);
		process.exit(cmd ? 0 : 1);
	}
	const handler = commands[cmd];
	if (!handler) {
		console.error(`Unknown command: ${cmd}\n\n${USAGE}`);
		process.exit(1);
	}
	const code = await handler(parseArgs(argv.slice(1)));
	process.exit(code);
}

main().catch((err: unknown) => {
	console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
	process.exit(1);
});
