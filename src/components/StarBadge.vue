<template>
  <ContentView :width="size" :height="size" ref="container" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ContentView, isAndroid } from "@nativescript/core";

export default defineComponent({
  name: "StarBadge",
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
  mounted() {
    if (!isAndroid) return;
    setTimeout(() => {
      const ref = this.$refs["container"];
      const view: ContentView | null = ref
        ? ((Array.isArray(ref) ? ref[0] : ref) as any)?.nativeView ?? null
        : null;
      if (!view?.android) return;

      const context = view.android.getContext();
      const density = context.getResources().getDisplayMetrics().density;
      const px = this.size * density;
      const levelValue = this.level;

      const CustomView = (android.view.View as any).extend({
        onDraw(canvas: any) {
          const cx = px / 2;
          const cy = px / 2;
          const outerR = px / 2 - density;
          const innerR = outerR * 0.45;
          const points = 5;

          const path = new android.graphics.Path();
          for (let i = 0; i < points * 2; i++) {
            const angle = (Math.PI / points) * i - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) path.moveTo(x, y);
            else path.lineTo(x, y);
          }
          path.close();

          const fillPaint = new android.graphics.Paint();
          fillPaint.setAntiAlias(true);
          fillPaint.setStyle(android.graphics.Paint.Style.FILL);
          fillPaint.setColor(android.graphics.Color.parseColor("#1a7ad4"));
          canvas.drawPath(path, fillPaint);

          const strokePaint = new android.graphics.Paint();
          strokePaint.setAntiAlias(true);
          strokePaint.setStyle(android.graphics.Paint.Style.STROKE);
          strokePaint.setStrokeWidth(2 * density);
          strokePaint.setColor(android.graphics.Color.parseColor("#0a4a8a"));
          canvas.drawPath(path, strokePaint);

          const textPaint = new android.graphics.Paint();
          textPaint.setAntiAlias(true);
          textPaint.setColor(android.graphics.Color.WHITE);
          textPaint.setTextSize(px * 0.38);
          textPaint.setTextAlign(android.graphics.Paint.Align.CENTER);
          textPaint.setFakeBoldText(true);
          const textY = cy - (textPaint.ascent() + textPaint.descent()) / 2;
          canvas.drawText(String(levelValue), cx, textY, textPaint);
        }
      });

      const customView = new CustomView(context);
      const lp = new android.view.ViewGroup.LayoutParams(
        Math.round(px),
        Math.round(px)
      );
      customView.setLayoutParams(lp);
      customView.setLayerType(1, null);
      view.android.addView(customView);
    }, 150);
  },
});
</script>
