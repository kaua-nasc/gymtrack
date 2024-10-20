import { Injectable } from '@nestjs/common';

@Injectable()
export class HttpClient {
  async get<T>(url: string, options: Record<string, any>): Promise<T> {
    const res = await fetch(url, options);
    if (!res.ok) {
      const errorMessage = await res.text(); // or res.json() if the response is a JSON object
      throw new Error(`Failed to fetch ${errorMessage}`);
    }
    return (await res.json()) as T;
  }
}
