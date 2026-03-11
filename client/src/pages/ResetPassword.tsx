import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { resetPassword } from "../services/auth";
import { toastUI } from "../components/ui/Toast";

const schema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Password confirmation does not match",
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: searchParams.get("token") ?? "",
      email: searchParams.get("email") ?? "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setErr("");
    setLoading(true);
    try {
      await resetPassword(values);
      toastUI.success("Password reset successful");
      navigate("/login");
    } catch (error: unknown) {
      console.error(error);
      setErr("Failed to reset password. Please verify token and email.");
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
                <h1 className="h3 fw-bold mb-2">Reset Password</h1>
                <p className="text-muted mb-4">Use the token from email to set a new password.</p>

                {err ? <div className="alert alert-danger">{err}</div> : null}

                <form onSubmit={handleSubmit(onSubmit)} className="vstack gap-3">
                  <Input label="Reset Token" error={errors.token?.message} {...register("token")} />
                  <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
                  <Input label="New Password" type="password" error={errors.password?.message} {...register("password")} />
                  <Input
                    label="Confirm Password"
                    type="password"
                    error={errors.password_confirmation?.message}
                    {...register("password_confirmation")}
                  />

                  <Button loading={loading} type="submit" className="w-100">
                    Reset Password
                  </Button>
                </form>

                <div className="text-center mt-3">
                  <NavLink to="/login">Back to login</NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
