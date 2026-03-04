<template>
  <ScrollView>
    <StackLayout class="profile-wrapper" horizontalAlignment="center">

      <!-- Аватар -->
      <Image
        src="~/assets/avatars/avatar3.jpg"
        width="90"
        height="90"
        class="profile-avatar"
        stretch="aspectFill"
      />

      <!-- Никнейм -->
      <Label text="KingSlayer99" class="profile-username" />

      <!-- Кнопка выхода -->
      <AppButton text="Выйти" type="secondary" @tap="onLogout" />

    </StackLayout>
  </ScrollView>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppButton from "../../components/AppButton.vue";
import Welcome from "../Welcome.vue";

export default defineComponent({
  name: "ProfileTab",
  components: { AppButton },
  methods: {
    onLogout(): void {
      this.$navigateTo(Welcome, { clearHistory: true });
    },
  },
});
</script>

<style scoped>
.profile-wrapper {
  padding: 40 20;
}

.profile-avatar {
  border-radius: 45;
  margin-bottom: 16;
}

.profile-username {
  font-size: 22;
  font-weight: bold;
  color: #222;
  text-align: center;
  margin-bottom: 30;
}
</style>
