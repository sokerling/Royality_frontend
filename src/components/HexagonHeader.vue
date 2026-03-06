<template>
  <ContentView :width="width" :height="height" ref="container" @loaded="onLoaded" />
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ContentView, isAndroid } from "@nativescript/core";

export default defineComponent({
  name: "HexagonHeader",
  props: {
    text: {
      type: String as PropType<string>,
      default: "Обо мне",
    },
    width: {
      type: Number as PropType<number>,
      default: 330,
    },
    height: {
      type: Number as PropType<number>,
      default: 64,
    },
    sharpness: {
      type: Number as PropType<number>,
      default: 0.5,
    },
    showShadow: {
      type: Boolean as PropType<boolean>,
      default: false,
    }
  },
  methods: {
    onLoaded(args: any) {
      if (!isAndroid) return;
      const view = args.object;
      if (!view?.nativeView) return;

      try {
        let current = view.nativeView;
        for (let i = 0; i < 10; i++) {
          if (!current) break;
          if (current.setClipChildren) current.setClipChildren(false);
          if (current.setClipToPadding) current.setClipToPadding(false);
          current = current.getParent();
        }
      } catch (e) {}
    }
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
      const w = this.width * density;
      const h = this.height * density;
      const textValue = this.text;
      const sharpnessValue = this.sharpness;
      const hasShadow = this.showShadow;

      const CustomView = (android.view.View as any).extend({
        onDraw(canvas: any) {
          const paint = new android.graphics.Paint();
          paint.setAntiAlias(true);

          const sideWidth = (h / 2) * sharpnessValue;
          
          const drawHexagon = (path: any, rect: any) => {
            const sw = sideWidth * (rect.width() / w);
            path.reset();
            path.moveTo(rect.left + sw, rect.top);
            path.lineTo(rect.right - sw, rect.top);
            path.lineTo(rect.right, rect.top + rect.height() / 2);
            path.lineTo(rect.right - sw, rect.bottom);
            path.lineTo(rect.left + sw, rect.bottom);
            path.lineTo(rect.left, rect.top + rect.height() / 2);
            path.close();
          };

          const path = new android.graphics.Path();

          // 0. Внешняя тень (если включена)
          if (hasShadow) {
            const shadowPath = new android.graphics.Path();
            const shadowOffset = 4 * density;
            const shadowRect = new android.graphics.RectF(0, shadowOffset, w, h + shadowOffset);
            
            drawHexagon(shadowPath, shadowRect);
            
            paint.setShader(null as any);
            paint.setColor(android.graphics.Color.argb(115, 0, 0, 0));
            paint.setStyle(android.graphics.Paint.Style.FILL);
            canvas.drawPath(shadowPath, paint);
            
            // ВАЖНО: Сбрасываем прозрачность (alpha) обратно на 100%, 
            // чтобы следующие рамки не стали полупрозрачными!
            paint.setAlpha(255);
          }

          // 1. Внешняя рамка (золотой градиент)
          const outerRect = new android.graphics.RectF(0, 0, w, h);
          drawHexagon(path, outerRect);
          
          const outerGradient = new android.graphics.LinearGradient(
            0, h, 0, 0,
            android.graphics.Color.parseColor("#875007"),
            android.graphics.Color.parseColor("#F0BB5B"),
            android.graphics.Shader.TileMode.CLAMP
          );
          paint.setShader(outerGradient);
          paint.setStyle(android.graphics.Paint.Style.FILL);
          canvas.drawPath(path, paint);

          paint.setShader(null as any);
          paint.setColor(android.graphics.Color.BLACK);
          paint.setStyle(android.graphics.Paint.Style.STROKE);
          paint.setStrokeWidth(2 * density);
          canvas.drawPath(path, paint);

          // 2. Средняя рамка
          const midPadding = 6 * density;
          const midRect = new android.graphics.RectF(midPadding, midPadding, w - midPadding, h - midPadding);
          drawHexagon(path, midRect);
          
          const midGradient = new android.graphics.LinearGradient(
            0, 0, 0, h,
            android.graphics.Color.parseColor("#A55A0A"),
            android.graphics.Color.parseColor("#F1BC5C"),
            android.graphics.Shader.TileMode.CLAMP
          );
          paint.setShader(midGradient);
          paint.setStyle(android.graphics.Paint.Style.FILL);
          canvas.drawPath(path, paint);

          paint.setShader(null as any);
          paint.setColor(android.graphics.Color.parseColor("#C0822D"));
          paint.setStyle(android.graphics.Paint.Style.STROKE);
          paint.setStrokeWidth(2 * density);
          canvas.drawPath(path, paint);

          // 3. Внутренний синий блок
          const innerPadding = 10 * density;
          const innerRect = new android.graphics.RectF(innerPadding, innerPadding, w - innerPadding, h - innerPadding);
          drawHexagon(path, innerRect);
          
          const innerGradient = new android.graphics.LinearGradient(
            0, 0, w, 0,
            android.graphics.Color.parseColor("#052D71"),
            android.graphics.Color.parseColor("#1E61B1"),
            android.graphics.Shader.TileMode.CLAMP
          );
          paint.setShader(innerGradient);
          paint.setStyle(android.graphics.Paint.Style.FILL);
          canvas.drawPath(path, paint);

          paint.setShader(null as any);
          paint.setColor(android.graphics.Color.BLACK);
          paint.setStyle(android.graphics.Paint.Style.STROKE);
          paint.setStrokeWidth(1.5 * density);
          canvas.drawPath(path, paint);

          // 4. Текст
          let typeface = android.graphics.Typeface.DEFAULT;
          try {
             const tf = android.graphics.Typeface.create("supercell-magic_0", android.graphics.Typeface.NORMAL);
             if (tf && tf !== android.graphics.Typeface.DEFAULT && 
                 tf !== android.graphics.Typeface.SANS_SERIF && 
                 tf !== android.graphics.Typeface.SERIF && 
                 tf !== android.graphics.Typeface.MONOSPACE) {
                typeface = tf;
             } else {
                const assetManager = context.getAssets();
                const paths = [
                  "fonts/supercell-magic_0.ttf", 
                  "app/fonts/supercell-magic_0.ttf", 
                  "supercell-magic_0.ttf",
                  "fonts/supercell-magic_0.otf",
                  "app/fonts/supercell-magic_0.otf"
                ];
                for (const p of paths) {
                    try {
                        const assetTf = android.graphics.Typeface.createFromAsset(assetManager, p);
                        if (assetTf) { typeface = assetTf; break; }
                    } catch(e) {}
                }
             }
          } catch(e) {}

          const textX = w / 2;
          const textPaint = new android.graphics.Paint();
          textPaint.setAntiAlias(true);
          textPaint.setTextSize(24 * density);
          textPaint.setTextAlign(android.graphics.Paint.Align.CENTER);
          textPaint.setTypeface(typeface);
          
          const textY = (h / 2) - ((textPaint.descent() + textPaint.ascent()) / 2);

          const shadowPaint = new android.graphics.Paint(textPaint);
          shadowPaint.setColor(android.graphics.Color.argb(232, 0, 0, 0));
          canvas.drawText(textValue, textX, textY + (1.6 * density), shadowPaint);

          const strokePaint = new android.graphics.Paint(textPaint);
          strokePaint.setColor(android.graphics.Color.parseColor("#010101"));
          strokePaint.setStyle(android.graphics.Paint.Style.STROKE);
          strokePaint.setStrokeWidth(4 * density);
          canvas.drawText(textValue, textX, textY, strokePaint);

          textPaint.setColor(android.graphics.Color.WHITE);
          textPaint.setStyle(android.graphics.Paint.Style.FILL);
          canvas.drawText(textValue, textX, textY, textPaint);
        }
      });

      const customView = new CustomView(context);
      const lp = new android.view.ViewGroup.LayoutParams(Math.round(w), Math.round(h));
      customView.setLayoutParams(lp);
      view.android.addView(customView);
    }, 150);
  },
});
</script>