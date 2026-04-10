<template>
  <GridLayout class="card-wrapper" rows="*" columns="*" @touch="onCardTouch" ref="wrapper">
    <StackLayout row="0" col="0" class="card-shadow" />

    <StackLayout row="0" col="0" class="card" margin="4">
      <GridLayout columns="auto, *, auto" rows="auto, auto" class="card-header">
        <GridLayout row="0" rowSpan="2" col="0" class="avatar-container">
          <StackLayout class="avatar-shadow" />
          <Image
            :src="post.user.avatarUrl"
            width="48"
            height="48"
            class="avatar"
            stretch="aspectFill"
          />
        </GridLayout>

        <Label
          row="0" col="1"
          :text="post.user.username"
          class="username"
          verticalAlignment="bottom"
          :color="post.user.usernameColor"
        />

        <Label
          row="0" col="2"
          :text="post.timeAgo"
          class="post-time"
          verticalAlignment="bottom"
        />

        <StackLayout row="1" col="1" colSpan="2" class="divider first-divider" />
      </GridLayout>

      <Label :text="post.text" class="post-text" textWrap="true" />

      <Image
        v-if="firstMediaUrl"
        :src="firstMediaUrl"
        class="post-media"
        stretch="aspectFill"
      />

      <StackLayout class="divider second-divider" />

      <GridLayout columns="auto, auto, auto, auto, *" class="card-footer">
        <StackLayout col="0" orientation="horizontal" class="action-btn" @tap="onLike">
          <Label :text="post.liked ? ui.likeOn : ui.likeOff" class="action-icon" />
          <Label :text="String(post.likes)" class="action-count" />
        </StackLayout>

        <StackLayout col="1" class="vertical-divider" />

        <StackLayout col="2" orientation="horizontal" class="action-btn">
          <Label :text="ui.commentsIcon" class="action-icon" />
          <Label :text="String(post.comments)" class="action-count" />
          <Label :text="ui.commentsLabel" class="action-label" />
        </StackLayout>

        <StackLayout col="3" class="vertical-divider" />

        <StackLayout col="4" orientation="horizontal" class="action-btn">
          <Label :text="ui.repostIcon" class="action-icon" />
          <Label :text="ui.repostLabel" class="action-label" />
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
  data() {
    return {
      ui: {
        likeOn: "\u2764\uFE0F",
        likeOff: "\uD83E\uDD0D",
        commentsIcon: "\uD83D\uDCAC",
        commentsLabel: " \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0435\u0432",
        repostIcon: "\uD83D\uDD04",
        repostLabel: "\u0420\u0435\u043f\u043e\u0441\u0442",
      },
    };
  },
  computed: {
    firstMediaUrl(): string {
      return this.post.medias?.[0] || "";
    },
  },
  methods: {
    onLike(): void {
      this.$emit("like", this.post.id);
    },

    onCardTouch(event: any): void {
      const ref = this.$refs.wrapper;
      const view: View | null = ref
        ? ((Array.isArray(ref) ? ref[0] : ref) as any)?.nativeView ?? null
        : null;
      if (!view) return;

      if (event.action === "down") {
        new Animation([
          {
            target: view,
            scale: { x: 0.97, y: 0.97 },
            duration: 80,
            curve: "easeOut",
          },
        ]).play().catch(() => {});
      } else if (event.action === "up" || event.action === "cancel") {
        new Animation([
          {
            target: view,
            scale: { x: 1, y: 1 },
            duration: 100,
            curve: "easeOut",
          },
        ]).play().catch(() => {});
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

.card-shadow {
  border-radius: 14;
  background-color: #000000;
  opacity: 0.25;
  margin-top: 5;
  margin-bottom: 0;
  margin-left: 1;
  margin-right: 1;
}

.card {
  border-radius: 12;
  background-color: #fdedd9;
  padding: 12;
}

.card-header {
  margin-bottom: 4;
}

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
  color: #584f41;
  padding-right: 4;
  padding-bottom: 5;
  margin-top: -20;
}

.divider {
  border-radius: 5;
  height: 3;
  background-color: #bca68a;
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
  color: #3a342e;
  line-height: 18;
}

.post-media {
  margin-top: 10;
  width: 100%;
  height: 180;
  border-radius: 10;
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
  color: #555a5f;
  verticalAlignment: center;
}

.action-label {
  font-size: 13;
  color: #584f41;
  text-align: center;
}

.vertical-divider {
  width: 3;
  border-radius: 5;
  height: 20;
  opacity: 0.7;
  background-color: #bca68a;
  margin: 0 12;
}
</style>
