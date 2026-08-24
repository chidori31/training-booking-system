import Link from "next/link";

import { registerAction } from "./actions";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  const errorMessage = Array.isArray(params.error)
    ? params.error[0]
    : params.error;

  return (
    <main className="auth-page">
      <section className="auth-card auth-card--wide">
        <Link className="auth-card__back" href="/">
          ← На главную
        </Link>

        <div className="auth-card__header">
          <p className="auth-card__eyebrow">
            Новый пользователь
          </p>

          <h1>Регистрация</h1>

          <p>
            После регистрации вы сразу войдёте
            в личный кабинет.
          </p>
        </div>

        <form
          action={registerAction}
          className="auth-form auth-form--grid"
        >
          <label className="form-field form-field--full">
            <span>ФИО</span>

            <input
              autoComplete="name"
              maxLength={150}
              minLength={5}
              name="fullName"
              placeholder="Иванова Мария Сергеевна"
              required
              type="text"
            />
          </label>

          <label className="form-field">
            <span>Возраст</span>

            <input
              max="100"
              min="5"
              name="age"
              placeholder="25"
              required
              type="number"
            />
          </label>

          <label className="form-field">
            <span>Номер телефона</span>

            <input
              autoComplete="tel"
              maxLength={30}
              name="phone"
              placeholder="+7 999 000-00-00"
              required
              type="tel"
            />
          </label>

          <label className="form-field">
            <span>Логин</span>

            <input
              autoCapitalize="none"
              autoComplete="username"
              maxLength={50}
              minLength={4}
              name="login"
              pattern="[A-Za-z0-9._-]+"
              placeholder="Например, maria25"
              required
              spellCheck={false}
              type="text"
            />
          </label>

          <label className="form-field">
            <span>Пароль</span>

            <input
              autoComplete="new-password"
              maxLength={72}
              minLength={8}
              name="password"
              placeholder="Не менее 8 символов"
              required
              type="password"
            />
          </label>

          <label className="form-checkbox form-field--full">
            <input
              name="personalDataConsent"
              required
              type="checkbox"
            />

            <span>
              Я согласен на обработку персональных данных
            </span>
          </label>

          {errorMessage && (
            <div
              className="form-message form-message--error form-field--full"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <button
            className="button button--primary auth-form__submit form-field--full"
            type="submit"
          >
            Создать аккаунт
          </button>
        </form>

        <p className="auth-card__footer">
          Уже зарегистрированы?{" "}
          <Link href="/login">
            Войти
          </Link>
        </p>
      </section>
    </main>
  );
}