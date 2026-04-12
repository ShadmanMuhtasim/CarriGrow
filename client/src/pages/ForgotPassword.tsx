import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NavLink } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { requestPasswordReset } from "../services/auth";
import { toastUI } from "../components/ui/Toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setErr("");
    setLoading(true);
    try {
      await requestPasswordReset(values.email);
      setDone(true);
      toastUI.success("Password reset link requested");
    } catch (error: unknown) {
      console.error(error);
      setErr("Failed to request reset link. Check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h1 className="h3 fw-bold mb-2">Forgot Password</h1>
                <p className="text-muted mb-4">Request a password reset link using your account email.</p>

                {err ? <div className="alert alert-danger">{err}</div> : null}
                {done ? (
                  <div className="alert alert-success">
                    If the email exists, a reset link has been sent.
                  </div>
                ) : null}

                <form onSubmit={handleSubmit(onSubmit)} className="vstack gap-3">
                  <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />

                  <Button loading={loading} type="submit" className="w-100">
                    Send Reset Link
                  </Button>
                </form>

                <div className="text-center mt-3 d-flex justify-content-center gap-3">
                  <NavLink to="/login">Back to login</NavLink>
                  <NavLink to="/reset-password">Already have token?</NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
