import { openFileSync } from "../lib/open-file";

async function run(): Promise<void> {
  const result: string | null = openFileSync();
  console.log(result);
}

(run as () => Promise<void>)()
  .catch((err: Error): never => {
    console.error(err.stack);
    return process.exit(1) as never;
  });
