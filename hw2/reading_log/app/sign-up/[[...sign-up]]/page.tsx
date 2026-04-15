import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <SignUp />
    </div>
  );
}
