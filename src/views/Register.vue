<template>
  <Page class="page" actionBarHidden="true">
    <StackLayout verticalAlignment="center" horizontalAlignment="center">
      <Label text="Здесь будет форма регистрации" class="h1" textWrap="true" />
    </StackLayout>
  </Page>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Register",
});
</script>

<style scoped>
.page {
  background-color: #f0f0f0;
}

.h1 {
  font-size: 20;
  font-weight: bold;
  color: #333;
  text-align: center;
}
</style>
