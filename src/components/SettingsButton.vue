<template>
  <ContentView 
    width="35" 
    height="40" 
    ref="container" 
    @loaded="onLoaded"
    @touch="onTouch"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isAndroid } from "@nativescript/core";

export default defineComponent({
  name: "SettingsButton",
  emits: ["tap"],
  methods: {
    onLoaded() {
      if (!isAndroid) return;
      setTimeout(() => {
        this.drawButton(false);
      }, 150);
    },

    onTouch(args: any) {
      if (!isAndroid) return;
      const action = args.action;
      if (action === "down") {
        this.drawButton(true);
      } else if (action === "up" || action === "cancel") {
        this.drawButton(false);
        if (action === "up") {
          this.$emit("tap");
        }
      }
    },

    drawButton(pressed: boolean) {
      const ref = this.$refs["container"];
      const view: any = ref
        ? ((Array.isArray(ref) ? ref[0] : ref) as any)?.nativeView ?? null
        : null;
      if (!view?.android) return;

      const nativeView = view.android;
      if (nativeView.getChildCount && nativeView.getChildCount() > 0) {
        nativeView.removeAllViews();
      }

      const context = nativeView.getContext();
      const density = context.getResources().getDisplayMetrics().density;
      const btnW = 35 * density;
      const btnH = pressed ? 35 * density : 40 * density;
      const offsetY = pressed ? 3 * density : 0;

      const CustomView = (android.view.View as any).extend({
        onDraw(canvas: any) {
          const paint = new android.graphics.Paint();
          paint.setAntiAlias(true);
          const radius = 13 * density;

        // === Слой 1: Тень снизу ===
          if (!pressed) {
            const shadowOffset = 4 * density;
            paint.setStyle(android.graphics.Paint.Style.FILL);
            paint.setColor(android.graphics.Color.argb(115, 0, 0, 0));
            const shadowRect = new android.graphics.RectF(0, shadowOffset, btnW, 35 * density + shadowOffset);
            canvas.drawRoundRect(shadowRect, radius, radius, paint);
            
            // ВАЖНО: Сбрасываем прозрачность кисти для кнопки
            paint.setAlpha(255);
          }

          const baseY = offsetY;

          // === Слой 2: Основной градиент (внешний) ===
          const outerRect = new android.graphics.RectF(0, baseY, btnW, baseY + 35 * density);
          const outerGradient = new android.graphics.LinearGradient(
            0, baseY, 0, baseY + 35 * density,
            android.graphics.Color.parseColor("#5BD3F3"),
            android.graphics.Color.parseColor("#2257A8"),
            android.graphics.Shader.TileMode.CLAMP
          );
          paint.setStyle(android.graphics.Paint.Style.FILL);
          paint.setShader(outerGradient);
          canvas.drawRoundRect(outerRect, radius, radius, paint);
          paint.setShader(null as any);

          paint.setStyle(android.graphics.Paint.Style.STROKE);
          paint.setStrokeWidth(2 * density);
          paint.setColor(android.graphics.Color.parseColor("#030303"));
          canvas.drawRoundRect(outerRect, radius, radius, paint);

          // === Слой 3: Внутренний градиент (средний) ===
          const midInset = 1 * density;
          const midRect = new android.graphics.RectF(
            midInset, baseY + midInset,
            btnW - midInset, baseY + 31.32 * density
          );
          const midGradient = new android.graphics.LinearGradient(
            0, baseY, 0, baseY + 31 * density,
            android.graphics.Color.parseColor("#4097F4"),
            android.graphics.Color.parseColor("#409AF1"),
            android.graphics.Shader.TileMode.CLAMP
          );
          paint.setStyle(android.graphics.Paint.Style.FILL);
          paint.setShader(midGradient);
          canvas.drawRoundRect(midRect, radius, radius, paint);
          paint.setShader(null as any);

          // === Слой 4: Верхняя половина (блик нижний) ===
          const innerInset = 1.5 * density;
          const innerRect = new android.graphics.RectF(
            innerInset, baseY + 13 * density,
            btnW - innerInset, baseY + 31 * density
          );
          const innerGradient = new android.graphics.LinearGradient(
            0, baseY + 13 * density, 0, baseY + 31 * density,
            android.graphics.Color.parseColor("#4097F4"),
            android.graphics.Color.parseColor("#4080FB"),
            android.graphics.Shader.TileMode.CLAMP
          );
          paint.setStyle(android.graphics.Paint.Style.FILL);
          paint.setShader(innerGradient);
          canvas.drawRoundRect(innerRect, radius - 2, radius - 2, paint);
          paint.setShader(null as any);

          // === Слой 5: Блик верхний (светлый) ===
          const highlightRect = new android.graphics.RectF(
            innerInset, baseY + innerInset,
            btnW - innerInset, baseY + 17 * density
          );
          const highlightGradient = new android.graphics.LinearGradient(
            0, baseY, 0, baseY + 17 * density,
            android.graphics.Color.parseColor("#4DADF9"),
            android.graphics.Color.parseColor("#4DADF9"),
            android.graphics.Shader.TileMode.CLAMP
          );
          paint.setStyle(android.graphics.Paint.Style.FILL);
          paint.setShader(highlightGradient);
          canvas.drawRoundRect(highlightRect, radius - 2, radius - 2, paint);
          paint.setShader(null as any);

          // === Слой 6: Иконка шестерёнки ===
          const iconSize = 22 * density;
          const iconX = (btnW - iconSize) / 2;
          const iconY = baseY + (35 * density - iconSize) / 2;

          const gearCx = iconX + iconSize / 2;
          const gearCy = iconY + iconSize / 2;
          const outerR = iconSize / 2;
          const innerR = outerR * 0.7;
          const teeth = 8;

          const gearPath = new android.graphics.Path();
          for (let i = 0; i < teeth * 2; i++) {
            const angle = (Math.PI / teeth) * i - Math.PI / 2;
            const r = i % 2 === 0 ? outerR : innerR;
            const x = gearCx + r * Math.cos(angle);
            const y = gearCy + r * Math.sin(angle);
            if (i === 0) gearPath.moveTo(x, y);
            else gearPath.lineTo(x, y);
          }
          gearPath.close();

          const gearGradient = new android.graphics.LinearGradient(
            0, iconY, 0, iconY + iconSize,
            android.graphics.Color.parseColor("#C5C5C5"),
            android.graphics.Color.parseColor("#FBF2F2"),
            android.graphics.Shader.TileMode.CLAMP
          );
          paint.setStyle(android.graphics.Paint.Style.FILL);
          paint.setShader(gearGradient);
          canvas.drawPath(gearPath, paint);
          paint.setShader(null as any);

          paint.setStyle(android.graphics.Paint.Style.STROKE);
          paint.setStrokeWidth(0.4 * density);
          paint.setColor(android.graphics.Color.BLACK);
          canvas.drawPath(gearPath, paint);

          const holeCx = gearCx;
          const holeCy = gearCy;
          const holeR = outerR * 0.28;

          const holeGradient = new android.graphics.LinearGradient(
            0, holeCy - holeR, 0, holeCy + holeR,
            android.graphics.Color.parseColor("#1778C5"),
            android.graphics.Color.parseColor("#9DD2FB"),
            android.graphics.Shader.TileMode.CLAMP
          );
          paint.setStyle(android.graphics.Paint.Style.FILL);
          paint.setShader(holeGradient);
          canvas.drawCircle(holeCx, holeCy, holeR, paint);
          paint.setShader(null as any);

          paint.setStyle(android.graphics.Paint.Style.STROKE);
          paint.setStrokeWidth(1 * density);
          paint.setColor(android.graphics.Color.BLACK);
          canvas.drawCircle(holeCx, holeCy, holeR, paint);
        }
      });

      const customView = new CustomView(context);
      const lp = new android.view.ViewGroup.LayoutParams(
        Math.round(btnW),
        Math.round(40 * density)
      );
      customView.setLayoutParams(lp);
      nativeView.addView(customView);
    },
  },
});
</script>