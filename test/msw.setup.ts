import { setupServer } from 'msw/node';

export const configureMswServer = () => {
  const server = setupServer();

  server.listen({
    onUnhandledRequest(req, print) {
      const url = new URL(req.url);
      if (
        url.hostname.includes('localhost') ||
        url.hostname.includes('127.0.0.1') ||
        url.hostname.includes('[::1]')
      ) {
        return;
      }
      print.warning();
    },
  });

  return server;
};
