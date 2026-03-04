<template>
  <GridLayout rows="*" backgroundColor="transparent">
    <ScrollView row="0" backgroundColor="transparent">
      <StackLayout :paddingTop="statusBarHeight" paddingBottom="84" backgroundColor="transparent">

        <!-- Уровень -->
        <StackLayout class="top-panel">
          <GridLayout columns="*" rows="*">
            <GridLayout row="0" col="0" columns="*" class="xp-bar-bg" marginLeft="24" horizontalAlignment="left">
              <StackLayout col="0" class="xp-bar-fill" horizontalAlignment="left" />
              <Label col="0" text="50 / 100" class="xp-text" horizontalAlignment="center" verticalAlignment="center" />
            </GridLayout>
            <StarBadge
              row="0" col="0"
              :level="5"
              :size="48"
              horizontalAlignment="left"
              verticalAlignment="center"
              marginLeft="0"
            />
          </GridLayout>
        </StackLayout>

        <!-- Заголовок с градиентным фоном -->
        <StackLayout class="feed-header">
          <Label
            text="Новостная лента"
            class="feed-title"
            ref="titleLabel"
          />
        </StackLayout>

        <!-- Контейнер ленты с объёмным эффектом -->
        <GridLayout rows="*" class="feed-container" margin="0" padding="0">
          <!-- Внешний слой (самый большой) -->
          <StackLayout row="0" class="feed-bg-outer" />

          <!-- Внутренний слой (на 5px меньше среднего = 10px от внешнего) -->
          <StackLayout row="0" class="feed-bg-inner" margin="5">
            <!-- Контент ленты -->
            <StackLayout paddingTop="-2" paddingBottom="0">
              <PostCard
                v-for="post in posts"
                :key="post.id"
                :post="post"
                @like="toggleLike"
              />
            </StackLayout>
          </StackLayout>
        </GridLayout>

        <!-- Нижний градиентный элемент -->
        <StackLayout class="feed-footer">
          <Label text="" class="footer-text" />
        </StackLayout>

      </StackLayout>
    </ScrollView>
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isAndroid, View } from "@nativescript/core";
import PostCard from "../../components/PostCard.vue";
import StarBadge from "../../components/StarBadge.vue";
import { mockPosts } from "../../mocks/posts";
import type { Post } from "../../types/post";

export default defineComponent({
  name: "FeedTab",
  components: { PostCard, StarBadge },
  data() {
    return {
      posts: mockPosts.map((p) => ({ ...p })) as Post[],
      statusBarHeight: 0 as number,
    };
  },
  mounted() {
    if (isAndroid) {
      const resourceId = android.content.res.Resources.getSystem()
        .getIdentifier("status_bar_height", "dimen", "android");
      if (resourceId > 0) {
        const heightPx = android.content.res.Resources.getSystem()
          .getDimensionPixelSize(resourceId);
        const density = android.content.res.Resources.getSystem()
          .getDisplayMetrics().density;
        this.statusBarHeight = Math.ceil(heightPx / density) + 15;
      }

      setTimeout(() => {
        this.styleTitleText();
      }, 150);
    }
  },
  methods: {
    toggleLike(id: number): void {
      const post = this.posts.find((p) => p.id === id);
      if (!post) return;
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
    },

    styleTitleText(): void {
      if (!isAndroid) return;

      // Получаем Label
      const labelRef = this.$refs["titleLabel"];
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
    },
  },
});
</script>

<style scoped>
.top-panel {
  padding: 10 14;
  background-color: transparent;
}

.xp-bar-bg {
  width: 160;
  height: 30;
  border-radius: 15;
  background-color: #1a0f07;
  border-width: 1;
  border-color: #000000;
}

.xp-bar-fill {
  width: 80;
  height: 30;
  border-radius: 15;
  background: linear-gradient(#6ec6ff, #1a7ad4);
}

.xp-text {
  font-size: 11;
  color: #ffffff;
}

.feed-header {
  padding: 5 14;

  /* Базовый градиент (работает) */
  background-image: linear-gradient(
    0deg,
    #4a2a0a 0%,
    #5c3317 20%,
    #7a4a1a 40%,
    #5c3317 60%,
    #4a2a0a 80%,
    #6b3f1a 100%
  );
}

.feed-footer {
  padding: 20 14;

  /* Тот же градиент, что и в header */
  background-image: linear-gradient(
    0deg,
    #4a2a0a 0%,
    #5c3317 20%,
    #7a4a1a 40%,
    #5c3317 60%,
    #4a2a0a 80%,
    #6b3f1a 100%
  );
}

.feed-title {
  font-size: 22;
  font-weight: bold;
  color: #ffffff;
  text-align: left;
}

.footer-text {
  height: 5;  /* Просто чтобы элемент имел высоту */
}

/* Контейнер для объёмного эффекта */
.feed-container {
  margin: 0;
  padding: 0;
}

/* Внешний слой (самый большой) */
.feed-bg-outer {
  background-color: #C9A37C;
}

/* Внутренний слой (контент) */
.feed-bg-inner {
  background-color: #E9CAA6;
  border-radius: 15;
}
</style>