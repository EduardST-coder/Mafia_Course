import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const navigate =
    useNavigate();

  return (
    <div
      style={{
        paddingTop: "40px",
        paddingBottom: "60px"
      }}
    >
      <section
        className="card"
        style={{
          padding: "60px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "40px"
        }}
      >
        <div>
          <div
            style={{
              color:
                "var(--gold)",
              fontWeight: 600,
              marginBottom: "12px"
            }}
          >
            ГРАЙ. ДУМАЙ. ПЕРЕМАГАЙ.
          </div>

          <h1
            style={{
              fontSize: "56px",
              lineHeight: 1.1,
              marginBottom: "20px"
            }}
          >
            ЛЕГЕНДА
            <br />
            ПОЧИНАЄТЬСЯ
            <br />
            З ТЕБЕ
          </h1>

          <p
            style={{
              maxWidth: "500px",
              color:
                "var(--text-secondary)",
              marginBottom: "30px"
            }}
          >
            Приєднуйся до гри,
            знаходь союзників,
            блефуй та перемагай
            у світі Mafia Online.
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px"
            }}
          >
            <button
              className="primary-button"
              onClick={() =>
                navigate(
                  "/rooms"
                )
              }
            >
              Швидка гра
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  "/rooms"
                )
              }
            >
              Створити стіл
            </button>
          </div>
        </div>

        <div
          className="card"
          style={{
            width: "300px",
            padding: "30px"
          }}
        >
          <div
            style={{
              color:
                "var(--text-secondary)",
              marginBottom: "12px"
            }}
          >
            Онлайн зараз
          </div>

          <div
            style={{
              fontSize: "48px",
              fontWeight: 700,
              marginBottom: "24px"
            }}
          >
            1246
          </div>

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "12px"
            }}
          >
            <div>
              🎮 У грі: 812
            </div>

            <div>
              🏠 У лобі: 234
            </div>

            <div>
              🔎 Шукають гру:
              200
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2
          className="section-title"
        >
          Популярні столи
        </h2>

        <p
          className="section-subtitle"
        >
          Обирай гру та
          приєднуйся до
          інших гравців.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px"
          }}
        >
          {[1, 2, 3, 4].map(
            table => (
              <div
                key={table}
                className="card"
                style={{
                  padding: "24px"
                }}
              >
                <h3
                  style={{
                    marginBottom:
                      "12px"
                  }}
                >
                  VIP TABLE
                  #{table}
                </h3>

                <p
                  style={{
                    color:
                      "var(--text-secondary)",
                    marginBottom:
                      "8px"
                  }}
                >
                  Гравців: 6/10
                </p>

                <p
                  style={{
                    color:
                      "var(--text-secondary)",
                    marginBottom:
                      "20px"
                  }}
                >
                  Приватний 🔒
                </p>

                <button
                  className="primary-button"
                  style={{
                    width: "100%"
                  }}
                >
                  Приєднатися
                </button>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}