'use client';

import { useState } from 'react';
import { Github } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/logo';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthCard() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [emailSignIn, setEmailSignIn] = useState('');
  const [passwordSignIn, setPasswordSignIn] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [emailSignUp, setEmailSignUp] = useState('');
  const [passwordSignUp, setPasswordSignUp] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, emailSignIn, passwordSignIn);
      toast({
        title: 'Signed In',
        description: 'You have successfully signed in.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async () => {
    if (!auth || !firestore) return;
    setIsSigningUp(true);
  
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailSignUp, passwordSignUp);
      const user = cred.user;
  
      await setDoc(doc(firestore, "users", user.uid), {
        id: user.uid,
        email: emailSignUp,
        fullName,
        username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
  
      // 🔥 Provision user workspace
      await fetch("/api/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
  
      toast({ title: "Signed Up", description: "Workspace created" });
      router.push("/dashboard");
  
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sign Up Failed", description: err.message });
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <Tabs defaultValue="sign-in" className="w-full max-w-md">
      <Card className="shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Welcome to CodeSail</CardTitle>
          <CardDescription>Your AI-powered coding environment in the cloud.</CardDescription>
          <TabsList className="grid w-full grid-cols-2 mt-4">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>
        </CardHeader>
        <TabsContent value="sign-in">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-signin">Email</Label>
              <Input
                id="email-signin"
                type="email"
                placeholder="m@example.com"
                value={emailSignIn}
                onChange={(e) => setEmailSignIn(e.target.value)}
                disabled={isSigningIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signin">Password</Label>
              <Input
                id="password-signin"
                type="password"
                value={passwordSignIn}
                onChange={(e) => setPasswordSignIn(e.target.value)}
                disabled={isSigningIn}
              />
            </div>
            <Button className="w-full" onClick={handleSignIn} disabled={isSigningIn}>
              {isSigningIn ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardContent>
        </TabsContent>
        <TabsContent value="sign-up">
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="fullname-signup">Full Name</Label>
              <Input
                id="fullname-signup"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="username-signup">Username</Label>
              <Input
                id="username-signup"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-signup">Email</Label>
              <Input
                id="email-signup"
                type="email"
                placeholder="m@example.com"
                value={emailSignUp}
                onChange={(e) => setEmailSignUp(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signup">Password</Label>
              <Input
                id="password-signup"
                type="password"
                value={passwordSignUp}
                onChange={(e) => setPasswordSignUp(e.target.value)}
                disabled={isSigningUp}
              />
            </div>
            <Button className="w-full" onClick={handleSignUp} disabled={isSigningUp}>
              {isSigningUp ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardContent>
        </TabsContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Button variant="outline">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline">
               <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.13 14.88l-.02-.02c-.38.16-.78.24-1.19.24-.8 0-1.56-.3-2.12-.86-.56-.56-.86-1.32-.86-2.12 0-.8.3-1.56.86-2.12.56-.56 1.32-.86 2.12-.86.41 0 .81.08 1.19.24l.02-.02c.42-.18.82-.27 1.25-.27.8 0 1.56.31 2.12.87.56.56.87 1.32.87 2.12s-.31 1.56-.87 2.12c-.56.56-1.32.87-2.12.87-.43 0-.83-.09-1.25-.27zM18 12c0 .88-.36 1.68-.94 2.26.58.58.94 1.38.94 2.26 0 1.77-1.43 3.2-3.2 3.2-1.77 0-3.2-1.43-3.2-3.2 0-.88.36-1.68.94-2.26C12.96 13.68 12 12.88 12 12s.96-1.68 2.54-2.26C13.96 9.16 13.6 8.36 13.6 7.48c0-1.77 1.43-3.2 3.2-3.2 1.77 0 3.2 1.43 3.2 3.2 0 .88-.36 1.68-.94 2.26.58.58.94 1.38.94 2.26z"/></svg>
              Google
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Tabs>
  );
}
