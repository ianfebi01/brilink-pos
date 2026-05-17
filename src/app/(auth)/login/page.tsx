"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState( "" );
  const [password, setPassword] = useState( "" );
  const [loading, setLoading] = useState( false );

  const handleLogin = async ( e: React.FormEvent ) => {
    e.preventDefault();
    setLoading( true );
    try {
      const res = await signIn( "credentials", {
        username,
        password,
        redirect : false,
      } );

      if ( res?.error ) {
        toast.error( "Invalid username or password" );
      } else {
        router.push( "/" );
        router.refresh();
      }
    } finally {
      setLoading( false );
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            BRILink Admin System
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={( e ) => setUsername( e.target.value )}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={( e ) => setPassword( e.target.value )}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
