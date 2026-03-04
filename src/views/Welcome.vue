<template>
  <Page actionBarHidden="true" class="welcome-page">
    <GridLayout rows="2*, auto">

      <!-- Верхние две трети — заголовок -->
      <Label
        row="0"
        text="Добро пожаловать в сообщество по Clash Royale"
        class="h1"
        verticalAlignment="center"
        textWrap="true"
      />

      <!-- Нижняя треть — кнопки -->
      <StackLayout row="1" class="button-row" horizontalAlignment="center" marginBottom="80">
        <AppButton text="На арену!" type="arena" @tap="goToFeed" />
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

export default defineComponent({
  name: "Welcome",
  components: { AppButton },
  methods: {
    goToFeed(): void {
      this.$navigateTo(Home);
    },
    goToRegister(): void {
      this.$navigateTo(Register);
    },
  },
});
</script>

<style scoped>
.welcome-page {
  background-image: url('~/assets/welcome_bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.welcome-panel {
  padding: 20;
}

.h1 {
  font-size: 24;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  margin-bottom: 50;
}

.button-row {
  align-items: center;
  gap: 16;
}
</style>
