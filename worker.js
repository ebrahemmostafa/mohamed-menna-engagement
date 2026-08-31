export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    if (response.status === 404 && request.method === "GET") {
      const url = new URL(request.url);
      if (!url.pathname.split("/").pop().includes(".")) {
        return env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
      }
    }

    return response;
  },
};
