import { resolveDatabaseUrl } from "@/lib/database-url";

export function register() {
  if (!process.env.DATABASE_URL) {
    const url = resolveDatabaseUrl();
    if (url) process.env.DATABASE_URL = url;
  }
}
