<template>
  <Frame>
    <Welcome />
  </Frame>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Welcome from "./views/Welcome.vue";
import { clearSession } from "./stores/session";
import { setUnauthorizedHandler } from "./services/http";

export default defineComponent({
  name: "App",
  components: { Welcome },
  data() {
    return {
      isUnauthorizedRedirectInProgress: false,
    };
  },
  mounted() {
    setUnauthorizedHandler(() => {
      if (this.isUnauthorizedRedirectInProgress) return;
      this.isUnauthorizedRedirectInProgress = true;
      clearSession();
      Promise.resolve(this.$navigateTo(Welcome, { clearHistory: true })).finally(() => {
        setTimeout(() => {
          this.isUnauthorizedRedirectInProgress = false;
        }, 300);
      });
    });
  },
  beforeUnmount() {
    setUnauthorizedHandler(null);
  },
});
</script>
