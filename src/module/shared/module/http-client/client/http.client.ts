import { Injectable } from '@nestjs/common';
import { HttpClientException } from '@src/module/shared/module/http-client/exception/http-client.exception';

@Injectable()
export class HttpClient {
  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`[${response.status}] ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('Underlying HTTP Client Error:', error);
      throw new HttpClientException(
        `Error fetching data from ${url}: ${error.message}`,
        error
      );
    }
  }
}
