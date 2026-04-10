export const prisma = new Proxy(
  {},
  {
    get() {
      throw new Error("Prisma is disabled: application runs on Cloudflare D1");
    },
  },
);
