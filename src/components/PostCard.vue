<template>
  <GridLayout class="card-wrapper" rows="*" columns="*" @touch="onCardTouch" ref="wrapper">

    <!-- Внешняя рамка -->
    <StackLayout row="0" col="0" class="card-border" />

    <!-- Внутренняя карточка -->
    <StackLayout row="0" col="0" class="card" margin="3">

      <!-- Шапка: аватар + никнейм -->
      <GridLayout columns="46, *" class="card-header">
        <GridLayout col="0" rows="*" columns="*">
          <Image
            row="0" col="0"
            :src="post.avatarUrl"
            width="38"
            height="38"
            class="avatar"
            stretch="aspectFill"
          />
          <StackLayout row="0" col="0" class="avatar-ring" />
        </GridLayout>
        <Label
          col="1"
          :text="post.username"
          class="username"
          verticalAlignment="center"
        />
      </GridLayout>

      <!-- Разделитель -->
      <StackLayout class="divider" />

      <!-- Текст поста -->
      <Label :text="post.text" class="post-text" textWrap="true" />

      <!-- Футер: лайки + комментарии -->
      <GridLayout columns="auto, auto, *" class="card-footer">
        <StackLayout col="0" orientation="horizontal" class="action-btn" @tap="onLike">
          <Label :text="post.liked ? '❤️' : '🤍'" class="action-icon" />
          <Label :text="String(post.likes)" class="action-count" />
        </StackLayout>
        <StackLayout col="1" orientation="horizontal" class="action-btn" marginLeft="16">
          <Label text="💬" class="action-icon" />
          <Label :text="String(post.comments)" class="action-count" />
        </StackLayout>
      </GridLayout>

    </StackLayout>
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Animation, View } from "@nativescript/core";
import type { Post } from "../types/post";

export default defineComponent({
  name: "PostCard",
  props: {
    post: {
      type: Object as PropType<Post>,
      required: true,
    },
  },
  emits: ["like"],
  methods: {
    onLike(): void {
      this.$emit("like", this.post.id);
    },

    onCardTouch(event: any): void {
      const ref = this.$refs["wrapper"];
      const view: View | null = ref
        ? ((Array.isArray(ref) ? ref[0] : ref) as any)?.nativeView ?? null
        : null;
      if (!view) return;

      if (event.action === "down") {
        new Animation([{
          target: view,
          scale: { x: 0.97, y: 0.97 },
          duration: 80,
          curve: "easeOut",
        }]).play().catch(() => {});
      } else if (event.action === "up" || event.action === "cancel") {
        new Animation([{
          target: view,
          scale: { x: 1, y: 1 },
          duration: 100,
          curve: "easeOut",
        }]).play().catch(() => {});
      }
    },
  },
});
</script>

<style scoped>
.card-wrapper {
  margin: 8 12;
  border-radius: 14;
}

.card-border {
  border-radius: 14;
  background: linear-gradient(#8B4513, #5C2E00);
  border-width: 2;
  border-color: #3a1a00;
}

.card {
  border-radius: 12;
  background: linear-gradient(#FFF8F0, #FFE8CC);
  padding: 12;
}

.card-header {
  margin-bottom: 8;
}

.avatar {
  border-radius: 19;
  width: 38;
  height: 38;
}

.avatar-ring {
  border-radius: 21;
  width: 42;
  height: 42;
  border-width: 2;
  border-color: #c87800;
  background-color: transparent;
  margin: -2;
}

.username {
  font-size: 14;
  font-weight: bold;
  color: #3a1a00;
  margin-left: 10;
}

.divider {
  height: 1;
  background-color: #d4956a;
  margin-bottom: 8;
  opacity: 0.5;
}

.post-text {
  font-size: 13;
  color: #4a2800;
  line-height: 18;
  margin-bottom: 10;
}

.card-footer {
  margin-top: 4;
}

.action-btn {
  verticalAlignment: center;
}

.action-icon {
  font-size: 16;
  margin-right: 5;
}

.action-count {
  font-size: 13;
  color: #7a4a00;
  verticalAlignment: center;
}
</style>
