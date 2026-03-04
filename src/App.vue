<template>
  <Frame>
    <Welcome />
  </Frame>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Welcome from "./views/Welcome.vue";

export default defineComponent({
  name: "App",
  components: { Welcome },
});
</script>