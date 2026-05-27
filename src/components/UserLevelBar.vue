<template>
  <GridLayout
    rows="*"
    columns="*"
    class="level-bar-root"
    :height="containerHeight"
    @loaded="disableClippingDeep"
  >
    <GridLayout
      row="0"
      col="0"
      columns="*"
      class="xp-bar-bg"
      :class="{ 'xp-bar-bg--compact': compact }"
      :width="barWidth"
      :height="barHeight"
      :marginLeft="barOffset"
      horizontalAlignment="left"
      verticalAlignment="center"
    >
      <StackLayout
        col="0"
        class="xp-bar-fill"
        :class="{ 'xp-bar-fill--compact': compact }"
        :width="fillWidth"
        :height="barHeight"
        horizontalAlignment="left"
      />
      <Label
        col="0"
        :text="progressText"
        class="xp-text"
        :class="{ 'xp-text--compact': compact }"
        horizontalAlignment="center"
        verticalAlignment="center"
      />
    </GridLayout>

    <StarBadge
      row="0"
      col="0"
      :level="safeLevel"
      :size="starSize"
      horizontalAlignment="left"
      verticalAlignment="center"
      :marginTop="compact ? -4 : 0"
    />
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { isAndroid } from "@nativescript/core";
import StarBadge from "./StarBadge.vue";

function toFinite(value: unknown, fallback: number): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export default defineComponent({
  name: "UserLevelBar",
  components: { StarBadge },
  props: {
    level: {
      type: Number as PropType<number>,
      default: 1,
    },
    currentXp: {
      type: Number as PropType<number>,
      default: 50,
    },
    requiredXp: {
      type: Number as PropType<number>,
      default: 100,
    },
    compact: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  computed: {
    safeLevel(): number {
      return Math.max(1, Math.round(toFinite(this.level, 1)));
    },
    safeRequiredXp(): number {
      return Math.max(1, Math.round(toFinite(this.requiredXp, 100)));
    },
    safeCurrentXp(): number {
      const value = Math.max(0, Math.round(toFinite(this.currentXp, 0)));
      return Math.min(value, this.safeRequiredXp);
    },
    barWidth(): number {
      return this.compact ? 132 : 160;
    },
    barHeight(): number {
      return this.compact ? 22 : 30;
    },
    starSize(): number {
      return this.compact ? 32 : 48;
    },
    barOffset(): number {
      return this.compact ? 16 : 24;
    },
    containerHeight(): number {
      return Math.max(this.starSize, this.barHeight);
    },
    fillWidth(): number {
      const progress = this.safeCurrentXp / this.safeRequiredXp;
      return Math.max(0, Math.round(this.barWidth * progress));
    },
    progressText(): string {
      return `${this.safeCurrentXp} / ${this.safeRequiredXp}`;
    },
  },
  methods: {
    disableClippingDeep(args: any): void {
      if (!isAndroid) return;
      const nativeView = args?.object?.nativeView;
      if (!nativeView) return;

      try {
        let current = nativeView;
        for (let i = 0; i < 8; i++) {
          if (!current) break;
          if (current.setClipChildren) current.setClipChildren(false);
          if (current.setClipToPadding) current.setClipToPadding(false);
          current = current.getParent();
        }
      } catch {
        // no-op
      }
    },
  },
});
</script>

<style scoped>
.level-bar-root {
  background-color: transparent;
}

.xp-bar-bg {
  border-radius: 15;
  background-color: #1a0f07;
  border-width: 1;
  border-color: #000000;
}

.xp-bar-bg--compact {
  border-radius: 8;
  border-width: 2;
}

.xp-bar-fill {
  border-radius: 15;
  background: linear-gradient(#6ec6ff, #1a7ad4);
}

.xp-bar-fill--compact {
  border-radius: 6;
  background: linear-gradient(#6ec6ff, #1a7ad4);
}

.xp-text {
  font-family: "supercell-magic_0";
  color: #ffffff;
  font-size: 11;
  text-shadow: 0 1.6 0.1 rgba(0, 0, 0, 0.91);
}

.xp-text--compact {
  font-size: 9;
}
</style>
