// Small helpers so every route returns a clear, interface-voice error on
// failure, never a raw exception (CONTEXT.md section 8).
import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(message: string, status = 400, detail?: string) {
  return NextResponse.json({ error: message, detail }, { status });
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
