import GoogleProvider from "next-auth/providers/google";

import NextAuth from "next-auth"
import { prismaClient } from "@/app/lib/db";

const handler = NextAuth({
    providers: [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID ?? "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
      ],
      callbacks: {
        async signIn(params) {
            console.log(params);
            if(!params.user.email){
              return false
            }
            try {
                await prismaClient.user.create({
                    data: {
                        email: params.user.email, 
                        provider: "Google"
                    }
                });
                return true;
            } catch (error) {
                console.error("Error while signing in:", error);
                return false; 
            }
        }
    }
});

export { handler as GET, handler as POST }