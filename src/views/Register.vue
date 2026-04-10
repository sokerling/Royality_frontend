<template>
  <Page class="page" actionBarHidden="true">
    <GridLayout rows="*" class="register-root">
      <Image src="~/assets/welcome_bg.png" stretch="aspectFill" class="bg-image" isUserInteractionEnabled="false" />
      <ScrollView>
        <StackLayout margin="18" class="content">
          <AppLabel text="Регистрация" class="h1" textAlignment="center" :strokeWidth="8" :shadowOffset="5" />

          <StackLayout class="form-card">
            <TextField :text="name" hint="Имя" class="input" @textChange="onNameChange" />
            <TextField :text="loginValue" hint="Логин" class="input" autocorrect="false" @textChange="onLoginChange" />
            <TextField :text="password" hint="Пароль (мин. 8)" class="input" secure="true" @textChange="onPasswordChange" />
          </StackLayout>

          <Label v-if="errorText" :text="errorText" class="error-text" textWrap="true" />

          <StackLayout class="buttons">
            <AppButton :text="isLoading ? 'Создание...' : 'Создать аккаунт'" type="arena" @tap="onSubmit" />
            <AppButton text="Назад" type="secondary" @tap="$navigateBack" />
          </StackLayout>
        </StackLayout>
      </ScrollView>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { signup } from "../services/auth";
import { alert } from "@nativescript/core/ui/dialogs";
import AppButton from "../components/AppButton.vue";
import AppLabel from "../components/AppLabel.vue";

export default defineComponent({
  name: "Register",
  components: { AppButton, AppLabel },
  data() {
    return {
      name: "",
      loginValue: "",
      password: "",
      isLoading: false,
      errorText: "",
    };
  },
  methods: {
    onNameChange(args: any): void {
      this.name = String(args?.value ?? args?.object?.text ?? "");
    },
    onLoginChange(args: any): void {
      this.loginValue = String(args?.value ?? args?.object?.text ?? "");
    },
    onPasswordChange(args: any): void {
      this.password = String(args?.value ?? args?.object?.text ?? "");
    },
    async onSubmit(): Promise<void> {
      if (this.isLoading) return;
      if (!this.name.trim() || !this.loginValue.trim() || !this.password.trim()) {
        this.errorText = "Заполните все поля.";
        return;
      }
      this.errorText = "";
      this.isLoading = true;
      try {
        await signup(this.loginValue.trim(), this.password, this.name.trim());
        await alert({
          title: "Готово",
          message: "Аккаунт создан. Теперь войдите в приложение.",
          okButtonText: "OK",
        });
        this.$navigateBack();
      } catch (error) {
        this.errorText = error instanceof Error ? error.message : "Не удалось зарегистрироваться.";
      } finally {
        this.isLoading = false;
      }
    },
  },
});
</script>

<style scoped>
.page {
  background-color: #000;
}

.register-root {
  width: 100%;
  height: 100%;
}

.bg-image {
  width: 100%;
  height: 100%;
}

.content {
  padding-top: 30;
}

.h1 {
  font-size: 24;
  color: #fff;
  margin-bottom: 14;
}

.form-card {
  padding: 12;
  border-radius: 14;
  background: linear-gradient(to bottom, #f5dc8d, #d19039);
  border-width: 2;
  border-color: #5d3a14;
}

.input {
  margin-top: 8;
  padding: 10;
  background-color: #ffffff;
  border-radius: 10;
  border-width: 1;
  border-color: #2f4e88;
  color: #1f1f1f;
  height: 44;
}

.error-text {
  margin-top: 8;
  color: #ffd2d2;
  text-align: center;
}

.buttons {
  margin-top: 8;
  align-items: center;
}
</style>
