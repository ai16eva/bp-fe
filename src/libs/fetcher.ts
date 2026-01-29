export class FetcherError extends Error {
  public statusCode: number;
  public res: Response;
  public body?: any;

  constructor(message: string, statusCode: number, origResponse: Response) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.res = origResponse;
  }
}

export default async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  try {
    const res = await fetch(input, {
      ...init,
      cache: 'no-store',
    });

    if (res.ok) {
      if (res.status === 204) {
        return {
          statusCode: 204,
        } as JSON;
      }
      return (await res.json()) as JSON;
    }

    const error = new FetcherError(res.statusText, res.status, res);

    const isResponseJson = res.headers
      .get('content-type')
      ?.includes('application/json');

    if (isResponseJson) {
      let data;

      try {
        data = (await res.json()) as any;
        error.body = data;
        error.message = data?.message || data?.data?.message;
      } catch (err: any) {
        error.message = err.message;
      }
    }

    const isAuthError = (() => {
      if (res.status === 401) return true;
      if (res.status === 403) {
        const errorMessage = error.body?.message?.toLowerCase?.() || '';
        const authKeywords = ['token', 'signature', 'authentication', 'expired', 'invalid'];
        return authKeywords.some(keyword => errorMessage.includes(keyword));
      }
      return false;
    })();

    if (isAuthError) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('session-expired'));
      }
    }

    return await Promise.reject(error);
  } catch (error: any) {
    return await Promise.reject(error);
  }
}
