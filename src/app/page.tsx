import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">Онлайн-запись</p>

          <h1 className="hero__title">
            Тренировки с Анной Митюшовой
          </h1>

          <p className="hero__description">
            Записывайтесь на тренировки, подтверждайте участие и следите
            за своей позицией в очереди.
          </p>

          <div className="hero__actions">
            <Link className="button button--primary" href="/login">
              Войти
            </Link>

            <Link className="button button--secondary" href="/register">
              Зарегистрироваться
            </Link>
          </div>
        </div>

        <div className="info-card">
          <div className="info-card__icon">8</div>

          <div>
            <h2 className="info-card__title">До 8 участников</h2>

            <p className="info-card__text">
              Количество мест и сроки подтверждения тренер сможет менять
              в административной панели.
            </p>
          </div>
        </div>
      </section>

      <section className="features">
        <article className="feature-card">
          <span className="feature-card__number">01</span>
          <h2>Удобная запись</h2>
          <p>Выберите занятие и займите свободное место.</p>
        </article>

        <article className="feature-card">
          <span className="feature-card__number">02</span>
          <h2>Подтверждение</h2>
          <p>Подтвердите участие перед началом тренировки.</p>
        </article>

        <article className="feature-card">
          <span className="feature-card__number">03</span>
          <h2>Очередь</h2>
          <p>Получите освободившееся место в порядке очереди.</p>
        </article>
      </section>
    </main>
  );
}