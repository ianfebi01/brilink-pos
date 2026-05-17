import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLES, ROUTE_PERMISSIONS, DEFAULT_REDIRECTS } from "./lib/rbac";

export default withAuth(
  function middleware( req ) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith( "/login" );

    if ( isAuthPage ) {
      if ( isAuth ) {
        const role = ( token.role as any ) || ROLES.ADMIN;
        
        return NextResponse.redirect( new URL( DEFAULT_REDIRECTS[role as keyof typeof DEFAULT_REDIRECTS], req.url ) );
      }
      
      return null;
    }

    if ( !isAuth ) {
      let from = req.nextUrl.pathname;
      if ( req.nextUrl.search ) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL( `/login?from=${encodeURIComponent( from )}`, req.url )
      );
    }

    // Role-based protection
    const role = ( token.role as string ) || ROLES.ADMIN;
    const path = req.nextUrl.pathname;

    const allowedRoutes = ROUTE_PERMISSIONS[role as keyof typeof ROUTE_PERMISSIONS] || [];
    
    // Check if the current path (or a prefix) is allowed
    const isAllowed = allowedRoutes.some( allowedPath => {
      if ( allowedPath === "/" ) return path === "/";
      
      return path.startsWith( allowedPath );
    } );

    if ( !isAllowed ) {
      const redirectUrl = DEFAULT_REDIRECTS[role as keyof typeof DEFAULT_REDIRECTS] || "/transactions";
      
      return NextResponse.redirect( new URL( redirectUrl, req.url ) );
    }
  },
  {
    callbacks : {
      authorized : () => true, // We handle logic in the middleware function
    },
  }
);

export const config = {
  matcher : [
    "/",
    "/transactions/:path*",
    "/fee-rules/:path*",
    "/investments/:path*",
    "/login",
  ],
};
