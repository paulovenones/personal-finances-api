import Fastify from "fastify";

const app = Fastify();

app.get("/", () => {
  return { name: "Paulo Venones da Silva" };
});

app
  .listen({
    port: 3333,
    host: "0.0.0.0",
  })
  .then((url) => {
    console.log(`HTTP server running on ${url}`);
  });
