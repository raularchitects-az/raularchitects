import { isCmsConfigured } from "@/lib/cms/env";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return <LoginForm configured={isCmsConfigured()} />;
}
