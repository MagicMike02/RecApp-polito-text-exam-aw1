import { useState, useActionState } from "react";
import { useTranslation } from "react-i18next";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";

function LoginPage() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginAction = async (prevState, formData) => {
    const username = formData.get("username");
    const password = formData.get("password");

    if (!username || !password) {
      return { error: t("ui.login.missing_fields", "Please enter username and password"), prevUsername: username };
    }

    try {
      const res = await login(username, password);
      if (res.success) {
        navigate("/");
        return { error: null };
      } else {
        const errorKey = res.error || "invalid_credentials";
        return { error: t(`api_errors.${errorKey}`), prevUsername: username };
      }
    } catch (err) {
      const errorKey = err.backendKey || "invalid_credentials";
      return { error: t(`api_errors.${errorKey}`), prevUsername: username };
    }
  };

  const [state, formAction, isPending] = useActionState(loginAction, { error: null });

  return (
    <Container fluid className="login-container">
      <Card className="login-card">
        <Card.Body className="login-card-body">
          <div className="login-header">
            <h2 className="login-title">{t("ui.title")}</h2>
          </div>

          {state?.error && <Alert variant="danger">{state.error}</Alert>}

          <Form action={formAction} className="login-form">
            <div className="login-group">
              <Form.Label>{t("ui.login.username")}</Form.Label>
              <Form.Control
                name="username"
                type="text"
                placeholder={t("ui.login.username")}
                disabled={isPending}
                defaultValue={state?.prevUsername || ""}
                autoComplete="username"
              />
            </div>
            <div className="login-group">
              <Form.Label>{t("ui.login.password")}</Form.Label>
              <div className="password-wrapper">
                <Form.Control
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("ui.login.password")}
                  disabled={isPending}
                  className="input-password"
                  autoComplete="current-password"
                />
                <span className="password-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>
            <Button type="submit" className="login-btn" disabled={isPending} variant="">
              {isPending ? t("ui.login.loading") : t("ui.login.submit")}
            </Button>
          </Form>
          <div className="login-footer">
            <small className="text-muted">{t("ui.login.test_info")}</small>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default LoginPage;
