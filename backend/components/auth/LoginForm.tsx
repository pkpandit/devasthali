"use client";

import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAction, type LoginActionState } from "@/lib/server/auth-actions";

interface LoginFormProps {
  returnUrl?: string;
}

const initialState: LoginActionState = {};

export function LoginForm({ returnUrl }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  return (
    <div className="login-card">
      <div className="login-card__header">
        <div className="login-brand">
          <span aria-hidden="true" className="admin-brand-mark">
            DV
          </span>
          <div className="login-brand__text">
            <h1 className="login-brand__title">Devasthaly Vidyapeeth</h1>
            <p className="login-brand__subtitle">Staff & Admin Management Portal</p>
          </div>
        </div>
      </div>

      {state.error && (
        <div
          id="login-error"
          role="alert"
          aria-live="assertive"
          className="login-alert login-alert--error"
        >
          <p>{state.error}</p>
        </div>
      )}

      <form action={formAction} className="login-form" noValidate={false}>
        {returnUrl && <input type="hidden" name="returnUrl" value={returnUrl} />}

        <div className="login-field">
          <label htmlFor="email" className="login-label">
            Official Email Address
          </label>
          <div className="login-input-wrapper">
            <span aria-hidden="true" className="login-input-icon">
              <Mail size={18} />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="admin@devasthaly.edu.in"
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.email || state.error)}
              aria-describedby={
                state.fieldErrors?.email
                  ? "email-error"
                  : state.error
                  ? "login-error"
                  : undefined
              }
              className={`login-input ${
                state.fieldErrors?.email || state.error ? "login-input--error" : ""
              }`}
            />
          </div>
          {state.fieldErrors?.email && (
            <p id="email-error" role="alert" className="login-field-error">
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        <div className="login-field">
          <label htmlFor="password" className="login-label">
            Account Password
          </label>
          <div className="login-input-wrapper">
            <span aria-hidden="true" className="login-input-icon">
              <Lock size={18} />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              disabled={isPending}
              aria-invalid={Boolean(state.fieldErrors?.password || state.error)}
              aria-describedby={
                state.fieldErrors?.password
                  ? "password-error"
                  : state.error
                  ? "login-error"
                  : undefined
              }
              className={`login-input ${
                state.fieldErrors?.password || state.error ? "login-input--error" : ""
              }`}
            />
            <button
              type="button"
              className="login-password-toggle"
              aria-label={showPassword ? "Hide password text" : "Show password text"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isPending}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {state.fieldErrors?.password && (
            <p id="password-error" role="alert" className="login-field-error">
              {state.fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="login-submit-button"
          aria-busy={isPending}
        >
          {isPending ? (
            <span className="login-submit-loading">
              <span aria-hidden="true" className="login-spinner" />
              <span>Authenticating...</span>
            </span>
          ) : (
            <span className="login-submit-text">
              <LogIn size={18} aria-hidden="true" />
              <span>Sign in to Administrator Portal</span>
            </span>
          )}
        </button>
      </form>

      <div className="login-card__footer">
        <a
          href={frontendUrl}
          className="login-public-link"
          rel="noreferrer"
        >
          &larr; Return to Public Website
        </a>
      </div>
    </div>
  );
}
