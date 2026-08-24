import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-card__back" href="/">
          ← На главную
        </Link>

        <div className="auth-card__header">
          <p className="auth-card__eyebrow">Личный кабинет</p>
          <h1>Вход</h1>
          <p>Введите логин и пароль, указанные при регистрации.</p>
        </div>

        <form className="auth-form">
          <label className="form-field">
            <span>Логин</span>

            <input
              autoComplete="username"
              name="login"
              placeholder="Введите логин"
              required
              type="text"
            />
          </label>

          <label className="form-field">
            <span>Пароль</span>

            <input
              autoComplete="current-password"
              name="password"
              placeholder="Введите пароль"
              required
              type="password"
            />
          </label>

          <button className="button button--primary auth-form__submit" type="submit">
            Войти
          </button>
        </form>

        <p className="auth-card__footer">
          Нет аккаунта?{" "}
          <Link href="/register">
            Зарегистрироваться
          </Link>
        </p>

        <div className="auth-notice">
          Восстановление пароля выполняется через тренера.
        </div>
      </section>
    </main>
  );
}