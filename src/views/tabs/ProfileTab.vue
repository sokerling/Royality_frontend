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
                          
                          <GridLayout columns="*" rows="*" class="level-container" row="1" col="1" @loaded="disableClipping">
                            <GridLayout row="0" col="0" columns="*" class="xp-bar-bg" marginLeft="20" horizontalAlignment="left">
                              <StackLayout col="0" class="xp-bar-fill" horizontalAlignment="left" />
                              <Label col="0" text="50 / 100" class="xp-text" horizontalAlignment="center" verticalAlignment="center" />
                            </GridLayout>
                            <StarBadge
                              row="0" col="0"
                              :level="profileLevel"
                              :size="32"
                              horizontalAlignment="left"
                              verticalAlignment="center"
                              marginTop="-4"
                              @loaded="disableClippingDeep"
                            />
                          </GridLayout>

                          <!-- Кнопка настроек -->
                          <ContentView 
                            ref="settingsBtn"
                            row="0" col="2" 
                            width="38" 
                            height="42"
                            horizontalAlignment="right" 
                            verticalAlignment="top"
                            marginTop="2"
                            marginRight="2"
                            @loaded="drawSettingsButton"
                            @touch="onSettingsTouch"
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
                            
                            <!-- Посты -->
                            <StackLayout col="0" marginRight="5" @loaded="disableClipping">
                              <Label text="Посты" class="stat-label" />
                              <GridLayout class="stat-input-box" @loaded="applyInsetShadow">
                                <GridLayout columns="auto, *" class="stat-input-content" verticalAlignment="middle">
                                  <!-- Иконка Постов -->
                                  <Image src="~/assets/posts.png" col="0" class="stat-image-icon" stretch="aspectFit" />
                                  <Label :text="String(postsCount)" col="1" class="stat-value" />
                                </GridLayout>
                              </GridLayout>
                            </StackLayout>

                            <!-- Подписчики -->
                            <StackLayout col="1" marginLeft="5" @loaded="disableClipping">
                              <Label text="Подписчики" class="stat-label" />
                              <GridLayout class="stat-input-box" @loaded="applyInsetShadow">
                                <GridLayout columns="auto, *" class="stat-input-content" verticalAlignment="middle">
                                  <!-- Иконка Подписчиков -->
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
  </GridLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isAndroid } from "@nativescript/core";
import { action, alert, confirm, prompt } from "@nativescript/core/ui/dialogs";
import StarBadge from "../../components/StarBadge.vue";
import HexagonHeader from "../../components/HexagonHeader.vue";
import Welcome from "../Welcome.vue";
import { getMyProfile, updateMyProfile, uploadMyAvatar } from "../../services/profile";
import { clearSession, sessionStore } from "../../stores/session";
import { pickImageFromDevice } from "../../utils/imagePicker";
import { normalizeBackendUrl } from "../../utils/backendUrl";

export default defineComponent({
  components: {
    StarBadge,
    HexagonHeader,
  },
  data() {
    return {
      settingsBtnPressed: false,
      profileName: "Профиль",
      profileBio: "Добавьте информацию о себе.",
      profileLevel: 1,
      postsCount: 0,
      followersCount: 0,
      avatarSource: "",
    };
  },
  async mounted() {
    await this.refreshProfile();
  },
  methods: {
    applyProfile(profile: any): void {
      sessionStore.profile = profile;
      this.profileName = profile.nickname || "Профиль";
      this.profileBio = profile.bio || "Добавьте информацию о себе.";
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
      const selected = await action("Настройки", "Отмена", [
        "Обновить профиль",
        "Обновить аватар",
        "Обновить данные",
        "Выйти из аккаунта",
      ]);
      if (selected === "Обновить аватар") {
        await this.changeAvatar();
        return;
      }


      if (selected === "Обновить профиль") {
        await this.editProfile();
        return;
      }

      if (selected === "Обновить данные") {
        await this.refreshProfile();
        return;
      }

      if (selected === "Выйти из аккаунта") {
        const approved = await confirm({
          title: "Выход",
          message: "Выйти из текущего аккаунта?",
          okButtonText: "Да",
          cancelButtonText: "Нет",
        });
        if (!approved) return;
        clearSession();
        this.$navigateTo(Welcome, { clearHistory: true });
      }
    },
    async editProfile(): Promise<void> {
      if (!sessionStore.token || !sessionStore.profile) {
        await alert({ title: "Профиль", message: "Сначала загрузите профиль.", okButtonText: "OK" });
        return;
      }

      const nicknameResult = await prompt({
        title: "Никнейм",
        message: "Введите новый никнейм",
        defaultText: this.profileName,
        okButtonText: "Далее",
        cancelButtonText: "Отмена",
      });
      if (!nicknameResult.result) return;

      const bioResult = await prompt({
        title: "О себе",
        message: "Введите описание",
        defaultText: this.profileBio,
        okButtonText: "Далее",
        cancelButtonText: "Отмена",
      });
      if (!bioResult.result) return;

      const levelResult = await prompt({
        title: "Уровень",
        message: "Введите уровень (1..100)",
        defaultText: String(this.profileLevel),
        okButtonText: "Сохранить",
        cancelButtonText: "Отмена",
      });
      if (!levelResult.result) return;

      const nextLevel = Number(levelResult.text);
      if (!Number.isFinite(nextLevel) || nextLevel < 1 || nextLevel > 100) {
        await alert({ title: "Ошибка", message: "Уровень должен быть в диапазоне 1..100.", okButtonText: "OK" });
        return;
      }

      try {
        const profile = await updateMyProfile(sessionStore.token, {
          nickname: nicknameResult.text.trim(),
          bio: bioResult.text.trim() || null,
          level: Math.round(nextLevel),
          avatar_url: sessionStore.profile.avatar_url,
        });
        this.applyProfile(profile);
      } catch (error) {
        await alert({
          title: "Ошибка",
          message: error instanceof Error ? error.message : "Не удалось обновить профиль.",
          okButtonText: "OK",
        });
      }
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
    onSettingsTouch(args: any) {
      if (!isAndroid) return;
      const action = args.action;
      if (action === "down") {
        this.settingsBtnPressed = true;
        this.redrawSettingsButton();
      } else if (action === "up" || action === "cancel") {
        this.settingsBtnPressed = false;
        this.redrawSettingsButton();
        if (action === "up") {
          this.openSettingsMenu();
        }
      }
    },

    drawSettingsButton(args: any) {
      if (!isAndroid) return;
      const nv = args.object?.nativeView;
      if (!nv) return;
      this.disableClipping(args);
      
      setTimeout(() => {
        this.renderSettingsButton(nv, false);
      }, 100);
    },

    redrawSettingsButton() {
      const ref = this.$refs.settingsBtn as any;
      const nv = ref?.nativeView;
      if (!nv) return;
      
      if (nv.getChildCount && nv.getChildCount() > 0) {
        nv.removeAllViews();
      }
      this.renderSettingsButton(nv, this.settingsBtnPressed);
    },

    renderSettingsButton(nativeView: any, pressed: boolean) {
      try {
        const context = nativeView.getContext();
        const density = context.getResources().getDisplayMetrics().density;
        const btnW = 35 * density;
        const btnH = 40 * density;
        const pressOffset = pressed ? 3 * density : 0;
        const radius = 10 * density;
    
        const CustomView = (android.view.View as any).extend({
          onDraw(canvas: any) {
            const paint = new android.graphics.Paint();
            paint.setAntiAlias(true);
    
            if (!pressed) {
              const shadowOffset = 4 * density;
              const shadowRect = new android.graphics.RectF(
                0, 
                shadowOffset, 
                btnW, 
                35 * density + shadowOffset
              );
              paint.setStyle(android.graphics.Paint.Style.FILL);
              paint.setColor(android.graphics.Color.argb(115, 0, 0, 0));
              canvas.drawRoundRect(shadowRect, radius, radius, paint);
              
              // Возвращаем alpha на 100% (исправление полупрозрачности!)
              paint.setAlpha(255);
            }
    
            const baseY = pressOffset;
    
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
            paint.setShader(null);
    
            paint.setStyle(android.graphics.Paint.Style.STROKE);
            paint.setStrokeWidth(2 * density);
            paint.setColor(android.graphics.Color.parseColor("#030303"));
            canvas.drawRoundRect(outerRect, radius, radius, paint);
    
            const midRect = new android.graphics.RectF(
              2 * density, baseY + 2 * density,
              btnW - 2 * density, baseY + 31 * density
            );
            const midGradient = new android.graphics.LinearGradient(
              0, baseY, 0, baseY + 31 * density,
              android.graphics.Color.parseColor("#4097F4"),
              android.graphics.Color.parseColor("#409AF1"),
              android.graphics.Shader.TileMode.CLAMP
            );
            paint.setStyle(android.graphics.Paint.Style.FILL);
            paint.setShader(midGradient);
            canvas.drawRoundRect(midRect, radius - 1, radius - 1, paint);
            paint.setShader(null);
    
            const lowerRect = new android.graphics.RectF(
              2.5 * density, baseY + 15 * density,
              btnW - 2.5 * density, baseY + 31 * density
            );
            const lowerGradient = new android.graphics.LinearGradient(
              0, baseY + 15 * density, 0, baseY + 31 * density,
              android.graphics.Color.parseColor("#4097F4"),
              android.graphics.Color.parseColor("#4080FB"),
              android.graphics.Shader.TileMode.CLAMP
            );
            paint.setStyle(android.graphics.Paint.Style.FILL);
            paint.setShader(lowerGradient);
            canvas.drawRoundRect(lowerRect, radius - 2, radius - 2, paint);
            paint.setShader(null);
    
            const topRect = new android.graphics.RectF(
              2.5 * density, baseY + 2.5 * density,
              btnW - 2.5 * density, baseY + 17 * density
            );
            paint.setStyle(android.graphics.Paint.Style.FILL);
            paint.setColor(android.graphics.Color.parseColor("#4DADF9"));
            canvas.drawRoundRect(topRect, radius - 2, radius - 2, paint);
    
            const iconCx = btnW / 2;
            const iconCy = baseY + 17.5 * density;
            const outerR = 11 * density;
            const innerR = outerR * 0.65;
            const toothWidth = 5.5 * density;
            const toothHeight = (outerR - innerR) + 2 * density;
            const teeth = 8;
    
            for (let i = 0; i < teeth; i++) {
              const angle = (2 * Math.PI / teeth) * i - Math.PI / 2;
              const toothCx = iconCx + (innerR + (outerR - innerR) / 2) * Math.cos(angle);
              const toothCy = iconCy + (innerR + (outerR - innerR) / 2) * Math.sin(angle);
              
              canvas.save();
              canvas.rotate((angle * 180 / Math.PI) + 90, toothCx, toothCy);
              
              const toothRect = new android.graphics.RectF(
                toothCx - toothWidth / 2,
                toothCy - toothHeight / 2,
                toothCx + toothWidth / 2,
                toothCy + toothHeight / 2
              );
              
              const toothGradient = new android.graphics.LinearGradient(
                toothRect.left, toothRect.top, toothRect.left, toothRect.bottom,
                android.graphics.Color.parseColor("#C5C5C5"),
                android.graphics.Color.parseColor("#FFFFFF"),
                android.graphics.Shader.TileMode.CLAMP
              );
              paint.setStyle(android.graphics.Paint.Style.FILL);
              paint.setShader(toothGradient);
              canvas.drawRoundRect(toothRect, 1.5 * density, 1.5 * density, paint);
              paint.setShader(null);
              
              paint.setStyle(android.graphics.Paint.Style.STROKE);
              paint.setStrokeWidth(0.5 * density);
              paint.setColor(android.graphics.Color.argb(180, 0, 0, 0));
              canvas.drawRoundRect(toothRect, 1.5 * density, 1.5 * density, paint);
              
              canvas.restore();
            }
    
            const mainGradient = new android.graphics.LinearGradient(
              0, iconCy - innerR, 0, iconCy + innerR,
              android.graphics.Color.parseColor("#C5C5C5"),
              android.graphics.Color.parseColor("#FFFFFF"),
              android.graphics.Shader.TileMode.CLAMP
            );
            paint.setStyle(android.graphics.Paint.Style.FILL);
            paint.setShader(mainGradient);
            canvas.drawCircle(iconCx, iconCy, innerR, paint);
            paint.setShader(null);
    
            paint.setStyle(android.graphics.Paint.Style.STROKE);
            paint.setStrokeWidth(0.5 * density);
            paint.setColor(android.graphics.Color.argb(180, 0, 0, 0));
            canvas.drawCircle(iconCx, iconCy, innerR, paint);
    
            const holeR = innerR * 0.42;
            const holeGradient = new android.graphics.LinearGradient(
              0, iconCy - holeR, 0, iconCy + holeR,
              android.graphics.Color.parseColor("#1778C5"),
              android.graphics.Color.parseColor("#9DD2FB"),
              android.graphics.Shader.TileMode.CLAMP
            );
            paint.setStyle(android.graphics.Paint.Style.FILL);
            paint.setShader(holeGradient);
            canvas.drawCircle(iconCx, iconCy, holeR, paint);
            paint.setShader(null);
    
            canvas.save();
            const clipPath = new android.graphics.Path();
            clipPath.addCircle(iconCx, iconCy, holeR, android.graphics.Path.Direction.CW);
            canvas.clipPath(clipPath);
            
            const insetGrad = new android.graphics.LinearGradient(
              0, iconCy - holeR, 0, iconCy,
              android.graphics.Color.argb(70, 0, 0, 0),
              android.graphics.Color.argb(0, 0, 0, 0),
              android.graphics.Shader.TileMode.CLAMP
            );
            paint.setStyle(android.graphics.Paint.Style.FILL);
            paint.setShader(insetGrad);
            canvas.drawCircle(iconCx, iconCy - holeR / 2, holeR, paint);
            paint.setShader(null);
            canvas.restore();
    
            paint.setStyle(android.graphics.Paint.Style.STROKE);
            paint.setStrokeWidth(1 * density);
            paint.setColor(android.graphics.Color.BLACK);
            canvas.drawCircle(iconCx, iconCy, holeR, paint);
          }
        });
    
        const customView = new CustomView(context);
        const lp = new android.view.ViewGroup.LayoutParams(
          Math.round(btnW),
          Math.round(btnH)
        );
        customView.setLayoutParams(lp);
        nativeView.addView(customView);
      } catch (e) {
        console.error("renderSettingsButton error:", e);
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

.xp-bar-bg {
  background-color: #1a0f07;
  border-radius: 8;
  border-width: 2;
  border-color: #000;
  height: 22;
  width: 80%;
}

.xp-bar-fill {
  background: linear-gradient(to right, #2ecc71, #27ae60);
  border-radius: 6;
  width: 50%;
  height: 100%;
}

.xp-text {
  font-family: "supercell-magic_0";
  color: white;
  font-size: 9;
  text-shadow: 0 1.6 0.1 rgba(0, 0, 0, 0.91);
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

/* НОВЫЙ КЛАСС ДЛЯ ИКОНОК-КАРТИНОК */
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
