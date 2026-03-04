<template>
  <GridLayout class="card-wrapper" rows="*" columns="*" @touch="onCardTouch" ref="wrapper">

    <!-- Тень (внешний слой) -->
    <StackLayout row="0" col="0" class="card-shadow" />

    <!-- Внутренняя карточка -->
    <StackLayout row="0" col="0" class="card" margin="4">

      <!-- Шапка: аватар + никнейм + время -->
      <GridLayout columns="auto, *, auto" rows="auto, auto" class="card-header">

        <!-- Аватар (занимает 2 строки) -->
        <GridLayout row="0" rowSpan="2" col="0" class="avatar-container">
          <!-- Тень для аватара -->
          <StackLayout class="avatar-shadow" />
          <!-- Аватар -->
          <Image
            :src="post.user.avatarUrl"
            width="48"
            height="48"
            class="avatar"
            stretch="aspectFill"
          />
        </GridLayout>

        <!-- Никнейм (1 строка, 1 колонка) -->
        <Label
          row="0" col="1"
          :text="post.user.username"
          class="username"
          verticalAlignment="bottom"
          :color="post.user.usernameColor"
        />

        <!-- Время (1 строка, 2 колонка) -->
        <Label
          row="0" col="2"
          :text="post.timeAgo"
          class="post-time"
          verticalAlignment="bottom"
        />

        <!-- Первый разделитель (2 строка, 1-2 колонки) -->
        <StackLayout row="1" col="1" colSpan="2" class="divider first-divider" />
      </GridLayout>

      <!-- Текст поста -->
      <Label :text="post.text" class="post-text" textWrap="true" />

      <!-- Второй разделитель -->
      <StackLayout class="divider second-divider" />

      <!-- Футер: лайки | комментарии | репост -->
      <GridLayout columns="auto, auto, auto, auto, *" class="card-footer">

        <!-- Лайки -->
        <StackLayout col="0" orientation="horizontal" class="action-btn" @tap="onLike">
          <Label :text="post.liked ? '❤️' : '🤍'" class="action-icon" />
          <Label :text="String(post.likes)" class="action-count" />
        </StackLayout>

        <!-- Вертикальный разделитель -->
        <StackLayout col="1" class="vertical-divider" />

        <!-- Комментарии -->
        <StackLayout col="2" orientation="horizontal" class="action-btn">
          <Label text="💬" class="action-icon" />
          <Label :text="String(post.comments)" class="action-count" />
          <Label text=" Комментариев" class="action-label" />
        </StackLayout>

        <!-- Вертикальный разделитель -->
        <StackLayout col="3" class="vertical-divider" />

        <!-- Репост -->
        <StackLayout col="4" orientation="horizontal" class="action-btn">
          <Label text="🔄" class="action-icon" />
          <Label text="Репост" class="action-label" />
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
  margin: 2 4;
  border-radius: 14;
}

/* Тень */
.card-shadow {
  border-radius: 14;
  background-color: #000000;
  opacity: 0.25;
  margin-top: 5;
  margin-bottom: 0;
  margin-left: 1;
  margin-right: 1;
}

/* Основная карточка */
.card {
  border-radius: 12;
  background-color: #FDEDD9;
  padding: 12;
}

.card-header {
  margin-bottom: 4;
}

/* Аватар */
.avatar-container {
  width: 52;
  height: 52;
  margin-right: 10;
}

.avatar-shadow {
  border-radius: 24;
  background-color: #000000;
  opacity: 0.25;
  width: 51;
  height: 50;
  margin-top: 2;
}

.avatar {
  border-radius: 22;
  width: 48;
  height: 48;
}

.username {
  font-size: 17;
  font-weight: bold;
  color: #3a1a00;
  padding-bottom: 0;
}

.post-time {
  font-size: 12;
  color: #584F41;
  padding-right: 4;
  padding-bottom: 5;
  margin-top: -20;
}

/* Разделители */
.divider {
  border-radius: 5;
  height: 3;
  background-color: #BCA68A;
  opacity: 0.7;

}

.first-divider {
  margin-top: 4;
  margin-bottom: 8;
}

.second-divider {
  margin-top: 10;
  margin-bottom: -2;
}

.post-text {
  font-size: 14;
  color: #3A342E;
  line-height: 18;
}

.card-footer {
  margin-top: 4;
}

.action-btn {
  verticalAlignment: center;
  padding: 4 0;
}

.action-icon {
  font-size: 16;
  margin-right: 4;
}

.action-count {
  font-size: 12;
  color: #555A5F;
  verticalAlignment: center;
}

.action-label {
  font-size: 13;
  color: #584F41;
  text-align: center;
}

/* Вертикальный разделитель */
.vertical-divider {
  width: 3;
  border-radius: 5;
  height: 20;
  opacity: 0.7;
  background-color: #BCA68A;
  margin: 0 12;
}
</style>