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
                  :canEdit="canEditPost(post)"
                  @like="toggleLike"
                  @open-profile="openUserProfile"
                  @open-comments="openComments"
                  @edit="openEditPost"
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

    <GridLayout v-if="isCommentsOverlayMounted" row="0" class="feed-overlay">
      <StackLayout class="feed-overlay-backdrop" @tap="closeComments" />
      <StackLayout
        class="feed-menu-shell comments-shell"
        verticalAlignment="center"
        horizontalAlignment="center"
      >
        <GridLayout class="feed-menu-outer">
          <GridLayout class="feed-menu-inner" rows="40, *, auto, 48">
            <AppLabel
              row="0"
              text="Комментарии"
              class="feed-menu-title"
              textAlignment="center"
              :strokeWidth="4"
              :shadowOffset="2"
            />

            <GridLayout row="1" class="comments-list-frame" rows="*" clipToBounds="true">
              <ScrollView row="0" class="comments-list" orientation="vertical">
                <StackLayout>
                  <Label
                    v-if="isLoadingComments"
                    text="Загрузка комментариев..."
                    class="comments-empty"
                    textWrap="true"
                  />
                  <Label
                    v-else-if="commentsError"
                    :text="commentsError"
                    class="comments-error"
                    textWrap="true"
                  />
                  <Label
                    v-else-if="selectedComments.length === 0"
                    text="Комментариев пока нет."
                    class="comments-empty"
                    textWrap="true"
                  />
                  <template v-else>
                    <StackLayout
                      v-for="comment in selectedComments"
                      :key="comment.id"
                      class="comment-item"
                    >
                      <Label :text="comment.author.name" class="comment-author" />
                      <Label :text="comment.text" class="comment-text" textWrap="true" />
                    </StackLayout>
                  </template>
                </StackLayout>
              </ScrollView>
            </GridLayout>

            <Label
              v-if="selectedPost?.disableComments"
              row="2"
              text="Автор отключил комментарии к этому посту."
              class="comments-empty"
              textWrap="true"
            />
            <TextView
              v-else
              row="2"
              :text="commentDraft"
              hint="Оставьте комментарий..."
              class="comment-input"
              @textChange="onCommentDraftChange"
            />

            <GridLayout
              row="3"
              :columns="selectedPost?.disableComments ? '*' : '*, *'"
              class="comments-actions"
            >
              <Button
                v-if="!selectedPost?.disableComments"
                col="0"
                :text="isSubmittingComment ? 'Отправка...' : 'Отправить'"
                class="comment-action-btn comment-action-btn--send"
                @tap="submitComment"
              />
              <Button
                :col="selectedPost?.disableComments ? 0 : 1"
                text="Закрыть"
                class="comment-action-btn comment-action-btn--close"
                @tap="closeComments"
              />
            </GridLayout>
          </GridLayout>
        </GridLayout>
      </StackLayout>
    </GridLayout>

    <GridLayout v-if="isEditOverlayMounted" row="0" class="feed-overlay">
      <StackLayout class="feed-overlay-backdrop" @tap="closeEditPost" />
      <StackLayout
        class="feed-menu-shell edit-shell"
        verticalAlignment="center"
        horizontalAlignment="center"
      >
        <GridLayout class="feed-menu-outer">
          <StackLayout class="feed-menu-inner">
            <AppLabel
              text="Редактировать пост"
              class="feed-menu-title"
              textAlignment="center"
              :strokeWidth="4"
              :shadowOffset="2"
            />
            <TextView
              :text="editPostText"
              hint="Текст поста"
              class="edit-post-input"
              @textChange="onEditPostTextChange"
            />
            <Label v-if="editPostError" :text="editPostError" class="edit-post-error" textWrap="true" />
            <AppButton
              :text="isUpdatingPost ? 'Сохранение...' : 'Сохранить'"
              type="arena"
              compact
              horizontalAlignment="center"
              class="feed-menu-button"
              @tap="savePostEdit"
            />
            <AppButton
              text="Закрыть"
              type="secondary"
              compact
              horizontalAlignment="center"
              class="feed-menu-button"
              @tap="closeEditPost"
            />
          </StackLayout>
        </GridLayout>
      </StackLayout>
    </GridLayout>
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isAndroid } from "@nativescript/core";
import { alert } from "@nativescript/core/ui/dialogs";
import PostCard from "../../components/PostCard.vue";
import UserLevelBar from "../../components/UserLevelBar.vue";
import AppLabel from "../../components/AppLabel.vue";
import AppButton from "../../components/AppButton.vue";
import UserProfile from "../UserProfile.vue";
import type { Post } from "../../types/post";
import type { PostCommentResponse, PostResponse } from "../../types/api";
import {
  createPost,
  createPostComment,
  getFeed,
  getPostComments,
  likePost,
  unlikePost,
  updatePost,
} from "../../services/posts";
import { sessionStore } from "../../stores/session";
import { pickImageFromDevice, type PickedImage } from "../../utils/imagePicker";
import { toRelativeTime } from "../../utils/time";
import { normalizeBackendUrl } from "../../utils/backendUrl";

export default defineComponent({
  name: "FeedTab",
  components: { PostCard, UserLevelBar, AppLabel, AppButton },
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
      isCommentsOverlayMounted: false as boolean,
      selectedCommentsPostId: "" as string,
      commentDraft: "" as string,
      commentsByPostId: {} as Record<string, PostCommentResponse[]>,
      isLoadingComments: false as boolean,
      isSubmittingComment: false as boolean,
      commentsError: "" as string,
      isEditOverlayMounted: false as boolean,
      editPostId: "" as string,
      editPostText: "" as string,
      editPostError: "" as string,
      isUpdatingPost: false as boolean,
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
    selectedPost(): Post | null {
      return this.posts.find((post) => post.id === this.selectedCommentsPostId) || null;
    },
    selectedComments(): PostCommentResponse[] {
      if (!this.selectedCommentsPostId) return [];
      return this.commentsByPostId[this.selectedCommentsPostId] || [];
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
        comments: post.comments_count || 0,
        liked: post.is_liked,
        timeAgo: toRelativeTime(post.created_at),
        medias: (post.medias || []).map((url) => normalizeBackendUrl(url)).filter((url) => Boolean(url)),
        disableComments: post.disable_comments,
      };
    },
    canEditPost(post: Post): boolean {
      return Boolean(sessionStore.profile?.id && sessionStore.profile.id === post.user.id);
    },
    async openComments(postId: string): Promise<void> {
      if (!postId) return;
      this.selectedCommentsPostId = postId;
      this.commentDraft = "";
      this.commentsError = "";
      this.isCommentsOverlayMounted = true;
      await this.loadComments(postId);
    },
    closeComments(): void {
      if (this.isSubmittingComment) return;
      this.isCommentsOverlayMounted = false;
      this.selectedCommentsPostId = "";
      this.commentDraft = "";
      this.commentsError = "";
    },
    onCommentDraftChange(args: any): void {
      this.commentDraft = String(args?.value ?? args?.object?.text ?? "");
    },
    async loadComments(postId: string): Promise<void> {
      if (!sessionStore.token) return;
      this.isLoadingComments = true;
      this.commentsError = "";
      try {
        const comments = await getPostComments(sessionStore.token, postId);
        this.commentsByPostId = {
          ...this.commentsByPostId,
          [postId]: comments,
        };
        const post = this.posts.find((item) => item.id === postId);
        if (post) {
          post.comments = comments.length;
        }
      } catch (error) {
        this.commentsError = error instanceof Error ? error.message : "Не удалось загрузить комментарии.";
      } finally {
        this.isLoadingComments = false;
      }
    },
    async submitComment(): Promise<void> {
      if (!sessionStore.token || !this.selectedCommentsPostId || this.selectedPost?.disableComments) return;
      if (this.isSubmittingComment) return;

      const text = this.commentDraft.trim();
      if (!text) {
        await alert({
          title: "Комментарии",
          message: "Введите текст комментария.",
          okButtonText: "OK",
        });
        return;
      }

      const postId = this.selectedCommentsPostId;
      this.isSubmittingComment = true;
      this.commentsError = "";
      try {
        const comment = await createPostComment(sessionStore.token, postId, text);
        const nextComments = [...(this.commentsByPostId[postId] || []), comment];
        this.commentsByPostId = {
          ...this.commentsByPostId,
          [postId]: nextComments,
        };

        const post = this.posts.find((item) => item.id === postId);
        if (post) {
          post.comments = nextComments.length;
        }
        this.commentDraft = "";
      } catch (error) {
        this.commentsError = error instanceof Error ? error.message : "Не удалось отправить комментарий.";
      } finally {
        this.isSubmittingComment = false;
      }
    },
    openEditPost(postId: string): void {
      const post = this.posts.find((item) => item.id === postId);
      if (!post) return;

      if (!this.canEditPost(post)) {
        this.editPostError = "Редактировать можно только свои посты.";
        return;
      }

      this.editPostId = post.id;
      this.editPostText = post.text;
      this.editPostError = "";
      this.isEditOverlayMounted = true;
    },
    closeEditPost(): void {
      if (this.isUpdatingPost) return;
      this.isEditOverlayMounted = false;
      this.editPostId = "";
      this.editPostText = "";
      this.editPostError = "";
    },
    onEditPostTextChange(args: any): void {
      this.editPostText = String(args?.value ?? args?.object?.text ?? "");
      this.editPostError = "";
    },
    async savePostEdit(): Promise<void> {
      if (!sessionStore.token || this.isUpdatingPost) return;
      const post = this.posts.find((item) => item.id === this.editPostId);
      if (!post) return;

      const text = this.editPostText.trim();
      if (!text) {
        this.editPostError = "Введите текст поста.";
        return;
      }

      this.isUpdatingPost = true;
      this.editPostError = "";
      try {
        const updated = await updatePost(
          sessionStore.token,
          post.id,
          text,
          post.medias || [],
          Boolean(post.disableComments),
        );
        const mapped = this.mapPost(updated);
        mapped.comments = post.comments;
        this.posts = this.posts.map((item) => item.id === mapped.id ? mapped : item);
        this.isEditOverlayMounted = false;
        this.editPostId = "";
        this.editPostText = "";
      } catch (error) {
        this.editPostError = error instanceof Error ? error.message : "Не удалось обновить пост.";
      } finally {
        this.isUpdatingPost = false;
      }
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
    openUserProfile(userId: string): void {
      if (!userId) return;
      this.$navigateTo(UserProfile, {
        props: { userId },
      });
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

.feed-overlay {
  background-color: rgba(9, 15, 28, 0.45);
  padding: 20 14;
}

.feed-overlay-backdrop {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.feed-menu-shell {
  width: 310;
  margin: 0;
  z-index: 2;
}

.comments-shell {
  height: 500;
}

.edit-shell {
  height: 320;
}

.feed-menu-outer {
  height: 100%;
  background: linear-gradient(to bottom, #eeb859, #7c4c0b);
  border-width: 2;
  border-color: #030303;
  border-radius: 14;
  padding: 4 4 10 4;
}

.feed-menu-inner {
  height: 100%;
  background: linear-gradient(to bottom, #2b8cff, #1556a8);
  border-width: 1;
  border-color: #000000;
  border-radius: 12;
  padding: 10 8 8 8;
}

.feed-menu-title {
  height: 40;
  color: #ffffff;
  font-size: 18;
  font-weight: bold;
  text-align: center;
  margin-bottom: 4;
}

.comments-list-frame {
  margin: 4 4 6 4;
  border-radius: 14;
  border-width: 2;
  border-color: #030303;
  background-color: #f9f1e6;
  clip-to-bounds: true;
}

.comments-list {
  height: 100%;
  border-radius: 12;
  background-color: transparent;
}

.comments-empty {
  margin: 12;
  color: #ffffff;
  font-family: "supercell-magic_0";
  font-size: 12;
  text-align: center;
  text-shadow: 0 1 0 rgba(0, 0, 0, 0.8);
}

.comment-item {
  margin: 8;
  padding: 8;
  border-radius: 10;
  background-color: #ffffff;
}

.comment-author {
  color: #144e8c;
  font-size: 12;
  font-weight: bold;
}

.comment-text {
  color: #3a342e;
  font-size: 13;
  margin-top: 3;
}

.comment-input,
.edit-post-input {
  margin: 4 6 8 6;
  padding: 8;
  border-radius: 10;
  border-width: 1;
  border-color: #1a4f93;
  background-color: #ffffff;
  color: #1f2e47;
}

.comment-input {
  height: 70;
  margin-bottom: 4;
}

.edit-post-input {
  height: 118;
}

.comments-error,
.edit-post-error {
  margin: 4 8 6 8;
  color: #ffd8d8;
  font-family: "supercell-magic_0";
  font-size: 10;
  text-align: center;
  text-shadow: 0 1 0 rgba(0, 0, 0, 0.8);
}

.comments-actions {
  margin: 2 4 0 4;
}

.comment-action-btn {
  height: 42;
  margin: 2 4;
  border-radius: 10;
  border-width: 2;
  border-color: #030303;
  color: #ffffff;
  font-family: "supercell-magic_0";
  font-size: 11;
  text-shadow: 0 1 0 rgba(0, 0, 0, 0.8);
}

.comment-action-btn--send {
  background: linear-gradient(to bottom, #f7c64a, #b56c16);
}

.comment-action-btn--close {
  background: linear-gradient(to bottom, #54bdf3, #1d67b3);
}
</style>
