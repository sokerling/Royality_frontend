<template>
  <Label
    v-if="!isAndroid"
    :text="text"
    v-bind="$attrs"
  />
  <GridLayout
    v-else
    ref="container"
    v-bind="$attrs"
  >
    <Label
      ref="hiddenLabel"
      :text="text"
      v-bind="$attrs"
      visibility="hidden"
      :padding="`${strokeWidth * 2} ${strokeWidth * 3}`"
      textWrap="true"
    />
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { isAndroid, Color } from "@nativescript/core";

let CustomStrokeViewClass: any = null;

function ensureClass() {
  if (CustomStrokeViewClass) return;
  CustomStrokeViewClass = (android.view.View as any).extend({
    onDraw(canvas: any) {
      const params = this.strokeParams;
      if (!params || !params.text) return;

      const paint = new android.text.TextPaint();
      paint.setAntiAlias(true);
      paint.setTextSize(params.textSize);
      if (params.typeface) paint.setTypeface(params.typeface);

      const w = this.getWidth();
      const h = this.getHeight();

      const horizontalGravity = params.gravity & android.view.Gravity.HORIZONTAL_GRAVITY_MASK;
      let alignment = android.text.Layout.Alignment.ALIGN_CENTER;
      if (horizontalGravity === android.view.Gravity.LEFT || horizontalGravity === 0) {
        alignment = android.text.Layout.Alignment.ALIGN_NORMAL;
      } else if (horizontalGravity === android.view.Gravity.RIGHT) {
        alignment = android.text.Layout.Alignment.ALIGN_OPPOSITE;
      }

      const shadowDy = params.shDy;
      const strokeWidth = params.sWidth;

      // Функция для создания Layout (поддерживает многострочность)
      const createLayout = (color: number, isStroke: boolean = false) => {
        paint.setColor(color);
        if (isStroke) {
          paint.setStyle(android.graphics.Paint.Style.STROKE);
          paint.setStrokeWidth(strokeWidth);
          paint.setStrokeJoin(android.graphics.Paint.Join.ROUND);
          paint.setStrokeCap(android.graphics.Paint.Cap.ROUND);
        } else {
          paint.setStyle(android.graphics.Paint.Style.FILL);
          paint.setStrokeWidth(0);
        }

        return new android.text.StaticLayout(
          params.text,
          paint,
          w - (params.safePadding * 2),
          alignment,
          1.0,
          0.0,
          false
        );
      };

      // 1. Тень
      paint.setShadowLayer(shadowDy, 0, shadowDy / 2, params.shColor);
      const shadowLayout = createLayout(params.tColor);
      canvas.save();
      canvas.translate(params.safePadding, (h - shadowLayout.getHeight()) / 2);
      shadowLayout.draw(canvas);
      canvas.restore();
      paint.clearShadowLayer();

      // 2. Обводка
      const strokeLayout = createLayout(params.sColor, true);
      canvas.save();
      canvas.translate(params.safePadding, (h - strokeLayout.getHeight()) / 2);
      strokeLayout.draw(canvas);
      canvas.restore();

      // 3. Заливка
      const fillLayout = createLayout(params.tColor);
      canvas.save();
      canvas.translate(params.safePadding, (h - fillLayout.getHeight()) / 2);
      fillLayout.draw(canvas);
      canvas.restore();
    }
  });
}

export default defineComponent({
  name: "AppLabel",
  inheritAttrs: false,
  props: {
    text: { type: String as PropType<string>, required: true },
    strokeColor: { type: String as PropType<string>, default: "#000000" },
    strokeWidth: { type: Number as PropType<number>, default: 6 },
    shadowColor: { type: String as PropType<string>, default: "#000000" },
    shadowOffset: { type: Number as PropType<number>, default: 4 },
    textColor: { type: String as PropType<string>, default: "#ffffff" },
    textAlignment: { type: String as PropType<string>, default: "" }
  },
  data() {
    return { isAndroid, nativeInstance: null as any };
  },
  mounted() {
    if (!isAndroid) return;
    ensureClass();
    setTimeout(() => this.applyStrokeEffect(), 150);
  },
  watch: {
    text() {
      if (this.nativeInstance) this.applyStrokeEffect();
    }
  },
  methods: {
    applyStrokeEffect() {
      const containerView: any = (this.$refs["container"] as any)?.nativeView;
      const hiddenLabel: any = (this.$refs["hiddenLabel"] as any)?.nativeView;

      if (!containerView?.android || !hiddenLabel?.android) return;

      const density = containerView.android.getContext().getResources().getDisplayMetrics().density;
      const newView = new CustomStrokeViewClass(containerView.android.getContext());

      let gravity = hiddenLabel.android.getGravity();
      if (this.textAlignment === "left") gravity = android.view.Gravity.LEFT;
      else if (this.textAlignment === "right") gravity = android.view.Gravity.RIGHT;
      else if (this.textAlignment === "center") gravity = android.view.Gravity.CENTER_HORIZONTAL;

      const safePaddingPx = (this.strokeWidth * 3) * density;

      newView.strokeParams = {
        text: this.text,
        sWidth: this.strokeWidth * density,
        sColor: new Color(this.strokeColor).android,
        tColor: new Color(this.textColor).android,
        shColor: new Color(this.shadowColor).android,
        shDy: this.shadowOffset * density,
        textSize: hiddenLabel.android.getTextSize(),
        typeface: hiddenLabel.android.getTypeface(),
        gravity: gravity,
        safePadding: safePaddingPx
      };

      newView.setLayoutParams(new android.widget.FrameLayout.LayoutParams(-1, -1));
      newView.setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null);

      containerView.android.removeAllViews();
      containerView.android.addView(hiddenLabel.android);
      containerView.android.addView(newView);
      this.nativeInstance = newView;

      let pView = containerView.android;
      for (let i = 0; i < 8; i++) {
        if (pView && pView.setClipChildren) {
          pView.setClipChildren(false);
          pView.setClipToPadding?.(false);
          pView = pView.getParent?.();
        }
      }
    }
  }
});
</script>
