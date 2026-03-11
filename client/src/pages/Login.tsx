import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NavLink, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import CheckboxRadio from "../components/form/CheckboxRadio";
import { useAuth } from "../hooks/useAuth";
import { toastUI } from "../components/ui/Toast";
import { getPostAuthRedirectPath } from "../utils/authRedirect";
import { getApiErrorMessage } from "../utils/apiError";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember_me: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setErr("");
    setLoading(true);
    try {
      const signedInUser = await signIn({ email: values.email, password: values.password });
      toastUI.success("Signed in successfully");
      navigate(getPostAuthRedirectPath(signedInUser), { replace: true });
    } catch (error: unknown) {
      console.error(error);
      setErr(getApiErrorMessage(error, "Invalid email or password"));
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
                <h1 className="h3 fw-bold mb-2">Sign In</h1>
                <p className="text-muted mb-4">Access your dashboard and profile.</p>

                {err && <div className="alert alert-danger">{err}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="vstack gap-3">
                  <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
                  <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />

                  <div className="d-flex align-items-center justify-content-between">
                    <CheckboxRadio label="Remember me" type="checkbox" {...register("remember_me")} />
                    <NavLink to="/forgot-password" className="btn btn-link p-0 text-decoration-none">
                      Forgot Password?
                    </NavLink>
                  </div>

                  <Button loading={loading} className="w-100" type="submit">
                    Sign In
                  </Button>
                </form>

                <div className="text-center mt-3">
                  <span className="text-muted">No account? </span>
                  <NavLink to="/register">Register</NavLink>
                </div>
              </div>
            </div>

            <div className="text-center small text-muted mt-3">
              Tip: use your seeded user or the one you registered in Postman.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
