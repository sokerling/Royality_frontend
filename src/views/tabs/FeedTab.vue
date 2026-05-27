<template>
  <GridLayout rows="*" backgroundColor="transparent">
    <ScrollView row="0" backgroundColor="transparent" @scroll="onFeedScroll">
      <StackLayout :paddingTop="statusBarHeight" paddingBottom="84" backgroundColor="transparent">
        <StackLayout class="top-panel">
          <UserLevelBar
            :level="userLevel"
            :currentXp="50"
            :requiredXp="100"
          />
        </StackLayout>

        <StackLayout class="feed-header">
          <AppLabel
            :text="ui.newsFeedTitle"
            class="feed-title"
            textAlignment="left"
          />
        </StackLayout>

        <GridLayout rows="*" class="feed-container" margin="0" padding="0">
          <StackLayout row="0" class="feed-bg-outer" />

          <StackLayout row="0" class="feed-bg-inner" margin="5">
            <StackLayout class="composer-box">
              <TextView
                :text="newPostText"
                :hint="ui.composeHint"
                class="composer-input"
                @textChange="onPostTextChange"
              />
              <Image
                v-if="selectedImagePreview"
                :src="selectedImagePreview"
                class="composer-preview"
                stretch="aspectFill"
              />
              <GridLayout columns="*, *" class="composer-actions">
                <Button col="0" :text="ui.choosePhoto" class="composer-btn composer-btn--secondary" @tap="pickImage" />
                <Button
                  col="1"
                  :text="isCreatingPost ? ui.creatingPost : ui.publishPost"
                  class="composer-btn"
                  @tap="submitPost"
                />
              </GridLayout>
              <Label v-if="composeError" :text="composeError" class="status-text status-text--error" textWrap="true" />
            </StackLayout>

            <StackLayout paddingTop="-2" paddingBottom="0">
              <Label
                v-if="isLoading"
                :text="ui.loadingFeed"
                class="status-text"
                textAlignment="center"
              />
              <Label
                v-else-if="errorText"
                :text="errorText"
                class="status-text status-text--error"
                textWrap="true"
              />
              <template v-else>
                <PostCard
                  v-for="post in posts"
                  :key="post.id"
                  :post="post"
                  @like="toggleLike"
                />
                <Label
                  v-if="isLoadingMore"
                  :text="ui.loadingMore"
                  class="status-text"
                  textAlignment="center"
                />
                <Label
                  v-else-if="loadMoreError"
                  :text="loadMoreError"
                  class="status-text status-text--error"
                  textWrap="true"
                />
                <Label
                  v-else-if="!isLoading && !errorText && !loadMoreError && !hasMore && posts.length > 0"
                  :text="ui.noMorePosts"
                  class="status-text"
                  textAlignment="center"
                />
              </template>
            </StackLayout>
          </StackLayout>
        </GridLayout>

        <StackLayout class="feed-footer">
          <Label text="" class="footer-text" />
        </StackLayout>
      </StackLayout>
    </ScrollView>
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isAndroid } from "@nativescript/core";
import { alert } from "@nativescript/core/ui/dialogs";
import PostCard from "../../components/PostCard.vue";
import UserLevelBar from "../../components/UserLevelBar.vue";
import AppLabel from "../../components/AppLabel.vue";
import type { Post } from "../../types/post";
import type { PostResponse } from "../../types/api";
import { createPost, getFeed, likePost, unlikePost } from "../../services/posts";
import { sessionStore } from "../../stores/session";
import { pickImageFromDevice, type PickedImage } from "../../utils/imagePicker";
import { toRelativeTime } from "../../utils/time";
import { normalizeBackendUrl } from "../../utils/backendUrl";

export default defineComponent({
  name: "FeedTab",
  components: { PostCard, UserLevelBar, AppLabel },
  data() {
    return {
      ui: {
        newsFeedTitle: "Новостная лента",
        composeHint: "Поделитесь новостью...",
        choosePhoto: "Выбрать фото",
        publishPost: "Опубликовать",
        creatingPost: "Публикация...",
        loadingFeed: "Загрузка ленты...",
        loadingMore: "Загрузка еще...",
        noMorePosts: "Больше постов пока нет.",
        postDialogTitle: "Пост",
        errAuthRequired: "Требуется авторизация.",
        errPickImage: "Не удалось выбрать изображение.",
        errEnterPostText: "Введите текст поста.",
        errCreatePost: "Не удалось создать пост.",
        errLoadFeed: "Не удалось загрузить ленту.",
      },
      posts: [] as Post[],
      statusBarHeight: 0 as number,
      isLoading: false as boolean,
      isLoadingMore: false as boolean,
      errorText: "" as string,
      loadMoreError: "" as string,
      newPostText: "" as string,
      selectedImagePreview: "" as string,
      selectedImageMeta: null as PickedImage | null,
      isCreatingPost: false as boolean,
      composeError: "" as string,
      limit: 20 as number,
      offset: 0 as number,
      hasMore: true as boolean,
    };
  },
  async mounted() {
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
    }
    await this.loadFeed(true);
  },
  computed: {
    userLevel(): number {
      const level = Number(sessionStore.profile?.level ?? 1);
      return Number.isFinite(level) && level > 0 ? Math.round(level) : 1;
    },
  },
  methods: {
    onPostTextChange(args: any): void {
      this.newPostText = String(args?.value ?? args?.object?.text ?? "");
    },
    onFeedScroll(args: any): void {
      const view = args?.object;
      const offset = Number(view?.verticalOffset ?? view?.scrollY ?? 0);
      const scrollableHeight = Number(view?.scrollableHeight ?? 0);
      if (!scrollableHeight || this.isLoading || this.isLoadingMore || !this.hasMore) return;

      const threshold = 180;
      if (scrollableHeight - offset <= threshold) {
        void this.loadFeed(false);
      }
    },
    async pickImage(): Promise<void> {
      try {
        const picked = await pickImageFromDevice();
        if (!picked) return;
        this.selectedImagePreview = picked.uri;
        this.selectedImageMeta = picked;
        this.composeError = "";
      } catch (error) {
        this.composeError = error instanceof Error ? error.message : this.ui.errPickImage;
      }
    },
    dedupePosts(items: Post[]): Post[] {
      const seen = new Set<string>();
      const unique: Post[] = [];
      for (const post of items) {
        if (seen.has(post.id)) continue;
        seen.add(post.id);
        unique.push(post);
      }
      return unique;
    },
    mapPost(post: PostResponse): Post {
      return {
        id: post.id,
        user: {
          id: post.author.id,
          username: post.author.name,
          avatarUrl: normalizeBackendUrl(post.author.avatar_url),
          usernameColor: "#144E8C",
        },
        text: post.text,
        likes: post.likes_count,
        comments: 0,
        liked: post.is_liked,
        timeAgo: toRelativeTime(post.created_at),
        medias: (post.medias || []).map((url) => normalizeBackendUrl(url)).filter((url) => Boolean(url)),
      };
    },
    async submitPost(): Promise<void> {
      if (!sessionStore.token) return;
      if (this.isCreatingPost) return;

      const text = this.newPostText.trim();
      if (!text) {
        this.composeError = this.ui.errEnterPostText;
        return;
      }

      this.isCreatingPost = true;
      this.composeError = "";
      try {
        const payloadImage = this.selectedImageMeta;
        const created = await createPost(sessionStore.token, text, payloadImage, false);
        this.posts = this.dedupePosts([this.mapPost(created), ...this.posts]);
        this.offset = this.posts.length;
        this.newPostText = "";
        this.selectedImagePreview = "";
        this.selectedImageMeta = null;
      } catch (error) {
        this.composeError = error instanceof Error ? error.message : this.ui.errCreatePost;
        await alert({
          title: this.ui.postDialogTitle,
          message: this.composeError,
          okButtonText: "OK",
        });
      } finally {
        this.isCreatingPost = false;
      }
    },
    async loadFeed(reset: boolean): Promise<void> {
      if (!sessionStore.token) {
        this.errorText = this.ui.errAuthRequired;
        return;
      }

      if (reset) {
        if (this.isLoading) return;
        this.isLoading = true;
        this.errorText = "";
        this.loadMoreError = "";
        this.offset = 0;
        this.hasMore = true;
      } else {
        if (this.isLoadingMore || this.isLoading || !this.hasMore) return;
        this.isLoadingMore = true;
        this.loadMoreError = "";
      }

      try {
        const pageOffset = reset ? 0 : this.offset;
        const result = await getFeed(sessionStore.token, this.limit, pageOffset);
        const mapped = result.map((post) => this.mapPost(post));

        if (reset) {
          this.posts = this.dedupePosts(mapped);
        } else {
          this.posts = this.dedupePosts([...this.posts, ...mapped]);
        }

        this.offset = this.posts.length;
        this.hasMore = result.length === this.limit;
      } catch (error) {
        const message = error instanceof Error ? error.message : this.ui.errLoadFeed;
        if (reset) {
          this.errorText = message;
        } else {
          this.loadMoreError = message;
        }
      } finally {
        if (reset) {
          this.isLoading = false;
        } else {
          this.isLoadingMore = false;
        }
      }
    },
    async toggleLike(id: string): Promise<void> {
      const post = this.posts.find((p) => p.id === id);
      if (!post) return;
      if (!sessionStore.token) return;

      const prevLiked = post.liked;
      const prevLikes = post.likes;
      post.liked = !prevLiked;
      post.likes = Math.max(0, prevLikes + (post.liked ? 1 : -1));

      try {
        if (post.liked) {
          await likePost(sessionStore.token, id);
        } else {
          await unlikePost(sessionStore.token, id);
        }
      } catch {
        post.liked = prevLiked;
        post.likes = prevLikes;
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

.feed-header {
  padding: 5 14;
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
}

.footer-text {
  height: 5;
}

.feed-container {
  margin: 0;
  padding: 0;
}

.feed-bg-outer {
  background-color: #c9a37c;
}

.feed-bg-inner {
  background-color: #e9caa6;
  border-radius: 15;
}

.composer-box {
  margin: 10;
  padding: 10;
  background-color: #f9f1e6;
  border-radius: 12;
  border-width: 1;
  border-color: #b58f64;
}

.composer-input {
  min-height: 70;
  background-color: #ffffff;
  color: #2d2d2d;
  border-radius: 8;
  padding: 8;
}

.composer-preview {
  margin-top: 8;
  height: 120;
  border-radius: 8;
}

.composer-actions {
  margin-top: 8;
}

.composer-btn {
  background-color: #3b7cff;
  color: #ffffff;
  border-radius: 8;
  margin-left: 4;
}

.composer-btn--secondary {
  background-color: #7d8797;
  margin-left: 0;
  margin-right: 4;
}

.status-text {
  margin: 12 10;
  color: #3a342e;
  font-size: 14;
}

.status-text--error {
  color: #8f1d1d;
}
</style>
