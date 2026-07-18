#!/usr/bin/env node
/* eslint-disable perfectionist/sort-modules */
/* eslint-disable no-undef */

import { spawn } from "node:child_process";
import os from "node:os";

class EnvironmentConfig {
  static getLocalIp() {
    return (
      Object.values(os.networkInterfaces())
        .flat()
        .find((iface) => iface?.family === "IPv4" && !iface?.internal)
        ?.address || "127.0.0.1"
    );
  }

  static getPlatform() {
    return process.argv
      .slice(2)
      .find((arg) => arg === "android" || arg === "ios");
  }

  static getPnpmCommand() {
    return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  }

  static getSpawnOptions() {
    const ttyShim =
      `--import="data:text/javascript,` +
      `Object.defineProperty(process.stdin,'isTTY',{get:()=>true});` +
      `Object.defineProperty(process.stdout,'isTTY',{get:()=>true});` +
      `process.stdout.columns=${process.stdout.columns || 80};` +
      `process.stdout.rows=${process.stdout.rows || 24};` +
      `process.stdin.setRawMode=()=>{};"`;

    return {
      env: {
        ...process.env,
        FORCE_COLOR: "1",
        NODE_OPTIONS: ttyShim,
      },
      stdio: ["pipe", "pipe", "inherit"],
    };
  }
}

class ProcessWrapper {
  get isFinished() {
    return (
      !this.instance ||
      this.instance.exitCode !== null ||
      this.instance.signalCode !== null
    );
  }

  constructor(name, command, args, options, isRawInputRequired = false) {
    this.name = name;
    this.command = command;
    this.args = args;
    this.options = options;
    this.isRawInputRequired = isRawInputRequired;
    this.instance = null;
  }

  kill(signal = "SIGINT") {
    if (
      this.instance?.pid &&
      this.instance.exitCode === null &&
      this.instance.signalCode === null
    ) {
      try {
        this.instance.kill(signal);
      } catch {
        /* Safely ignored */
      }
    }
  }

  spawn(onStdoutData, onExitCallback) {
    this.instance = spawn(this.command, this.args, this.options);

    this.instance.stdout.on("data", onStdoutData);
    this.instance.on("exit", onExitCallback);
    this.instance.on("error", (err) => {
      console.error(`❌ Failed to start process ${this.name}:`, err);
      onExitCallback(1);
    });
  }

  writeToStdin(data) {
    if (this.instance?.stdin?.writable) {
      this.instance.stdin.write(data);
    }
  }
}

class TerminalController {
  #currentFocus = null;

  initialize(onInterruptSignal) {
    if (!process.stdin.isTTY) return;

    process.stdin.resume();
    process.stdin.on("data", (data) => {
      if (
        this.#currentFocus?.isRawInputRequired &&
        data.toString() === "\u0003"
      ) {
        onInterruptSignal();

        return;
      }

      this.#currentFocus?.writeToStdin(data);
    });
  }

  restore() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }

    process.stdout.write("\x1b[?25h");
  }

  switchFocus(processWrapper) {
    this.#currentFocus = processWrapper;

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(processWrapper?.isRawInputRequired ?? false);
    }
  }
}

class Orchestrator {
  constructor(pnpmCmd, platform, lanIp) {
    this.pnpmCmd = pnpmCmd;
    this.platform = platform;
    this.lanIp = lanIp;

    this.terminal = new TerminalController();
    this.vite = null;
    this.capacitor = null;

    this.isClosing = false;
    this.exitCodeTarget = 0;
  }

  evaluateShutdownState() {
    if (this.vite.isFinished && this.capacitor.isFinished) {
      this.terminal.restore();
      process.exit(this.exitCodeTarget);
    }
  }

  handleProcessExit(origin, code) {
    if (this.isClosing) return this.evaluateShutdownState();

    this.isClosing = true;
    this.exitCodeTarget = code;

    if (origin === "Vite") this.capacitor.kill("SIGINT");
    if (origin === "Capacitor") this.vite.kill("SIGINT");

    this.evaluateShutdownState();
  }

  handleTerminationSignal() {
    if (this.isClosing) {
      this.vite.kill("SIGKILL");
      this.capacitor.kill("SIGKILL");
      this.terminal.restore();
      process.exit(1);
    }

    this.isClosing = true;
    this.exitCodeTarget = 130;

    this.vite.kill("SIGINT");
    this.capacitor.kill("SIGINT");
    this.evaluateShutdownState();
  }

  launchCapacitor() {
    console.log(`\nStarting Capacitor on ${this.platform}...\n`);
    this.terminal.switchFocus(this.capacitor);

    let isCapacitorReady = false;
    let buffer = "";

    this.capacitor.spawn(
      (chunk) => {
        process.stdout.write(chunk);

        if (!isCapacitorReady) {
          buffer = (buffer + chunk.toString()).slice(-1000);

          if (/App running/i.test(buffer)) {
            isCapacitorReady = true;

            this.terminal.switchFocus(this.vite);
          }
        }
      },
      (code) => this.handleProcessExit("Capacitor", code ?? 1),
    );
  }

  launchVite() {
    console.log("Starting Vite dev server...");
    this.terminal.switchFocus(this.vite);

    let isViteReady = false;
    let buffer = "";

    this.vite.spawn(
      (chunk) => {
        process.stdout.write(chunk);

        if (!isViteReady) {
          buffer = (buffer + chunk.toString()).slice(-1000);

          if (/show help/i.test(buffer)) {
            isViteReady = true;

            this.launchCapacitor();
          }
        }
      },
      (code) => this.handleProcessExit("Vite", code ?? 0),
    );
  }

  setupSystemSignals() {
    process.on("SIGINT", () => this.handleTerminationSignal());
    process.on("SIGTERM", () => this.handleTerminationSignal());
  }

  start() {
    this.terminal.initialize(() => this.handleTerminationSignal());
    this.setupSystemSignals();

    const spawnOpts = EnvironmentConfig.getSpawnOptions();

    this.vite = new ProcessWrapper(
      "Vite",
      this.pnpmCmd,
      [
        "exec",
        "vite",
        "--host",
        "0.0.0.0",
        "--port",
        "8100",
        "--clearScreen",
        "false",
      ],
      {
        ...spawnOpts,
        env: {
          ...spawnOpts.env,
          VITE_API_BASE_URL: `http://${this.lanIp}:8787`,
        },
      },
      false,
    );

    this.capacitor = new ProcessWrapper(
      "Capacitor",
      this.pnpmCmd,
      [
        "exec",
        "cap",
        "run",
        this.platform,
        "--no-sync",
        "--live-reload",
        "--host",
        this.lanIp,
        "--port",
        "8100",
      ],
      spawnOpts,
      true,
    );

    this.launchVite();
  }
}

const main = async () => {
  const pnpmCmd = EnvironmentConfig.getPnpmCommand();
  const platform = EnvironmentConfig.getPlatform();
  const lanIp = EnvironmentConfig.getLocalIp();

  if (!platform) {
    console.error('❌ Specify platform: "android" or "ios"');
    process.exit(1);
  }

  const orchestrator = new Orchestrator(pnpmCmd, platform, lanIp);

  orchestrator.start();
};

main().catch(() => process.exit(1));
