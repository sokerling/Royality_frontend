<template>
  <GridLayout :width="size" :height="size" rows="*" columns="*" class="star-badge">
    <Image
      row="0"
      col="0"
      src="~/assets/star.png"
      stretch="fill"
      :width="size"
      :height="size"
      isUserInteractionEnabled="false"
    />
    <AppLabel
      row="0"
      col="0"
      :text="String(level)"
      class="star-level"
      :style="{ fontSize: labelFontSize }"
      :strokeWidth="starStrokeWidth"
      strokeColor="#0A3A70"
      :shadowOffset="1"
      horizontalAlignment="center"
      verticalAlignment="center"
    />
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import AppLabel from "./AppLabel.vue";

export default defineComponent({
  name: "StarBadge",
  components: {
    AppLabel,
  },
  props: {
    level: {
      type: Number as PropType<number>,
      default: 5,
    },
    size: {
      type: Number as PropType<number>,
      default: 48,
    },
  },
  computed: {
    labelFontSize(): number {
      return Math.max(12, Math.round(this.size * 0.38));
    },
    starStrokeWidth(): number {
      return this.size <= 36 ? 1.5 : 2;
    },
  },
});
</script>

<style scoped>
.star-badge {
  background-color: transparent;
}

.star-level {
  font-family: "supercell-magic_0";
  font-size: 18;
  color: #ffffff;
  text-align: center;
  margin-top: 1;
}
</style>
