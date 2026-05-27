<template>
  <GridLayout
    :width="buttonWidth"
    :height="buttonHeight"
    :rows="layoutRows"
    :columns="layoutCols"
    @touch="onTouch"
    ref="wrapper"
  >
    <StackLayout
      row="0" col="0"
      :width="layer1Width" :height="layer1Height"
      verticalAlignment="center"
      horizontalAlignment="center"
      :class="type === 'secondary' ? 'layer-1-sec' : 'layer-1'"
    />
    <StackLayout
      row="0" col="0"
      :width="layer2Width" :height="layer2Height"
      verticalAlignment="center"
      horizontalAlignment="center"
      :class="type === 'secondary' ? 'layer-2-sec' : 'layer-2'"
    />
    <StackLayout
      row="0" col="0"
      :width="layer3Width" :height="layer3Height"
      verticalAlignment="center"
      horizontalAlignment="center"
      :class="type === 'secondary' ? 'layer-3-sec' : 'layer-3'"
    />
    <StackLayout
      row="0" col="0"
      :width="layer4Width" :height="layer4Height"
      verticalAlignment="center"
      horizontalAlignment="center"
      :class="type === 'secondary' ? 'layer-4-sec' : 'layer-4'"
    >
      <AppLabel
        :text="text"
        class="btn-text"
        :class="{ 'btn-text--compact': compact }"
        :strokeWidth="compact ? 4 : 6"
        :shadowOffset="compact ? 3 : 4"
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
    compact: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: ["tap"],
  computed: {
    sizeScale(): number {
      return this.compact ? 0.72 : 1;
    },
    buttonWidth(): number {
      return Math.round(220 * this.sizeScale);
    },
    buttonHeight(): number {
      return Math.round(76 * this.sizeScale);
    },
    layoutRows(): string {
      return String(this.buttonHeight);
    },
    layoutCols(): string {
      return String(this.buttonWidth);
    },
    layer1Width(): number {
      return Math.round(213 * this.sizeScale);
    },
    layer1Height(): number {
      return Math.round(68 * this.sizeScale);
    },
    layer2Width(): number {
      return Math.round(209 * this.sizeScale);
    },
    layer2Height(): number {
      return Math.round(60 * this.sizeScale);
    },
    layer3Width(): number {
      return Math.round(195 * this.sizeScale);
    },
    layer3Height(): number {
      return Math.round(54 * this.sizeScale);
    },
    layer4Width(): number {
      return Math.round(195 * this.sizeScale);
    },
    layer4Height(): number {
      return Math.round(51 * this.sizeScale);
    },
  },
  methods: {
    isDownAction(action: unknown): boolean {
      return action === TouchAction.down || action === "down";
    },
    isUpAction(action: unknown): boolean {
      return action === TouchAction.up || action === "up";
    },
    isCancelAction(action: unknown): boolean {
      return action === TouchAction.cancel || action === "cancel";
    },
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
      if (this.isDownAction(event.action)) {
        void this.animatePressDown().catch(() => {});
      } else if (this.isUpAction(event.action) || this.isCancelAction(event.action)) {
        const shouldEmitTap = this.isUpAction(event.action);
        void this.animatePressUp()
          .catch(() => {})
          .finally(() => {
            if (shouldEmitTap) {
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

.btn-text--compact {
  font-size: 13;
}
</style>
