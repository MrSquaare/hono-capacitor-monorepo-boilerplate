#!/usr/bin/env node
/* eslint-disable perfectionist/sort-classes */
/* eslint-disable no-undef */
import { spawn } from "node:child_process";
import os from "node:os";

const VITE_PORT = 8100;
const API_PORT = 8787;
const READY_PATTERNS = {
  capacitor: /App running/i,
  vite: /show help/i,
};

const TTY_SHIM = [
  "const d = (o, k, v) => Object.defineProperty(o, k, { get: () => v });",
  "d(process.stdin, 'isTTY', true);",
  "d(process.stdout, 'isTTY', true);",
  `process.stdout.columns = ${process.stdout.columns || 80};`,
  `process.stdout.rows = ${process.stdout.rows || 24};`,
  "process.stdin.setRawMode = () => {};",
].join(" ");
const TERMINAL_CODES = {
  ctrlC: "\u0003",
  showCursor: "\x1b[?25h",
};

const getLocalIp = () => {
  const candidate = Object.values(os.networkInterfaces())
    .flat()
    .find((iface) => iface?.family === "IPv4" && !iface.internal);

  return candidate?.address || "127.0.0.1";
};

const getPlatform = () => {
  const platform = process.argv
    .slice(2)
    .find((a) => a === "android" || a === "ios");

  if (!platform) {
    console.error('❌ Specify platform: "android" or "ios"');
    process.exit(1);
  }

  return platform;
};

const getPnpmCommand = () => {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
};

const buildSpawnOptions = (extraEnv = {}) => {
  return {
    env: {
      ...process.env,
      ...extraEnv,
      FORCE_COLOR: "1",
      NODE_OPTIONS: `--import="data:text/javascript,${encodeURIComponent(TTY_SHIM)}"`,
    },
    stdio: ["pipe", "pipe", "inherit"],
  };
};

class ManagedProcess {
  state = "pending";

  get canExit() {
    return this.state !== "running";
  }

  get isDone() {
    return this.state === "exited" || this.state === "failed";
  }

  #dataListeners = new Set();
  #exitListeners = new Set();
  #instance = null;
  #onExit = null;

  constructor(name, command, args, options, needsRawInput = false) {
    this.name = name;
    this.command = command;
    this.args = args;
    this.options = options;
    this.needsRawInput = needsRawInput;
  }

  spawn(onExit) {
    this.state = "running";
    this.#instance = spawn(this.command, this.args, this.options);
    this.#onExit = onExit;

    this.#instance.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);

      for (const listener of this.#dataListeners) {
        listener(chunk);
      }
    });
    this.#instance.on("exit", (code, signal) => {
      const exitCode =
        code !== null
          ? code
          : signal
            ? 128 + (os.constants.signals[signal] || 0)
            : 0;

      this.#exit("exited", exitCode);
    });
    this.#instance.on("error", (err) => {
      console.error(`❌ Failed to spawn "${this.name}":`, err.message);

      this.#exit("failed", 1);
    });
  }

  kill(signal = "SIGINT") {
    if (!this.isDone) {
      try {
        this.#instance?.kill(signal);
      } catch {
        // Do nothing
      }
    }
  }

  waitForOutput(pattern) {
    return new Promise((resolve) => {
      if (this.isDone) {
        resolve();

        return;
      }

      let buffer = "";

      const onData = (chunk) => {
        buffer = (buffer + chunk.toString()).slice(-2000);

        if (pattern.test(buffer)) {
          this.#dataListeners.delete(onData);
          resolve();
        }
      };

      const onExit = () => {
        this.#dataListeners.delete(onData);
        resolve();
      };

      this.#dataListeners.add(onData);
      this.#exitListeners.add(onExit);
    });
  }

  writeToStdin(data) {
    if (this.#instance?.stdin?.writable) {
      this.#instance.stdin.write(data);
    }
  }

  #exit(state, code) {
    if (this.isDone) return;

    this.state = state;

    this.#onExit?.(code);

    for (const listener of this.#exitListeners) {
      listener();
    }
  }
}

class TerminalController {
  #focused = null;

  initialize(onInterrupt) {
    if (!process.stdin.isTTY) return;

    process.stdin.resume();
    process.stdin.on("data", (data) => {
      if (
        this.#focused?.needsRawInput &&
        data.toString() === TERMINAL_CODES.ctrlC
      ) {
        onInterrupt();

        return;
      }

      this.#focused?.writeToStdin(data);
    });
  }

  focus(managedProcess) {
    this.#focused = managedProcess;

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(managedProcess?.needsRawInput ?? false);
    }
  }

  restore() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    process.stdout.write(TERMINAL_CODES.showCursor);
  }
}

class Orchestrator {
  #terminal = new TerminalController();
  #capacitor;
  #vite;
  #isExiting = false;
  #exitCode = 0;

  constructor(platform, lanIp) {
    const pnpm = getPnpmCommand();

    this.#vite = new ManagedProcess(
      "Vite",
      pnpm,
      [
        "exec",
        "vite",
        "--host",
        "0.0.0.0",
        "--port",
        String(VITE_PORT),
        "--clearScreen",
        "false",
      ],
      buildSpawnOptions({ VITE_API_BASE_URL: `http://${lanIp}:${API_PORT}` }),
      false,
    );

    this.#capacitor = new ManagedProcess(
      "Capacitor",
      pnpm,
      [
        "exec",
        "cap",
        "run",
        platform,
        "--no-sync",
        "--live-reload",
        "--host",
        lanIp,
        "--port",
        String(VITE_PORT),
      ],
      buildSpawnOptions(),
      true,
    );
  }

  async start() {
    this.#terminal.initialize(() => this.#handleTerminationSignal());
    process.on("SIGINT", () => this.#handleTerminationSignal());
    process.on("SIGTERM", () => this.#handleTerminationSignal());

    console.log("Starting Vite dev server...");
    this.#vite.spawn((code) => {
      this.#handleChildExit(this.#vite, code);
    });
    this.#terminal.focus(this.#vite);
    await this.#vite.waitForOutput(READY_PATTERNS.vite);

    if (this.#vite.isDone) return;

    console.log(`\nStarting Capacitor on ${this.#capacitor.args[3]}...\n`);
    this.#capacitor.spawn((code) => {
      this.#handleChildExit(this.#capacitor, code);
    });
    this.#terminal.focus(this.#capacitor);
    await this.#capacitor.waitForOutput(READY_PATTERNS.capacitor);

    if (this.#capacitor.isDone) return;

    this.#terminal.focus(this.#vite);
  }

  #handleChildExit(source, code) {
    if (this.#isExiting) return this.#maybeExit();

    this.#isExiting = true;
    this.#exitCode = code;

    const other = source === this.#vite ? this.#capacitor : this.#vite;

    other.kill("SIGINT");

    this.#maybeExit();
  }

  #handleTerminationSignal() {
    if (this.#isExiting) {
      this.#vite.kill("SIGKILL");
      this.#capacitor.kill("SIGKILL");
      this.#terminal.restore();
      process.exit(1);

      return;
    }

    this.#isExiting = true;
    this.#exitCode = 130;

    this.#vite.kill("SIGINT");
    this.#capacitor.kill("SIGINT");

    this.#maybeExit();
  }

  #maybeExit() {
    if (this.#vite.canExit && this.#capacitor.canExit) {
      this.#terminal.restore();
      process.exit(this.#exitCode);
    }
  }
}

const platform = getPlatform();
const lanIp = getLocalIp();

new Orchestrator(platform, lanIp).start().catch((err) => {
  console.error("❌ Failed to start dev environment:", err);
  process.exit(1);
});
