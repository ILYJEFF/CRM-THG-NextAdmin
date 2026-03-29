import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginFallback() {
  return (
    <div className="w-full max-w-[400px] flex justify-center py-16">
      <div className="h-8 w-8 rounded-full border-2 border-zinc-600 border-t-amber-500 animate-spin" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f1419]">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
