<template>
  <Page class="page" actionBarHidden="true">
    <GridLayout rows="auto, *" class="screen">
      <GridLayout
        row="0"
        columns="64, *, 64"
        class="top-bar"
        :paddingTop="statusBarHeight"
      >
        <GridLayout col="0" class="back-button" rows="*" columns="*" @tap="goBack">
          <StackLayout row="0" col="0" class="back-button-shadow" />
          <StackLayout row="0" col="0" class="back-button-face" />
          <AppLabel
            row="0"
            col="0"
            :text="ui.backSymbol"
            class="back-button-text"
            textAlignment="center"
            :strokeWidth="3"
            :shadowOffset="2"
          />
        </GridLayout>

        <AppLabel
          col="1"
          :text="ui.title"
          class="top-title"
          textAlignment="center"
          :strokeWidth="7"
          :shadowOffset="4"
        />
      </GridLayout>

      <GridLayout row="1" backgroundColor="transparent">
        <GridLayout height="100" class="main-bg-header" verticalAlignment="top" />

        <ScrollView class="scroll-view-main">
          <StackLayout class="scroll-container">
            <StackLayout height="22" backgroundColor="transparent" />

            <StackLayout class="content-bg-container">
              <StackLayout class="content-inner-shadow">
                <StackLayout class="content-inner-bg">
                  <StackLayout class="page-container">
                    <StackLayout v-if="isLoading" class="status-shell">
                      <AppLabel
                        :text="ui.loadingProfile"
                        class="status-title"
                        textAlignment="center"
                        :strokeWidth="5"
                        :shadowOffset="3"
                      />
                    </StackLayout>

                    <StackLayout v-else-if="errorText" class="status-shell">
                      <AppLabel
                        :text="ui.errorTitle"
                        class="status-title"
                        textAlignment="center"
                        :strokeWidth="5"
                        :shadowOffset="3"
                      />
                      <Label :text="errorText" class="error-text" textWrap="true" />
                      <AppButton
                        :text="ui.retry"
                        type="secondary"
                        compact
                        horizontalAlignment="center"
                        @tap="loadProfile"
                      />
                    </StackLayout>

                    <template v-else-if="profile">
                      <GridLayout class="header-outer-shadow" @loaded="disableClipping">
                        <GridLayout class="header-outer-frame" @loaded="disableClipping">
                          <GridLayout class="header-bg-outer" @loaded="disableClipping">
                            <GridLayout class="header-bg-orange" @loaded="disableClipping">
                              <GridLayout
                                class="header-inner-bg"
                                rows="auto, auto, auto"
                                columns="auto, *"
                                @loaded="disableClipping"
                              >
                                <GridLayout
                                  class="avatar-frame"
                                  row="0"
                                  col="0"
                                  rowSpan="3"
                                  horizontalAlignment="left"
                                  verticalAlignment="center"
                                  @loaded="disableClipping"
                                >
                                  <Image
                                    v-if="avatarSource"
                                    :src="avatarSource"
                                    class="avatar-image"
                                    stretch="aspectFill"
                                  />
                                  <GridLayout
                                    v-else
                                    class="avatar-placeholder"
                                    rows="*"
                                    columns="*"
                                  >
                                    <AppLabel
                                      row="0"
                                      col="0"
                                      :text="avatarInitial"
                                      class="avatar-placeholder-text"
                                      textAlignment="center"
                                      :strokeWidth="4"
                                      :shadowOffset="2"
                                    />
                                  </GridLayout>
                                </GridLayout>

                                <Label :text="profileName" class="nickname" row="0" col="1" />

                                <UserLevelBar
                                  class="level-container"
                                  row="1"
                                  col="1"
                                  :level="profileLevel"
                                  :currentXp="levelProgressCurrent"
                                  :requiredXp="levelProgressRequired"
                                  :compact="true"
                                />

                                <StackLayout row="2" col="1" class="follow-container">
                                  <AppButton
                                    v-if="!isOwnProfile"
                                    :text="followButtonText"
                                    :type="profile.is_following ? 'secondary' : 'arena'"
                                    :opacity="isFollowBusy ? 0.65 : 1"
                                    :isEnabled="!isFollowBusy"
                                    compact
                                    horizontalAlignment="center"
                                    @tap="toggleFollow"
                                  />

                                  <GridLayout v-else class="own-profile-badge">
                                    <AppLabel
                                      :text="ui.ownProfile"
                                      class="own-profile-text"
                                      textAlignment="center"
                                      :strokeWidth="4"
                                      :shadowOffset="2"
                                    />
                                  </GridLayout>
                                </StackLayout>
                              </GridLayout>
                            </GridLayout>
                          </GridLayout>
                        </GridLayout>
                      </GridLayout>

                      <GridLayout class="stats-outer-shadow" @loaded="disableClipping">
                        <GridLayout class="stats-outer-frame" @loaded="disableClipping">
                          <GridLayout class="stats-bg-outer" @loaded="disableClipping">
                            <GridLayout class="stats-bg-orange" @loaded="disableClipping">
                              <GridLayout class="stats-bg-blue" @loaded="disableClipping">
                                <GridLayout columns="*, *" @loaded="disableClipping">
                                  <StackLayout col="0" marginRight="5" @loaded="disableClipping">
                                    <Label :text="ui.posts" class="stat-label" />
                                    <GridLayout class="stat-input-box" @loaded="applyInsetShadow">
                                      <GridLayout columns="auto, *" class="stat-input-content" verticalAlignment="middle">
                                        <Image src="~/assets/posts.png" col="0" class="stat-image-icon" stretch="aspectFit" />
                                        <Label :text="postsCountText" col="1" class="stat-value" />
                                      </GridLayout>
                                    </GridLayout>
                                  </StackLayout>

                                  <StackLayout col="1" marginLeft="5" @loaded="disableClipping">
                                    <Label :text="ui.followers" class="stat-label" />
                                    <GridLayout class="stat-input-box" @loaded="applyInsetShadow">
                                      <GridLayout columns="auto, *" class="stat-input-content" verticalAlignment="middle">
                                        <Image src="~/assets/podpis.png" col="0" class="stat-image-icon" stretch="aspectFit" />
                                        <Label :text="followersCountText" col="1" class="stat-value" />
                                      </GridLayout>
                                    </GridLayout>
                                  </StackLayout>
                                </GridLayout>
                              </GridLayout>
                            </GridLayout>
                          </GridLayout>
                        </GridLayout>
                      </GridLayout>

                      <AbsoluteLayout class="about-me-container" @loaded="disableClipping">
                        <GridLayout class="about-me-outer-shadow" left="0" top="32" width="100%" @loaded="disableClipping">
                          <GridLayout class="about-me-outer" @loaded="disableClipping">
                            <GridLayout class="about-me-content-box" @loaded="applyInsetShadowLarge">
                              <ScrollView marginTop="10">
                                <Label
                                  :text="profileBio"
                                  class="about-me-text"
                                  textWrap="true"
                                />
                              </ScrollView>
                            </GridLayout>
                          </GridLayout>
                        </GridLayout>

                        <HexagonHeader
                          :text="ui.about"
                          :width="330"
                          :height="64"
                          :sharpness="0.5"
                          :showShadow="true"
                          left="20"
                          top="0"
                          @loaded="disableClippingDeep"
                        />
                      </AbsoluteLayout>
                    </template>
                  </StackLayout>
                </StackLayout>
              </StackLayout>
            </StackLayout>
          </StackLayout>
        </ScrollView>
      </GridLayout>
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { Frame, isAndroid } from "@nativescript/core";
import { alert } from "@nativescript/core/ui/dialogs";
import AppButton from "../components/AppButton.vue";
import AppLabel from "../components/AppLabel.vue";
import HexagonHeader from "../components/HexagonHeader.vue";
import UserLevelBar from "../components/UserLevelBar.vue";
import type { UserProfileResponse } from "../types/api";
import { followUser, getMyProfile, getUserProfile, unfollowUser } from "../services/profile";
import { sessionStore } from "../stores/session";
import { normalizeBackendUrl } from "../utils/backendUrl";

function decodeEscapedUnicode(value: unknown): string {
  if (typeof value !== "string") return "";
  let decoded = value;
  for (let i = 0; i < 2; i++) {
    if (!/\\u[0-9a-fA-F]{4}/.test(decoded)) break;
    try {
      decoded = JSON.parse(`"${decoded.replace(/"/g, '\\"')}"`);
    } catch {
      break;
    }
  }
  return decoded;
}

export default defineComponent({
  name: "UserProfile",
  components: {
    AppButton,
    AppLabel,
    HexagonHeader,
    UserLevelBar,
  },
  props: {
    userId: {
      type: String as PropType<string>,
      required: true,
    },
  },
  data() {
    return {
      ui: {
        backSymbol: "<",
        title: "Профиль",
        loadingProfile: "Загрузка профиля...",
        errorTitle: "Ошибка",
        retry: "Повторить",
        unknownUser: "Игрок",
        emptyBio: "Пользователь пока не добавил описание.",
        follow: "Подписаться",
        unfollow: "Отписаться",
        saving: "Сохранение...",
        ownProfile: "Это ваш профиль",
        posts: "Посты",
        followers: "Подписчики",
        about: "Обо мне",
        authRequired: "Требуется авторизация.",
        loadFailed: "Не удалось загрузить профиль.",
        followFailed: "Не удалось обновить подписку.",
      },
      profile: null as UserProfileResponse | null,
      isLoading: false,
      isFollowBusy: false,
      errorText: "",
      statusBarHeight: 0,
      levelProgressCurrent: 50,
      levelProgressRequired: 100,
    };
  },
  computed: {
    isOwnProfile(): boolean {
      return Boolean(this.profile && sessionStore.profile?.id === this.profile.id);
    },
    profileName(): string {
      return decodeEscapedUnicode(this.profile?.nickname)?.trim() || this.ui.unknownUser;
    },
    profileBio(): string {
      return decodeEscapedUnicode(this.profile?.bio)?.trim() || this.ui.emptyBio;
    },
    profileLevel(): number {
      const level = Number(this.profile?.level ?? 1);
      return Number.isFinite(level) && level > 0 ? Math.round(level) : 1;
    },
    avatarSource(): string {
      return normalizeBackendUrl(this.profile?.avatar_url);
    },
    avatarInitial(): string {
      return this.profileName.trim().slice(0, 1).toUpperCase() || "?";
    },
    postsCountText(): string {
      return String(this.profile?.posts_count ?? 0);
    },
    followersCountText(): string {
      return String(this.profile?.followers_count ?? 0);
    },
    followButtonText(): string {
      if (this.isFollowBusy) return this.ui.saving;
      return this.profile?.is_following ? this.ui.unfollow : this.ui.follow;
    },
  },
  async mounted() {
    this.statusBarHeight = this.getStatusBarHeight();
    await this.loadProfile();
  },
  methods: {
    getStatusBarHeight(): number {
      if (!isAndroid) return 0;
      const resourceId = android.content.res.Resources.getSystem()
        .getIdentifier("status_bar_height", "dimen", "android");
      if (resourceId <= 0) return 0;

      const heightPx = android.content.res.Resources.getSystem()
        .getDimensionPixelSize(resourceId);
      const density = android.content.res.Resources.getSystem()
        .getDisplayMetrics().density;
      return Math.ceil(heightPx / density) + 8;
    },
    async ensureOwnProfile(token: string): Promise<void> {
      if (sessionStore.profile) return;
      sessionStore.profile = await getMyProfile(token);
    },
    async loadProfile(): Promise<void> {
      if (!sessionStore.token) {
        this.errorText = this.ui.authRequired;
        return;
      }

      this.isLoading = true;
      this.errorText = "";
      try {
        await this.ensureOwnProfile(sessionStore.token);
        this.profile = await getUserProfile(sessionStore.token, this.userId);
      } catch (error) {
        this.errorText = error instanceof Error ? error.message : this.ui.loadFailed;
      } finally {
        this.isLoading = false;
      }
    },
    async toggleFollow(): Promise<void> {
      if (!sessionStore.token || !this.profile || this.isOwnProfile || this.isFollowBusy) return;

      const previousFollowing = this.profile.is_following;
      const previousFollowers = this.profile.followers_count;
      const nextFollowing = !previousFollowing;
      const nextFollowers = Math.max(0, previousFollowers + (nextFollowing ? 1 : -1));

      this.profile = {
        ...this.profile,
        is_following: nextFollowing,
        followers_count: nextFollowers,
      };

      this.isFollowBusy = true;
      try {
        if (nextFollowing) {
          await followUser(sessionStore.token, this.userId);
        } else {
          await unfollowUser(sessionStore.token, this.userId);
        }
      } catch (error) {
        if (this.profile) {
          this.profile = {
            ...this.profile,
            is_following: previousFollowing,
            followers_count: previousFollowers,
          };
        }
        await alert({
          title: this.ui.errorTitle,
          message: error instanceof Error ? error.message : this.ui.followFailed,
          okButtonText: "OK",
        });
      } finally {
        this.isFollowBusy = false;
      }
    },
    goBack(): void {
      const frame = Frame.topmost();
      if (frame?.canGoBack()) {
        frame.goBack();
        return;
      }

      const navigator = this as any;
      if (typeof navigator.$navigateBack === "function") {
        navigator.$navigateBack();
      }
    },
    disableClipping(args: any): void {
      if (!isAndroid) return;
      const nv = args.object?.nativeView;
      if (!nv) return;
      try {
        if (nv.setClipChildren) nv.setClipChildren(false);
        if (nv.setClipToPadding) nv.setClipToPadding(false);
        const p = nv.getParent();
        if (p) {
          if (p.setClipChildren) p.setClipChildren(false);
          if (p.setClipToPadding) p.setClipToPadding(false);
        }
      } catch {
        // no-op
      }
    },
    disableClippingDeep(args: any): void {
      if (!isAndroid) return;
      const nv = args.object?.nativeView;
      if (!nv) return;
      try {
        let current = nv;
        for (let i = 0; i < 10; i++) {
          if (!current) break;
          if (current.setClipChildren) current.setClipChildren(false);
          if (current.setClipToPadding) current.setClipToPadding(false);
          current = current.getParent();
        }
      } catch {
        // no-op
      }
    },
    applyInsetShadow(args: any): void {
      if (!isAndroid) return;
      const nv = args.object?.nativeView;
      if (!nv) return;
      this.disableClipping(args);

      setTimeout(() => {
        try {
          const ctx = nv.getContext();
          const d = ctx.getResources().getDisplayMetrics().density;
          const br = 13 * d;
          const sd = 8 * d;

          const Drawable = android.graphics.drawable.Drawable.extend({
            draw: function(canvas: any) {
              const bounds = this.getBounds();
              const w = bounds.width();
              const h = bounds.height();
              if (w <= 0 || h <= 0) return;

              const paint = new android.graphics.Paint();
              paint.setAntiAlias(true);
              paint.setStyle(android.graphics.Paint.Style.FILL);
              paint.setColor(android.graphics.Color.parseColor("#5A5F6C"));
              const rect = new android.graphics.RectF(0, 0, w, h);
              canvas.drawRoundRect(rect, br, br, paint);

              canvas.save();
              const clip = new android.graphics.Path();
              clip.addRoundRect(rect, br, br, android.graphics.Path.Direction.CW);
              canvas.clipPath(clip);

              const grad = new android.graphics.LinearGradient(
                0, 0, 0, sd,
                android.graphics.Color.argb(115, 0, 0, 0),
                android.graphics.Color.argb(0, 0, 0, 0),
                android.graphics.Shader.TileMode.CLAMP
              );
              paint.setShader(grad);
              canvas.drawRect(new android.graphics.RectF(0, 0, w, sd), paint);
              paint.setShader(null);
              canvas.restore();

              paint.setStyle(android.graphics.Paint.Style.STROKE);
              paint.setStrokeWidth(3 * d);
              paint.setColor(android.graphics.Color.argb(153, 0, 0, 0));
              canvas.drawRoundRect(rect, br, br, paint);
            },
            getOpacity: function() { return android.graphics.PixelFormat.TRANSLUCENT; },
            setAlpha: function(_a: number) {},
            setColorFilter: function(_cf: any) {},
          });

          nv.setBackground(new Drawable());
        } catch (error) {
          console.error("applyInsetShadow error:", error);
        }
      }, 100);
    },
    applyInsetShadowLarge(args: any): void {
      if (!isAndroid) return;
      const nv = args.object?.nativeView;
      if (!nv) return;
      this.disableClipping(args);

      setTimeout(() => {
        try {
          const ctx = nv.getContext();
          const d = ctx.getResources().getDisplayMetrics().density;
          const br = 13 * d;
          const sd = 14 * d;

          const Drawable = android.graphics.drawable.Drawable.extend({
            draw: function(canvas: any) {
              const bounds = this.getBounds();
              const w = bounds.width();
              const h = bounds.height();
              if (w <= 0 || h <= 0) return;

              const paint = new android.graphics.Paint();
              paint.setAntiAlias(true);
              paint.setStyle(android.graphics.Paint.Style.FILL);
              paint.setColor(android.graphics.Color.parseColor("#5A5F6C"));
              const rect = new android.graphics.RectF(0, 0, w, h);
              canvas.drawRoundRect(rect, br, br, paint);

              canvas.save();
              const clip = new android.graphics.Path();
              clip.addRoundRect(rect, br, br, android.graphics.Path.Direction.CW);
              canvas.clipPath(clip);

              const grad = new android.graphics.LinearGradient(
                0, 0, 0, sd,
                android.graphics.Color.argb(130, 0, 0, 0),
                android.graphics.Color.argb(0, 0, 0, 0),
                android.graphics.Shader.TileMode.CLAMP
              );
              paint.setShader(grad);
              canvas.drawRect(new android.graphics.RectF(0, 0, w, sd), paint);
              paint.setShader(null);
              canvas.restore();

              paint.setStyle(android.graphics.Paint.Style.STROKE);
              paint.setStrokeWidth(3 * d);
              paint.setColor(android.graphics.Color.argb(153, 0, 0, 0));
              canvas.drawRoundRect(rect, br, br, paint);
            },
            getOpacity: function() { return android.graphics.PixelFormat.TRANSLUCENT; },
            setAlpha: function(_a: number) {},
            setColorFilter: function(_cf: any) {},
          });

          nv.setBackground(new Drawable());
        } catch (error) {
          console.error("applyInsetShadowLarge error:", error);
        }
      }, 100);
    },
  },
});
</script>

<style scoped>
.page {
  background-image: url('~/assets/Home_bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.screen {
  background-color: transparent;
}

.top-bar {
  padding: 8 12 8 12;
  background-image: linear-gradient(
    0deg,
    #4a2a0a 0%,
    #5c3317 24%,
    #7a4a1a 50%,
    #5c3317 76%,
    #4a2a0a 100%
  );
}

.top-title {
  color: #ffffff;
  font-size: 24;
  font-weight: bold;
  height: 54;
  vertical-align: center;
}

.back-button {
  width: 52;
  height: 52;
  vertical-align: center;
  horizontal-align: left;
}

.back-button-shadow {
  width: 48;
  height: 45;
  margin-top: 5;
  border-radius: 12;
  background-color: rgba(0, 0, 0, 0.42);
}

.back-button-face {
  width: 48;
  height: 44;
  border-radius: 12;
  border-width: 2;
  border-color: #000000;
  background: linear-gradient(to bottom, #66c8ff, #1a5c8a);
}

.back-button-text {
  width: 48;
  height: 44;
  color: #ffffff;
  font-size: 30;
  font-weight: bold;
  text-align: center;
  vertical-align: center;
}

.main-bg-header {
  background-image: url('~/assets/Home_bg.png');
  background-size: cover;
  background-position: center;
}

.scroll-view-main {
  background-color: transparent;
}

.page-container {
  padding: 16;
}

.content-bg-container {
  background-color: #C9A37C;
  padding: 0;
}

.content-inner-shadow {
  margin: 8 6 0 6;
  padding-bottom: 4;
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 12;
}

.content-inner-bg {
  background-color: #E9CAA6;
  border-radius: 12;
  border-width: 1;
  border-color: rgba(0, 0, 0, 0.15);
}

.status-shell {
  margin: 4 0 12 0;
  padding: 14 8;
  border-radius: 13;
  border-width: 2;
  border-color: #030303;
  background: linear-gradient(to bottom, #EEB859, #7C4C0B);
}

.status-title {
  height: 42;
  color: #ffffff;
  font-size: 18;
  font-weight: bold;
}

.error-text {
  margin: 8 8 12 8;
  color: #ffffff;
  font-size: 14;
  text-align: center;
  text-shadow: 0 1.2 0 rgba(0, 0, 0, 0.75);
}

/* ===== HEADER CARD ===== */
.header-outer-shadow {
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 13;
  margin-bottom: 12;
  padding-bottom: 6;
}

.header-outer-frame {
  height: 156;
}

.header-bg-outer {
  background: linear-gradient(to bottom, #EEB859, #7C4C0B);
  border-width: 2;
  border-color: #030303;
  border-radius: 13;
  height: 100%;
}

.header-bg-orange {
  margin-bottom: 9;
  background: linear-gradient(to bottom, #FF9F1F, #EEB859);
  border-radius: 13;
}

.header-inner-bg {
  margin: 6 6;
  background: linear-gradient(to right, #052C70, #1E62B2);
  border-width: 1;
  border-color: rgba(0, 0, 0, 0.86);
  border-radius: 12;
  padding: 0 3;
}

.avatar-frame {
  width: 96;
  height: 104;
  margin-left: 8;
  margin-top: -2;
  background: linear-gradient(to bottom, #F4E093, #E49C47);
  border-width: 1;
  border-color: rgba(0, 0, 0, 0.56);
  border-radius: 54;
  padding: 2;
}

.avatar-image {
  width: 92;
  height: 98;
  border-radius: 49;
  border-width: 1;
  border-color: #000000;
}

.avatar-placeholder {
  width: 92;
  height: 98;
  border-radius: 49;
  border-width: 1;
  border-color: #000000;
  background: linear-gradient(to bottom, #5BD3F3, #2257A8);
}

.avatar-placeholder-text {
  height: 98;
  color: #ffffff;
  font-size: 34;
  font-weight: bold;
  text-align: center;
  vertical-align: center;
}

.nickname {
  font-family: "supercell-magic_0";
  color: #FFFFFF;
  font-size: 24;
  text-align: center;
  vertical-align: bottom;
  margin-bottom: 0;
  padding-bottom: 0;
  text-shadow: 0 1.6 0.1 rgba(0, 0, 0, 0.91);
}

.level-container {
  margin-left: 5;
  margin-right: 10;
  margin-top: 0;
  vertical-align: top;
  height: 36;
}

.follow-container {
  height: 58;
  margin-top: -2;
  vertical-align: top;
}

.own-profile-badge {
  width: 158;
  height: 52;
  horizontal-align: center;
  border-radius: 13;
  border-width: 2;
  border-color: #000000;
  background: linear-gradient(to bottom, #66C8FF, #1A5C8A);
}

.own-profile-text {
  height: 52;
  color: #ffffff;
  font-size: 12;
  font-weight: bold;
  text-align: center;
  vertical-align: center;
}

/* ===== STATS CARD ===== */
.stats-outer-shadow {
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 13;
  margin-bottom: 12;
  padding-bottom: 6;
}

.stats-outer-frame {
  height: 106;
}

.stats-bg-outer {
  background: linear-gradient(to bottom, #EEB859, #7C4C0B);
  border-width: 2;
  border-color: #030303;
  border-radius: 13;
  height: 100%;
}

.stats-bg-orange {
  margin-bottom: 9;
  background: linear-gradient(to bottom, #FF9F1F, #EEB859);
  border-radius: 13;
}

.stats-bg-blue {
  margin: 6 12;
  background: linear-gradient(to bottom, #3F87F3, #17529E);
  border-width: 1;
  border-color: #000000;
  border-radius: 13;
  padding: 8;
}

.stat-label {
  font-family: "supercell-magic_0";
  color: white;
  font-size: 14;
  text-align: center;
  margin-bottom: 2;
  text-shadow: 0 1.6 0.1 rgba(0, 0, 0, 0.91);
}

.stat-input-box {
  border-radius: 13;
  height: 42;
}

.stat-input-content {
  padding: 0 8;
}

.stat-image-icon {
  width: 22;
  height: 22;
  vertical-align: middle;
  margin-right: 6;
}

.stat-value {
  font-family: "supercell-magic_0";
  color: #FFFFFF;
  font-size: 18;
  text-align: center;
  vertical-align: middle;
  text-shadow: 0 1.6 0.1 rgba(0, 0, 0, 0.91);
}

/* ===== ABOUT ME CARD ===== */
.about-me-container {
  height: 500;
  margin-top: 10;
}

.about-me-outer-shadow {
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 18;
  margin-top: 10;
  margin-bottom: 12;
  padding-bottom: 6;
}

.about-me-outer {
  background-color: #FDEDD9;
  border-radius: 18;
  padding: 8;
  min-height: 400;
}

.about-me-content-box {
  border-radius: 13;
  padding: 0 12 12 12;
  min-height: 350;
  margin: 30 12 12 12;
}

.about-me-text {
  font-family: "supercell-magic_0";
  color: #FFFFFF;
  font-size: 18;
  line-height: 8;
  padding: 10;
  text-shadow: 0 1.6 0.1 rgba(0, 0, 0, 0.91);
}
</style>
