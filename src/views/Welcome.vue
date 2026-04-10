<template>
  <Page actionBarHidden="true" class="welcome-page">
    <GridLayout rows="2*, auto">
      <Image
        row="0"
        rowSpan="2"
        src="~/assets/welcome_bg.png"
        stretch="aspectFill"
        class="bg-image"
        isUserInteractionEnabled="false"
      />

      <GridLayout row="0" rows="*, auto" class="top-content" margin="18">
        <Label
          row="0"
          text="Добро пожаловать в сообщество по Clash Royale"
          class="h1"
          textWrap="true"
          textAlignment="center"
        />

        <StackLayout row="1" class="form-wrapper">
          <StackLayout class="login-panel-shadow" width="94%">
            <StackLayout class="login-panel form-layer" width="100%">
            <Label text="Вход" class="panel-title" />
            <TextField
              :text="loginValue"
              hint="Логин"
              class="input"
              autocorrect="false"
              @textChange="onLoginChange"
            />
            <TextField
              :text="password"
              hint="Пароль"
              class="input"
              secure="true"
              @textChange="onPasswordChange"
            />
            </StackLayout>
          </StackLayout>

          <Label v-if="errorText" :text="errorText" class="error-text" textWrap="true" />
        </StackLayout>
      </GridLayout>

      <StackLayout row="1" class="button-row" horizontalAlignment="center" marginBottom="80">
        <AppButton :text="isLoading ? 'Вход...' : 'На арену!'" type="arena" @tap="goToFeed" />
        <AppButton text="Я — новичок" type="secondary" @tap="goToRegister" />
      </StackLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Home from "./Home.vue";
import Register from "./Register.vue";
import AppButton from "../components/AppButton.vue";
import { getMyProfile } from "../services/profile";
import { login } from "../services/auth";
import { sessionStore, setSessionToken } from "../stores/session";

export default defineComponent({
  name: "Welcome",
  components: { AppButton },
  data() {
    return {
      loginValue: "",
      password: "",
      isLoading: false,
      errorText: "",
    };
  },
  async mounted() {
    if (!sessionStore.token) return;
    try {
      sessionStore.profile = await getMyProfile(sessionStore.token);
      this.$navigateTo(Home, { clearHistory: true });
    } catch {
      // Keep user in login screen only when token is invalid.
      this.errorText = "Сессия истекла, войдите снова.";
    }
  },
  methods: {
    onLoginChange(args: any): void {
      this.loginValue = String(args?.value ?? args?.object?.text ?? "");
    },
    onPasswordChange(args: any): void {
      this.password = String(args?.value ?? args?.object?.text ?? "");
    },
    async goToFeed(): Promise<void> {
      if (this.isLoading) return;
      if (!this.loginValue.trim() || !this.password.trim()) {
        this.errorText = "Введите логин и пароль.";
        return;
      }
      this.errorText = "";
      this.isLoading = true;
      try {
        const token = await login(this.loginValue.trim(), this.password);
        setSessionToken(token);
        try {
          sessionStore.profile = await getMyProfile(token);
        } catch {
          // Some environments may return login success before profile is ready.
          sessionStore.profile = null;
        }
        this.$navigateTo(Home, { clearHistory: true });
      } catch (error) {
        this.errorText = error instanceof Error ? error.message : "Ошибка входа.";
      } finally {
        this.isLoading = false;
      }
    },
    goToRegister(): void {
      this.$navigateTo(Register);
    },
  },
});
</script>

<style scoped>
.welcome-page {
  background-color: #000000;
}

.bg-image {
  width: 100%;
  height: 100%;
  opacity: 1;
}

.h1 {
  font-size: 24;
  font-weight: bold;
  color: #ffffff;
  margin: 8 16 16 16;
}

.top-content {
  vertical-align: stretch;
  padding-top: 20;
}

.form-wrapper {
  vertical-align: bottom;
  margin-bottom: 8;
}

.input {
  margin-top: 8;
  background-color: #ffffff;
  color: #1f1f1f;
  border-radius: 10;
  padding: 10 12;
  border-width: 1;
  border-color: #2f4e88;
  height: 44;
  min-height: 44;
}

.login-panel {
  padding: 12;
  background: linear-gradient(to bottom, #ffe8a6, #e7aa4a);
  border-radius: 12;
  border-width: 2;
  border-color: #6e4a1f;
  min-height: 160;
}

.panel-title {
  color: #fff;
  font-size: 18;
  font-weight: bold;
  text-align: center;
  margin-bottom: 6;
}

.login-panel-shadow {
  margin-top: 12;
  padding: 4 3 0 3;
  border-radius: 14;
  background-color: rgba(0, 0, 0, 0.38);
}

.form-layer {
  z-index: 999;
}

.button-row {
  align-items: center;
}

.error-text {
  margin-top: 8;
  color: #ffd2d2;
  text-align: center;
}
</style>
