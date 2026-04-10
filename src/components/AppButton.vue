<template>
  <GridLayout width="220" height="76" rows="76" columns="220" @touch="onTouch" ref="wrapper">
    <StackLayout
      row="0" col="0"
      width="213" height="68"
      verticalAlignment="center"
      horizontalAlignment="center"
      :class="type === 'secondary' ? 'layer-1-sec' : 'layer-1'"
    />
    <StackLayout
      row="0" col="0"
      width="209" height="60"
      verticalAlignment="center"
      horizontalAlignment="center"
      :class="type === 'secondary' ? 'layer-2-sec' : 'layer-2'"
    />
    <StackLayout
      row="0" col="0"
      width="195" height="54"
      verticalAlignment="center"
      horizontalAlignment="center"
      :class="type === 'secondary' ? 'layer-3-sec' : 'layer-3'"
    />
    <StackLayout
      row="0" col="0"
      width="195" height="51"
      verticalAlignment="center"
      horizontalAlignment="center"
      :class="type === 'secondary' ? 'layer-4-sec' : 'layer-4'"
    >
      <AppLabel
        :text="text"
        class="btn-text"
        verticalAlignment="center"
        horizontalAlignment="center"
      />
    </StackLayout>
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Animation, TouchAction, View } from "@nativescript/core";
import AppLabel from "./AppLabel.vue";

type ButtonType = "arena" | "secondary";

export default defineComponent({
  name: "AppButton",
  components: {
    AppLabel
  },
  props: {
    text: {
      type: String as PropType<string>,
      required: true,
    },
    icon: {
      type: String as PropType<string>,
      default: "",
    },
    type: {
      type: String as PropType<ButtonType>,
      default: "arena",
    },
  },
  emits: ["tap"],
  methods: {
    getWrapperView(): View | null {
      const el = this.$el as any;
      return el?.nativeView ?? null;
    },

    async animatePressDown(): Promise<void> {
      const view = this.getWrapperView();
      if (!view) return;
      await new Animation([{
        target: view,
        scale: { x: 0.92, y: 0.92 },
        duration: 100,
        curve: "easeOut",
      }]).play();
    },

    async animatePressUp(): Promise<void> {
      const view = this.getWrapperView();
      if (!view) return;

      await new Animation([{
        target: view,
        scale: { x: 1.06, y: 1.06 },
        duration: 120,
        curve: "easeOut",
      }]).play();

      await new Animation([{
        target: view,
        scale: { x: 1, y: 1 },
        duration: 100,
        curve: "easeIn",
      }]).play();
    },

    onTouch(event: any): void {
      if (event.action === TouchAction.down) {
        this.animatePressDown();
      } else if (
        event.action === TouchAction.up ||
        event.action === TouchAction.cancel
      ) {
        this.animatePressUp().then(() => {
          if (event.action === TouchAction.up) {
            this.$emit("tap");
          }
        });
      }
    },
  },
});
</script>

<style scoped>
/* ===== ARENA ===== */
.layer-1 {
  border-radius: 13;
  border-width: 2;
  border-color: #000000;
  background: linear-gradient(#FFDC66, #AC6721);
}
.layer-2 {
  border-radius: 13;
  background: linear-gradient(#F1AB3A, #EEAB3D);
}
.layer-3 {
  border-radius: 13;
  background: linear-gradient(#F3BD3F, #EA9134);
}
.layer-4 {
  border-radius: 13;
  background: linear-gradient(#F3BD3F, #F6BC42);
}

/* ===== SECONDARY ===== */
.layer-1-sec {
  border-radius: 13;
  border-width: 2;
  border-color: #000000;
  background: linear-gradient(#66C8FF, #1A5C8A);
}
.layer-2-sec {
  border-radius: 13;
  background: linear-gradient(#3A9EF1, #3D9DEE);
}
.layer-3-sec {
  border-radius: 13;
  background: linear-gradient(#3FBDF3, #3491EA);
}
.layer-4-sec {
  border-radius: 13;
  background: linear-gradient(#3FBDF3, #42BCF6);
}

/* ===== ТЕКСТ ===== */
.btn-text {
  font-weight: bold;
  color: #ffffff;
  font-size: 18;
  text-align: center;
}
</style>
