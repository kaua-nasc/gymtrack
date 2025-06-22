import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpClient {
  async get<T>(url: string, options: Record<string, any>): Promise<T> {
    const res = await fetch(url, options);

    const text = await res.text(); // Lê o corpo da resposta uma única vez

    if (!res.ok) {
      throw new Error(`Failed to fetch ${text}`);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Failed to parse JSON: ${text}`);
    }
  }
}
