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
      ref="textContainer"
    >
      <Label
        :text="text"
        class="btn-text"
        verticalAlignment="center"
        horizontalAlignment="center"
        ref="btnLabel"
      />
    </StackLayout>
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Animation, TouchAction, View, isAndroid } from "@nativescript/core";

type ButtonType = "arena" | "secondary";

export default defineComponent({
  name: "AppButton",
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
  mounted() {
    if (!isAndroid) return;
    setTimeout(() => {

      // Отключаем clip на враппере и вверх по дереву
      const wrapperRef = this.$refs["wrapper"];
      const wrapperView: View | null = wrapperRef
        ? ((Array.isArray(wrapperRef) ? wrapperRef[0] : wrapperRef) as any)?.nativeView ?? null
        : null;
      if (wrapperView?.android) {
        let p = wrapperView.android;
        for (let i = 0; i < 6; i++) {
          if (p) {
            if (p.setClipChildren) p.setClipChildren(false);
            if (p.setClipToPadding) p.setClipToPadding(false);
            p = p.getParent?.();
          }
        }
      }

      // Получаем Label
      const labelRef = this.$refs["btnLabel"];
      const labelView: View | null = labelRef
        ? ((Array.isArray(labelRef) ? labelRef[0] : labelRef) as any)?.nativeView ?? null
        : null;
      if (!labelView?.android) return;

      const context = labelView.android.getContext();
      const density = context.getResources().getDisplayMetrics().density;
      const strokeWidth = 4 * density;
      const shadowDy = 4 * density;

      const StrokeTextView = (android as any).widget.TextView.extend({
        onDraw(canvas: any) {
          const paint = this.getPaint();

          this.setLayerType(1, null);

          // Тень
          paint.setShadowLayer(0.01, 0, shadowDy, android.graphics.Color.BLACK);
          paint.setStyle(android.graphics.Paint.Style.FILL);
          paint.setStrokeWidth(0);
          this.setTextColor(android.graphics.Color.WHITE);
          this.super.onDraw(canvas);

          paint.clearShadowLayer();

          // Обводка
          paint.setStyle(android.graphics.Paint.Style.STROKE);
          paint.setStrokeWidth(strokeWidth);
          paint.setStrokeJoin(android.graphics.Paint.Join.ROUND);
          paint.setStrokeCap(android.graphics.Paint.Cap.ROUND);
          this.setTextColor(android.graphics.Color.BLACK);
          this.super.onDraw(canvas);

          // Белый текст
          paint.setStyle(android.graphics.Paint.Style.FILL);
          paint.setStrokeWidth(0);
          this.setTextColor(android.graphics.Color.WHITE);
          this.super.onDraw(canvas);
        }
      });

      const newView = new StrokeTextView(context);
      newView.setText(labelView.android.getText());
      newView.setTypeface(labelView.android.getTypeface());
      newView.setTextSize(0, labelView.android.getTextSize());
      newView.setGravity(android.view.Gravity.CENTER);
      newView.setLayerType(1, null);
      newView.setPadding(
        Math.ceil(strokeWidth),
        Math.ceil(strokeWidth),
        Math.ceil(strokeWidth),
        Math.ceil(strokeWidth + shadowDy)
      );

      const lp = new android.view.ViewGroup.LayoutParams(
        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
        android.view.ViewGroup.LayoutParams.MATCH_PARENT,
      );
      newView.setLayoutParams(lp);

      const parentView = labelView.android.getParent();
      if (parentView) {
        if (parentView.setClipChildren) parentView.setClipChildren(false);
        if (parentView.setClipToPadding) parentView.setClipToPadding(false);
        const index = parentView.indexOfChild(labelView.android);
        parentView.removeView(labelView.android);
        parentView.addView(newView, index);

        // Отключаем clip на 5 уровней вверх
        let p = parentView;
        for (let i = 0; i < 5; i++) {
          if (p) {
            if (p.setClipChildren) p.setClipChildren(false);
            if (p.setClipToPadding) p.setClipToPadding(false);
            p = p.getParent?.();
          }
        }
      }

    }, 150);
  },
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
