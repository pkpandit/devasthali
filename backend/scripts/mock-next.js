// Test mock for Next.js internal runtime modules (next/headers, next/cache, server-only)
module.exports = {
  headers: async () => ({
    get: (name) => {
      if (name === "x-forwarded-for") return "127.0.0.1";
      if (name === "x-real-ip") return "127.0.0.1";
      return null;
    },
  }),
  cookies: async () => ({
    get: () => ({ value: "mock-token" }),
  }),
  revalidatePath: () => {},
  revalidateTag: () => {},
};
