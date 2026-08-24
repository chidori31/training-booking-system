import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-header__eyebrow">
            Личный кабинет
          </p>

          <h1>{user.fullName}</h1>

          <p className="dashboard-header__description">
            Здесь появятся расписание,
            ваши записи и подтверждения участия.
          </p>
        </div>
      </header>

      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-card--accent">
          <p className="dashboard-card__label">
            Ближайшая тренировка
          </p>

          <h2>Пока нет записи</h2>

          <p>
            После создания расписания здесь
            появится ближайшее занятие.
          </p>
        </article>

        <article className="dashboard-card">
          <p className="dashboard-card__label">
            Ваш профиль
          </p>

          <dl className="profile-list">
            <div>
              <dt>Логин</dt>
              <dd>{user.login}</dd>
            </div>

            <div>
              <dt>Телефон</dt>
              <dd>{user.phone}</dd>
            </div>

            <div>
              <dt>Возраст</dt>
              <dd>{user.age}</dd>
            </div>

            <div>
              <dt>Тип аккаунта</dt>
              <dd>
                {user.role === "ADMIN"
                  ? "Администратор"
                  : "Клиент"}
              </dd>
            </div>
          </dl>
        </article>

        <article className="dashboard-card">
          <p className="dashboard-card__label">
            Уведомления
          </p>

          <h2>
            {user.vkUserId
              ? "ВКонтакте подключён"
              : "ВКонтакте не подключён"}
          </h2>

          <p>
            Подключение сообщений сообщества
            добавим позже.
          </p>
        </article>
      </section>
    </main>
  );
}