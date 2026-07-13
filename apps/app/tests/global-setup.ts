import fs from "fs";
import path from "path";

async function globalSetup() {
  const nycDir = path.join(process.cwd(), ".nyc_output/");

  if (fs.existsSync(nycDir)) {
    fs.rmSync(nycDir, { force: true, recursive: true });
  }

  const coverageDir = path.join(process.cwd(), "coverage/");

  if (fs.existsSync(coverageDir)) {
    fs.rmSync(coverageDir, { force: true, recursive: true });
  }
}

export default globalSetup;
