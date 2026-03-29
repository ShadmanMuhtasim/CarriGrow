import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NavLink, useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Select from "../components/form/Select";
import CheckboxRadio from "../components/form/CheckboxRadio";
import { useAuth } from "../hooks/useAuth";
import { toastUI } from "../components/ui/Toast";
import { getPostAuthRedirectPath } from "../utils/authRedirect";
import { getApiErrorMessage } from "../utils/apiError";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    role: z.enum(["job_seeker", "employer", "mentor"]),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password needs at least one uppercase letter")
      .regex(/[a-z]/, "Password needs at least one lowercase letter")
      .regex(/[0-9]/, "Password needs at least one number"),
    password_confirmation: z.string(),
    terms_accepted: z.boolean().refine((value) => value === true, {
      message: "You must accept terms and conditions",
    }),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ["password_confirmation"],
    message: "Password confirmation does not match",
  });

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "job_seeker",
      password: "",
      password_confirmation: "",
      terms_accepted: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setErr("");
    setLoading(true);
    try {
      const signedUpUser = await signUp({
        name: values.name,
        email: values.email,
        role: values.role,
        password: values.password,
        password_confirmation: values.password_confirmation,
      });
      toastUI.success("Account created successfully");
      navigate(getPostAuthRedirectPath(signedUpUser), { replace: true });
    } catch (error: unknown) {
      console.error(error);
      setErr(getApiErrorMessage(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-md-5">
                <h1 className="h3 fw-bold mb-2">Create Account</h1>
                <p className="text-muted mb-4">Choose your role and start building your profile.</p>

                {err && <div className="alert alert-danger">{err}</div>}

                <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  <div className="col-12">
                    <Input label="Name" error={errors.name?.message} {...register("name")} />
                  </div>

                  <div className="col-12">
                    <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
                  </div>

                  <div className="col-12 col-md-6">
                    <Select
                      label="Role"
                      error={errors.role?.message}
                      options={[
                        { value: "job_seeker", label: "Job Seeker" },
                        { value: "employer", label: "Employer" },
                        { value: "mentor", label: "Mentor" },
                      ]}
                      {...register("role")}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <Input label="Password" type="password" error={errors.password?.message} {...register("password")} />
                  </div>

                  <div className="col-12">
                    <Input
                      label="Confirm Password"
                      type="password"
                      error={errors.password_confirmation?.message}
                      {...register("password_confirmation")}
                    />
                  </div>

                  <div className="col-12">
                    <CheckboxRadio
                      label="I agree to the terms and conditions."
                      type="checkbox"
                      error={errors.terms_accepted?.message}
                      {...register("terms_accepted")}
                    />
                  </div>

                  <div className="col-12">
                    <Button loading={loading} className="w-100" type="submit">
                      Create Account
                    </Button>
                  </div>
                </form>

                <div className="text-center mt-3">
                  <span className="text-muted">Already have an account? </span>
                  <NavLink to="/login">Sign in</NavLink>
                </div>
              </div>
            </div>

            <div className="text-center small text-muted mt-3">
              After registering, you will be redirected to dashboard automatically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
