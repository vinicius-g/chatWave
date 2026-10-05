// Extensão dos tipos do NextAuth para incluir role e banned
// Referência: https://next-auth.js.org/getting-started/typescript

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      banned: boolean;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    banned: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    banned: boolean;
  }
}
