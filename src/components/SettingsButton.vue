<template>
  <GridLayout
    width="38"
    height="42"
    rows="*"
    columns="*"
    class="settings-btn-root"
    :class="{ 'settings-btn-root--pressed': isPressed }"
    @touch="onTouch"
  >
    <StackLayout row="0" col="0" class="settings-shadow" />
    <StackLayout row="0" col="0" class="settings-layer-1" />
    <StackLayout row="0" col="0" class="settings-layer-2" />
    <Image
      row="0"
      col="0"
      src="~/assets/settings.png"
      class="settings-icon"
      stretch="aspectFit"
      isUserInteractionEnabled="false"
    />
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SettingsButton",
  emits: ["tap"],
  data() {
    return {
      isPressed: false as boolean,
    };
  },
  methods: {
    onTouch(args: any): void {
      const action = args?.action;
      if (action === "down") {
        this.isPressed = true;
        return;
      }

      if (action === "up" || action === "cancel") {
        this.isPressed = false;
        if (action === "up") {
          this.$emit("tap");
        }
      }
    },
  },
});
</script>

<style scoped>
.settings-btn-root {
  margin-top: 1;
}

.settings-btn-root--pressed {
  translate: 0 2;
}

.settings-shadow {
  width: 35;
  height: 35;
  border-radius: 12;
  background-color: rgba(0, 0, 0, 0.35);
  vertical-align: center;
  horizontal-align: center;
  margin-top: 5;
}

.settings-layer-1 {
  width: 35;
  height: 35;
  border-radius: 12;
  border-width: 1;
  border-color: #030303;
  background: linear-gradient(#66c8ff, #1a5c8a);
  vertical-align: center;
  horizontal-align: center;
}

.settings-layer-2 {
  width: 31;
  height: 31;
  border-radius: 10;
  background: linear-gradient(#3fbdf3, #3491ea);
  vertical-align: center;
  horizontal-align: center;
}

.settings-icon {
  width: 36;
  height: 36;
  vertical-align: center;
  horizontal-align: center;
}
</style>
