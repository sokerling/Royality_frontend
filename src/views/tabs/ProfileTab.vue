<template>
  <GridLayout backgroundColor="transparent">
    <GridLayout height="100" class="main-bg-header" verticalAlignment="top" />

    <ScrollView class="scroll-view-main">
      <StackLayout class="scroll-container">
        <StackLayout height="65" backgroundColor="transparent" />

        <StackLayout class="content-bg-container">
          <StackLayout class="content-inner-shadow">
            <StackLayout class="content-inner-bg">
              <StackLayout class="page-container">
                
                <!-- Header -->
                <GridLayout class="header-outer-shadow" @loaded="disableClipping">
                  <GridLayout class="header-outer-frame" @loaded="disableClipping">
                    <GridLayout class="header-bg-outer" @loaded="disableClipping">
                      <GridLayout class="header-bg-orange" @loaded="disableClipping">
                        <GridLayout class="header-inner-bg" rows="*, *" columns="auto, *, auto" @loaded="disableClipping">
                          
                          <GridLayout class="avatar-frame" row="0" col="0" rowSpan="2" 
                            horizontalAlignment="left" verticalAlignment="center"
                            @loaded="disableClipping">
                            <Image
                              :src="avatarSource"
                              class="avatar-image"
                              stretch="aspectFill"
                            />
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

                          <!-- Settings button -->
                          <SettingsButton
                            row="0"
                            col="2"
                            horizontalAlignment="right"
                            verticalAlignment="top"
                            marginTop="2"
                            marginRight="2"
                            @tap="onSettingsButtonTap"
                          />
                        </GridLayout>
                      </GridLayout>
                    </GridLayout>
                  </GridLayout>
                </GridLayout>
                <!-- Stats -->
                <GridLayout class="stats-outer-shadow" @loaded="disableClipping">
                  <GridLayout class="stats-outer-frame" @loaded="disableClipping">
                    <GridLayout class="stats-bg-outer" @loaded="disableClipping">
                      <GridLayout class="stats-bg-orange" @loaded="disableClipping">
                        <GridLayout class="stats-bg-blue" @loaded="disableClipping">
                          <GridLayout columns="*, *" @loaded="disableClipping">
                            <StackLayout col="0" marginRight="5" @loaded="disableClipping">
                              <Label :text="ui.postsLabel" class="stat-label" />
                              <GridLayout class="stat-input-box" @loaded="applyInsetShadow">
                                <GridLayout columns="auto, *" class="stat-input-content" verticalAlignment="middle">
                                  <Image src="~/assets/posts.png" col="0" class="stat-image-icon" stretch="aspectFit" />
                                  <Label :text="String(postsCount)" col="1" class="stat-value" />
                                </GridLayout>
                              </GridLayout>
                            </StackLayout>

                            <StackLayout col="1" marginLeft="5" @loaded="disableClipping">
                              <Label :text="ui.followersLabel" class="stat-label" />
                              <GridLayout class="stat-input-box" @loaded="applyInsetShadow">
                                <GridLayout columns="auto, *" class="stat-input-content" verticalAlignment="middle">
                                  <Image src="~/assets/podpis.png" col="0" class="stat-image-icon" stretch="aspectFit" />
                                  <Label :text="String(followersCount)" col="1" class="stat-value" />
                                </GridLayout>
                              </GridLayout>
                            </StackLayout>
                          </GridLayout>
                        </GridLayout>
                      </GridLayout>
                    </GridLayout>
                  </GridLayout>
                </GridLayout>

                <!-- About me -->
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
                    text="Обо мне"
                    :width="330" 
                    :height="64" 
                    :sharpness="0.5"
                    :showShadow="true"
                    left="20" 
                    top="0"
                    @loaded="disableClippingDeep"
                  />
                </AbsoluteLayout>

              </StackLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>
      </StackLayout>
    </ScrollView>

    <GridLayout
      v-if="isSettingsMenuMounted"
      ref="settingsOverlay"
      class="settings-overlay"
    >
      <StackLayout class="settings-overlay-backdrop" @tap="closeSettingsMenu" />
      <StackLayout
        ref="settingsPanel"
        class="settings-menu-shell"
        verticalAlignment="center"
        horizontalAlignment="center"
      >
        <GridLayout class="settings-menu-outer">
          <StackLayout class="settings-menu-inner">
            <Label :text="ui.settingsTitle" class="settings-menu-title" />
            <AppButton
              :text="ui.settingsEditProfile"
              type="secondary"
              compact
              class="settings-action-btn"
              horizontalAlignment="center"
              @tap="onSettingsActionTap('edit')"
            />
            <AppButton
              :text="ui.settingsChangeAvatar"
              type="secondary"
              compact
              class="settings-action-btn"
              horizontalAlignment="center"
              @tap="onSettingsActionTap('avatar')"
            />
            <AppButton
              :text="ui.settingsRefresh"
              type="secondary"
              compact
              class="settings-action-btn"
              horizontalAlignment="center"
              @tap="onSettingsActionTap('refresh')"
            />
            <AppButton
              :text="ui.settingsLogout"
              type="arena"
              compact
              class="settings-action-btn"
              horizontalAlignment="center"
              @tap="onSettingsActionTap('logout')"
            />
          </StackLayout>
        </GridLayout>
      </StackLayout>
    </GridLayout>

    <GridLayout
      v-if="isLogoutDialogMounted"
      ref="logoutOverlay"
      class="settings-overlay"
    >
      <StackLayout class="settings-overlay-backdrop" @tap="closeLogoutDialog" />
      <StackLayout
        ref="logoutPanel"
        class="settings-menu-shell logout-menu-shell"
        verticalAlignment="center"
        horizontalAlignment="center"
      >
        <GridLayout class="settings-menu-outer">
          <StackLayout class="settings-menu-inner logout-menu-inner">
            <Label :text="ui.logoutTitle" class="settings-menu-title" />
            <Label :text="ui.logoutMessage" class="logout-menu-message" textWrap="true" />
            <AppButton
              :text="ui.logoutConfirm"
              type="arena"
              compact
              class="settings-action-btn"
              horizontalAlignment="center"
              @tap="onLogoutConfirmTap"
            />
            <AppButton
              :text="ui.logoutCancel"
              type="secondary"
              compact
              class="settings-action-btn"
              horizontalAlignment="center"
              @tap="onLogoutCancelTap"
            />
          </StackLayout>
        </GridLayout>
      </StackLayout>
    </GridLayout>

    <GridLayout
      v-if="isEditProfileDialogMounted"
      ref="editProfileOverlay"
      class="settings-overlay"
    >
      <StackLayout class="settings-overlay-backdrop" @tap="closeEditProfileDialog" />
      <StackLayout
        ref="editProfilePanel"
        class="settings-menu-shell edit-profile-shell"
        verticalAlignment="center"
        horizontalAlignment="center"
      >
        <GridLayout class="settings-menu-outer">
          <StackLayout class="settings-menu-inner edit-profile-inner">
            <Label :text="ui.editProfileTitle" class="settings-menu-title" />
            <TextField
              :text="editNicknameInput"
              :hint="ui.editNicknameHint"
              class="edit-profile-input"
              @textChange="onEditNicknameChange"
            />
            <Label
              v-if="editProfileError"
              :text="editProfileError"
              class="edit-profile-error"
              textWrap="true"
            />
            <AppButton
              :text="ui.editProfileSave"
              type="arena"
              compact
              class="settings-action-btn"
              horizontalAlignment="center"
              @tap="onEditProfileSaveTap"
            />
            <AppButton
              :text="ui.editProfileCancel"
              type="secondary"
              compact
              class="settings-action-btn"
              horizontalAlignment="center"
              @tap="onEditProfileCancelTap"
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
import UserLevelBar from "../../components/UserLevelBar.vue";
import HexagonHeader from "../../components/HexagonHeader.vue";
import SettingsButton from "../../components/SettingsButton.vue";
import AppButton from "../../components/AppButton.vue";
import Welcome from "../Welcome.vue";
import { getMyProfile, updateMyProfile, uploadMyAvatar } from "../../services/profile";
import { clearSession, sessionStore } from "../../stores/session";
import { pickImageFromDevice } from "../../utils/imagePicker";
import { normalizeBackendUrl } from "../../utils/backendUrl";

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
  components: {
    UserLevelBar,
    HexagonHeader,
    SettingsButton,
    AppButton,
  },
  data() {
    return {
      isSettingsMenuMounted: false,
      isSettingsMenuAnimating: false,
      isLogoutDialogMounted: false,
      isLogoutDialogAnimating: false,
      isEditProfileDialogMounted: false,
      isEditProfileDialogAnimating: false,
      editNicknameInput: "",
      editProfileError: "",
      profileName: "Профиль",
      profileBio: "Добавьте информацию о себе.",
      profileLevel: 1,
      levelProgressCurrent: 50,
      levelProgressRequired: 100,
      postsCount: 0,
      followersCount: 0,
      avatarSource: "",
      ui: {
        settingsTitle: "Настройки",
        settingsEditProfile: "Редактировать профиль",
        settingsChangeAvatar: "Сменить аватар",
        settingsRefresh: "Обновить данные",
        postsLabel: "Посты",
        followersLabel: "Подписчики",
        settingsLogout: "Выйти из аккаунта",
        logoutTitle: "Выход из аккаунта",
        logoutMessage: "Вы действительно хотите выйти?",
        logoutConfirm: "Выйти",
        logoutCancel: "Отмена",
        editProfileTitle: "Редактирование профиля",
        editNicknameHint: "Введите новый никнейм",
        editProfileSave: "Сохранить",
        editProfileCancel: "Отмена",
        errNicknameRequired: "Введите никнейм.",
        errUpdateProfile: "Не удалось обновить профиль.",
      },
    };
  },
  async mounted() {
    await this.refreshProfile();
  },
  methods: {
    applyProfile(profile: any): void {
      sessionStore.profile = profile;
      this.profileName = decodeEscapedUnicode(profile.nickname) || "Профиль";
      this.profileBio = decodeEscapedUnicode(profile.bio) || "Добавьте информацию о себе.";
      this.profileLevel = profile.level || 1;
      this.postsCount = profile.posts_count || 0;
      this.followersCount = profile.followers_count || 0;
      this.avatarSource = normalizeBackendUrl(profile.avatar_url);
    },
    async refreshProfile(): Promise<void> {
      if (!sessionStore.token) return;
      try {
        const profile = await getMyProfile(sessionStore.token);
        this.applyProfile(profile);
      } catch (error) {
        console.log("profile load failed", error);
      }
    },
    async openSettingsMenu(): Promise<void> {
      if (this.isSettingsMenuMounted || this.isSettingsMenuAnimating) return;

      this.isSettingsMenuMounted = true;
      this.isSettingsMenuAnimating = true;

      await this.$nextTick();
      const overlayRef = this.$refs.settingsOverlay as any;
      const panelRef = this.$refs.settingsPanel as any;
      const overlay = overlayRef?.nativeView;
      const panel = panelRef?.nativeView;
      if (!overlay || !panel) {
        this.isSettingsMenuAnimating = false;
        return;
      }

      overlay.opacity = 0;
      panel.translateY = -90;

      try {
        await Promise.all([
          overlay.animate({ opacity: 1, duration: 180 }),
          panel.animate({ translate: { x: 0, y: 0 }, duration: 240, curve: "easeOut" as any }),
        ]);
      } finally {
        this.isSettingsMenuAnimating = false;
      }
    },
    async closeSettingsMenu(): Promise<void> {
      if (!this.isSettingsMenuMounted || this.isSettingsMenuAnimating) return;
      this.isSettingsMenuAnimating = true;

      const overlayRef = this.$refs.settingsOverlay as any;
      const panelRef = this.$refs.settingsPanel as any;
      const overlay = overlayRef?.nativeView;
      const panel = panelRef?.nativeView;

      if (overlay && panel) {
        try {
          await Promise.all([
            overlay.animate({ opacity: 0, duration: 160 }),
            panel.animate({ translate: { x: 0, y: -90 }, duration: 200, curve: "easeIn" as any }),
          ]);
        } finally {
          this.isSettingsMenuMounted = false;
          this.isSettingsMenuAnimating = false;
        }
        return;
      }

      this.isSettingsMenuMounted = false;
      this.isSettingsMenuAnimating = false;
    },
    async openLogoutDialog(): Promise<void> {
      if (this.isLogoutDialogMounted || this.isLogoutDialogAnimating) return;

      this.isLogoutDialogMounted = true;
      this.isLogoutDialogAnimating = true;

      await this.$nextTick();
      const overlayRef = this.$refs.logoutOverlay as any;
      const panelRef = this.$refs.logoutPanel as any;
      const overlay = overlayRef?.nativeView;
      const panel = panelRef?.nativeView;
      if (!overlay || !panel) {
        this.isLogoutDialogAnimating = false;
        return;
      }

      overlay.opacity = 0;
      panel.translateY = -70;

      try {
        await Promise.all([
          overlay.animate({ opacity: 1, duration: 160 }),
          panel.animate({ translate: { x: 0, y: 0 }, duration: 220, curve: "easeOut" as any }),
        ]);
      } finally {
        this.isLogoutDialogAnimating = false;
      }
    },
    async closeLogoutDialog(): Promise<void> {
      if (!this.isLogoutDialogMounted || this.isLogoutDialogAnimating) return;
      this.isLogoutDialogAnimating = true;

      const overlayRef = this.$refs.logoutOverlay as any;
      const panelRef = this.$refs.logoutPanel as any;
      const overlay = overlayRef?.nativeView;
      const panel = panelRef?.nativeView;

      if (overlay && panel) {
        try {
          await Promise.all([
            overlay.animate({ opacity: 0, duration: 140 }),
            panel.animate({ translate: { x: 0, y: -70 }, duration: 180, curve: "easeIn" as any }),
          ]);
        } finally {
          this.isLogoutDialogMounted = false;
          this.isLogoutDialogAnimating = false;
        }
        return;
      }

      this.isLogoutDialogMounted = false;
      this.isLogoutDialogAnimating = false;
    },
    async openEditProfileDialog(): Promise<void> {
      if (this.isEditProfileDialogMounted || this.isEditProfileDialogAnimating) return;
      if (!sessionStore.token || !sessionStore.profile) {
        await alert({
          title: "Профиль",
          message: "Сначала загрузите профиль.",
          okButtonText: "OK",
        });
        return;
      }

      this.editNicknameInput = this.profileName || "";
      this.editProfileError = "";
      this.isEditProfileDialogMounted = true;
      this.isEditProfileDialogAnimating = true;

      await this.$nextTick();
      const overlayRef = this.$refs.editProfileOverlay as any;
      const panelRef = this.$refs.editProfilePanel as any;
      const overlay = overlayRef?.nativeView;
      const panel = panelRef?.nativeView;
      if (!overlay || !panel) {
        this.isEditProfileDialogAnimating = false;
        return;
      }

      overlay.opacity = 0;
      panel.translateY = -70;

      try {
        await Promise.all([
          overlay.animate({ opacity: 1, duration: 160 }),
          panel.animate({ translate: { x: 0, y: 0 }, duration: 220, curve: "easeOut" as any }),
        ]);
      } finally {
        this.isEditProfileDialogAnimating = false;
      }
    },
    async closeEditProfileDialog(): Promise<void> {
      if (!this.isEditProfileDialogMounted || this.isEditProfileDialogAnimating) return;
      this.isEditProfileDialogAnimating = true;

      const overlayRef = this.$refs.editProfileOverlay as any;
      const panelRef = this.$refs.editProfilePanel as any;
      const overlay = overlayRef?.nativeView;
      const panel = panelRef?.nativeView;

      if (overlay && panel) {
        try {
          await Promise.all([
            overlay.animate({ opacity: 0, duration: 140 }),
            panel.animate({ translate: { x: 0, y: -70 }, duration: 180, curve: "easeIn" as any }),
          ]);
        } finally {
          this.isEditProfileDialogMounted = false;
          this.isEditProfileDialogAnimating = false;
        }
        return;
      }

      this.isEditProfileDialogMounted = false;
      this.isEditProfileDialogAnimating = false;
    },
    onSettingsButtonTap(): void {
      if (this.isSettingsMenuAnimating || this.isLogoutDialogAnimating || this.isEditProfileDialogAnimating) return;
      if (this.isEditProfileDialogMounted) {
        void this.closeEditProfileDialog();
        return;
      }
      if (this.isLogoutDialogMounted) {
        void this.closeLogoutDialog();
        return;
      }
      if (this.isSettingsMenuMounted) {
        void this.closeSettingsMenu();
        return;
      }
      void this.openSettingsMenu();
    },
    async onLogoutConfirmTap(): Promise<void> {
      await this.closeLogoutDialog();
      clearSession();
      this.$navigateTo(Welcome, { clearHistory: true });
    },
    async onLogoutCancelTap(): Promise<void> {
      await this.closeLogoutDialog();
    },
    onEditNicknameChange(args: any): void {
      this.editNicknameInput = String(args?.value ?? args?.object?.text ?? "");
      this.editProfileError = "";
    },
    async onEditProfileSaveTap(): Promise<void> {
      if (!sessionStore.token || !sessionStore.profile) {
        this.editProfileError = this.ui.errUpdateProfile;
        return;
      }

      const nextNickname = this.editNicknameInput.trim();
      if (!nextNickname) {
        this.editProfileError = this.ui.errNicknameRequired;
        return;
      }

      try {
        const profile = await updateMyProfile(sessionStore.token, {
          nickname: nextNickname,
          bio: sessionStore.profile.bio ?? null,
          level: Number(sessionStore.profile.level ?? this.profileLevel ?? 1),
          avatar_url: sessionStore.profile.avatar_url,
        });
        this.applyProfile(profile);
        await this.closeEditProfileDialog();
      } catch (error) {
        this.editProfileError = error instanceof Error ? error.message : this.ui.errUpdateProfile;
      }
    },
    async onEditProfileCancelTap(): Promise<void> {
      await this.closeEditProfileDialog();
    },
    async onSettingsActionTap(actionKey: "edit" | "avatar" | "refresh" | "logout"): Promise<void> {
      if (this.isSettingsMenuAnimating) return;
      await this.closeSettingsMenu();

      if (actionKey === "avatar") {
        await this.changeAvatar();
        return;
      }
      if (actionKey === "edit") {
        await this.openEditProfileDialog();
        return;
      }
      if (actionKey === "refresh") {
        await this.refreshProfile();
        return;
      }
      if (actionKey === "logout") {
        await this.openLogoutDialog();
      }
    },
    async editProfile(): Promise<void> {
      await this.openEditProfileDialog();
    },
    async changeAvatar(): Promise<void> {
      if (!sessionStore.token) return;
      try {
        const picked = await pickImageFromDevice();
        if (!picked) return;

        await uploadMyAvatar(sessionStore.token, {
          uri: picked.uri,
          name: picked.name,
          type: picked.type,
        });
        await this.refreshProfile();
      } catch (error) {
        await alert({
          title: "Ошибка",
          message: error instanceof Error ? error.message : "Не удалось обновить аватар.",
          okButtonText: "OK",
        });
      }
    },
    disableClipping(args: any) {
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
      } catch (e) {}
    },

    disableClippingDeep(args: any) {
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
      } catch (e) {}
    },

    applyInsetShadow(args: any) {
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
        } catch (e) {
          console.error("applyInsetShadow error:", e);
        }
      }, 100);
    },

    applyInsetShadowLarge(args: any) {
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
        } catch (e) {
          console.error("applyInsetShadowLarge error:", e);
        }
      }, 100);
    },
  },
});
</script>

<style scoped>
.page-container {
  padding: 16;
}

.main-bg-header {
  background-image: url('~/assets/Home_bg.png');
  background-size: cover;
  background-position: center;
}

.scroll-view-main {
  background-color: transparent;
}

.settings-overlay {
  background-color: rgba(9, 15, 28, 0.45);
  padding: 20 14;
}

.settings-overlay-backdrop {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.settings-menu-shell {
  width: 280;
  height: 320;
  margin: 0;
  z-index: 2;
}

.settings-menu-outer {
  height: 100%;
  background: linear-gradient(to bottom, #eeb859, #7c4c0b);
  border-width: 2;
  border-color: #030303;
  border-radius: 14;
  padding: 4 4 10 4;
}

.settings-menu-inner {
  height: 100%;
  background: linear-gradient(to bottom, #2b8cff, #1556a8);
  border-width: 1;
  border-color: #000000;
  border-radius: 12;
  padding: 10 6 8 6;
}

.settings-menu-title {
  font-family: "supercell-magic_0";
  color: #ffffff;
  font-size: 15;
  text-align: center;
  margin-bottom: 4;
  text-shadow: 0 1.6 0.1 rgba(0, 0, 0, 0.91);
}

.settings-action-btn {
  margin: 2 0;
}

.logout-menu-shell {
  height: 248;
}

.logout-menu-inner {
  padding: 12 10 10 10;
}

.logout-menu-message {
  font-family: "supercell-magic_0";
  color: #ffffff;
  font-size: 13;
  text-align: center;
  margin: 6 4 10 4;
  text-shadow: 0 1 0 rgba(0, 0, 0, 0.8);
}

.edit-profile-shell {
  height: 248;
}

.edit-profile-inner {
  padding: 12 10 10 10;
}

.edit-profile-input {
  margin: 4 8 10 8;
  padding: 8 10;
  background-color: #ffffff;
  color: #1f2e47;
  border-radius: 10;
  border-width: 1;
  border-color: #1a4f93;
}

.edit-profile-error {
  font-family: "supercell-magic_0";
  color: #ffd8d8;
  font-size: 11;
  text-align: center;
  margin: 0 8 8 8;
  text-shadow: 0 1 0 rgba(0, 0, 0, 0.8);
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

/* ===== HEADER CARD ===== */
.header-outer-shadow {
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 13;
  margin-bottom: 12;
  padding-bottom: 6;
}

.header-outer-frame {
  height: 108;
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
  width: 84;
  height: 90;
  margin-left: 8;
  margin-top: -3;
  background: linear-gradient(to bottom, #F4E093, #E49C47);
  border-width: 1;
  border-color: rgba(0, 0, 0, 0.56);
  border-radius: 50;
  padding: 2;
}

.avatar-image {
  width: 80;
  height: 84;
  border-radius: 42;
  border-width: 1;
  border-color: #000000;
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

/* Icons */
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


