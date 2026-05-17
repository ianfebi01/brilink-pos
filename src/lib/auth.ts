import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function hashPassword( password: string ) {
  return crypto.createHash( "sha256" ).update( password ).digest( "hex" );
}

export const authOptions: NextAuthOptions = {
  adapter   : PrismaAdapter( prisma ),
  providers : [
    CredentialsProvider( {
      name        : "Credentials",
      credentials : {
        username : { label : "Username", type : "text" },
        password : { label : "Password", type : "password" },
      },
      async authorize( credentials ) {
        if ( !credentials?.username || !credentials?.password ) {
          return null;
        }

        const user = await prisma.user.findUnique( {
          where : { username : credentials.username },
        } );

        if ( !user ) {
          return null;
        }

        const isPasswordValid = user.password === hashPassword( credentials.password );

        if ( !isPasswordValid ) {
          return null;
        }

        return {
          id       : user.id,
          name     : user.name,
          username : user.username,
          role     : user.role,
        };
      },
    } ),
  ],
  callbacks : {
    async jwt( { token, user } ) {
      if ( user ) {
        token.id = user.id;
        token.username = ( user as any ).username;
        token.role = ( user as any ).role;
      }
      
      return token;
    },
    async session( { session, token } ) {
      if ( token && session.user ) {
        ( session.user as any ).id = token.id;
        ( session.user as any ).username = token.username;
        ( session.user as any ).role = token.role;
      }
      
      return session;
    },
  },
  pages : {
    signIn : "/login",
  },
  session : {
    strategy : "jwt",
  },
  secret : process.env.NEXTAUTH_SECRET,
};
