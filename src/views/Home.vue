<template>
  <Page class="page" actionBarHidden="true">
    <GridLayout rows="*, auto" margin="0" padding="0">

      <GridLayout row="0" margin="0" padding="0">
        <FeedTab v-if="selectedIndex === 2" />
        <ProfileTab v-if="selectedIndex === 4" />
      </GridLayout>

      <StackLayout
        v-for="toast in toasts"
        :key="toast.id"
        row="0"
        verticalAlignment="center"
        horizontalAlignment="center"
        isUserInteractionEnabled="false"
      >
        <StackLayout class="toast-badge" :ref="'toast_' + toast.id">
          <Label text="🚧 В работе" class="toast-text" />
        </StackLayout>
      </StackLayout>

      <!-- Нижняя панель -->
      <GridLayout
        ref="bottomBar"
        row="1"
        columns="*, 3, *, 3, *, 3, *, 3, *"
        class="bottom-bar"
      >
        <!-- Подсветка на всю ширину (colSpan=9), чтобы не обрезалась -->
        <StackLayout
          ref="tabHighlight"
          col="0"
          colSpan="9"
          class="tab-highlight"
          horizontalAlignment="left"
        />

        <template v-for="(tab, index) in tabs" :key="'tab-' + index">
          <StackLayout
            :col="index * 2"
            :ref="'tab_' + index"
            class="tab-item"
            @tap="onTabTap(index)"
            verticalAlignment="center"
            horizontalAlignment="center"
          >
            <Label :text="tab.icon" class="tab-icon" :ref="'icon_' + index" />
            <AppLabel
              :text="tab.title"
              class="tab-title"
              :class="{ 'tab-title--active': selectedIndex === index }"
              :strokeWidth="2"
              :shadowOffset="2"
              :ref="'title_' + index"
            />
          </StackLayout>

          <!-- Разделитель -->
          <StackLayout
            v-if="index < tabs.length - 1"
            :key="'sep-' + index"
            :col="index * 2 + 1"
            :ref="'sep_' + index"
            class="tab-divider"
          />
        </template>
      </GridLayout>

    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Animation, View, isAndroid, CoreTypes, Screen } from "@nativescript/core";
import FeedTab from "./tabs/FeedTab.vue";
import ProfileTab from "./tabs/ProfileTab.vue";
import AppLabel from "../components/AppLabel.vue";

interface Tab {
  icon: string;
  title: string;
}

interface Toast {
  id: number;
}

export default defineComponent({
  name: "Home",
  components: { FeedTab, ProfileTab, AppLabel },
  data() {
    return {
      selectedIndex: 2 as number,
      inProgressTabs: [0, 1, 3] as number[],
      toasts: [] as Toast[],
      toastCounter: 0 as number,
      tabs: [
        { icon: "🏆", title: "Турниры"    },
        { icon: "🃏", title: "Колоды"     },
        { icon: "📋", title: "Лента"      },
        { icon: "👥", title: "Сообщество" },
        { icon: "👤", title: "Профиль"    },
      ] as Tab[],
    };
  },
  mounted() {
    setTimeout(() => {
      this.disableClipping();
      this.applyBarState(this.selectedIndex, true);
    }, 150); // Увеличили задержку, чтобы верстка точно прогрузилась
  },
  methods: {
    disableClipping(): void {
      if (!isAndroid) return;

      const barView: View | null = (this.$refs["bottomBar"] as any)?.nativeView;
      if (barView?.android) {
        barView.android.setClipChildren(false);
        barView.android.setClipToPadding(false);
        const parent = barView.android.getParent();
        if (parent) {
          parent.setClipChildren(false);
          parent.setClipToPadding(false);
        }
      }

      for (let i = 0; i < this.tabs.length; i++) {
        const tabView = this.getTabView(i);
        if (tabView?.android) {
          tabView.android.setClipChildren(false);
          tabView.android.setClipToPadding(false);
        }
      }
    },

    getTabView(index: number): View | null {
      const ref = this.$refs["tab_" + index];
      return (ref as any)?.[0]?.nativeView ?? (ref as any)?.nativeView ?? null;
    },

    getSepView(index: number): View | null {
      const ref = this.$refs["sep_" + index];
      return (ref as any)?.[0]?.nativeView ?? (ref as any)?.nativeView ?? null;
    },

    getTargetX(index: number, activeIndex: number): number {
      const offset = 20;
      if (index === activeIndex - 1) return -offset;
      if (index === activeIndex + 1) return offset;
      return 0;
    },

    async applyBarState(activeIndex: number, instant = false): Promise<void> {
      const offset = 20;
      const animGroup: any[] = [];
      const highlight = (this.$refs["tabHighlight"] as any)?.nativeView as View;
      const barView = (this.$refs["bottomBar"] as any)?.nativeView as View;

      if (highlight && barView) {
        const density = Screen.mainScreen.scale;
        const measuredWidth = barView.getMeasuredWidth();
        const totalWidth = measuredWidth > 0 ? measuredWidth / density : Screen.mainScreen.widthDIPs;

        if (totalWidth > 0) {
          const tabWidth = (totalWidth - 12) / 5;

          // Рассчитываем расширение (подсветка должна закрывать всё пространство между раздвинутыми разделителями)
          const leftExpansion = activeIndex > 0 ? offset : 0;
          const rightExpansion = activeIndex < this.tabs.length - 1 ? offset : 0;

          const finalWidth = tabWidth + leftExpansion + rightExpansion;
          const targetX = activeIndex * (tabWidth + 3) - leftExpansion;

          if (instant) {
            highlight.width = finalWidth;
            highlight.translateX = targetX;
          } else {
            animGroup.push({
              target: highlight,
              width: finalWidth,
              translate: { x: targetX, y: 0 },
              duration: 250,
              curve: CoreTypes.AnimationCurve.easeInOut
            });
          }
        }
      }

      // Анимируем вкладки
      for (let i = 0; i < this.tabs.length; i++) {
        const view = this.getTabView(i);
        if (!view) continue;

        let targetScale = 1;
        let targetX = this.getTargetX(i, activeIndex);
        let targetY = 0;

        if (i === activeIndex) {
          targetScale = 1.2;
          targetY = -10;
          targetX = 0;
        }

        if (instant) {
          view.scaleX = view.scaleY = targetScale;
          view.translateX = targetX;
          view.translateY = targetY;
        } else if (i === activeIndex) {
          animGroup.push({
            target: view,
            scale: { x: 1.3, y: 1.3 },
            translate: { x: 0, y: -14 },
            duration: 120,
            curve: CoreTypes.AnimationCurve.easeOut
          });
        } else {
          animGroup.push({
            target: view,
            scale: { x: 1, y: 1 },
            translate: { x: targetX, y: 0 },
            duration: 200,
            curve: CoreTypes.AnimationCurve.easeInOut
          });
        }
      }

      // Анимируем разделители
      for (let i = 0; i < this.tabs.length - 1; i++) {
        const sep = this.getSepView(i);
        if (!sep) continue;

        let targetX = 0;
        if (i === activeIndex - 1) targetX = -offset;
        else if (i === activeIndex) targetX = offset;

        if (instant) {
          sep.translateX = targetX;
        } else {
          animGroup.push({
            target: sep,
            translate: { x: targetX, y: 0 },
            duration: 200,
            curve: CoreTypes.AnimationCurve.easeInOut
          });
        }
      }

      if (animGroup.length > 0) {
        await new Animation(animGroup).play();

        if (!instant) {
          const activeView = this.getTabView(activeIndex);
          activeView?.animate({
            scale: { x: 1.2, y: 1.2 },
            translate: { x: 0, y: -10 },
            duration: 150,
            curve: CoreTypes.AnimationCurve.easeOut
          });
        }
      }
    },

    async shakeTab(index: number): Promise<void> {
      const view = this.getTabView(index);
      if (!view) return;
      const basePosX = this.getTargetX(index, this.selectedIndex);
      const duration = 60;
      await view.animate({ translate: { x: basePosX - 6, y: 0 }, duration });
      await view.animate({ translate: { x: basePosX + 6, y: 0 }, duration });
      await view.animate({ translate: { x: basePosX - 4, y: 0 }, duration });
      await view.animate({ translate: { x: basePosX + 4, y: 0 }, duration });
      await view.animate({ translate: { x: basePosX, y: 0 }, duration });
    },

    async showToastAnimated(): Promise<void> {
      const id = ++this.toastCounter;
      this.toasts.push({ id });
      await this.$nextTick();
      const ref = this.$refs["toast_" + id];
      const view: View | null = (ref as any)?.[0]?.nativeView ?? (ref as any)?.nativeView ?? null;
      if (!view) return;
      view.opacity = 0; view.translateY = 20;
      await view.animate({ opacity: 1, translate: { x: 0, y: 0 }, duration: 400, curve: CoreTypes.AnimationCurve.easeOut });
      await new Promise(resolve => setTimeout(resolve, 1500));
      await view.animate({ opacity: 0, translate: { x: 0, y: -20 }, duration: 300, curve: CoreTypes.AnimationCurve.easeIn });
      this.toasts = this.toasts.filter(t => t.id !== id);
    },

    onTabTap(index: number): void {
      if (this.inProgressTabs.includes(index)) {
        this.shakeTab(index);
        this.showToastAnimated();
        return;
      }
      if (index === this.selectedIndex) return;

      this.selectedIndex = index;
      this.applyBarState(index);
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

.bottom-bar {
  background-image: linear-gradient(to bottom, #B0B2C7 0%, #4B5668 7%, #3E4758 100%);
  height: 70;
}

.tab-highlight {
  /* Градиент снизу вверх, без обводки и отступов */
  background: linear-gradient(to top, rgba(0, 150, 230, 0.4) 0%, rgba(0, 150, 230, 0) 100%);
  height: 100%;
}

.tab-item {
  padding: 4 0;
}

.tab-divider {
  width: 3;
  height: 100%;
  background: linear-gradient(to right, #919299 0%, #4B5668 41.83%, #3E4758 100%);
  opacity: 0.6;
}

.tab-icon {
  font-size: 24;
  text-align: center;
  color: #ffffff;
}

.tab-title {
  font-size: 10;
  color: #B0B7C1;
  text-align: center;
  margin-top: 2;
}

.tab-title--active {
  color: #FFCC00;
  font-weight: bold;
}

.toast-badge {
  background-color: rgba(51, 51, 51, 0.95);
  border-radius: 25;
  padding: 12 24;
  margin-bottom: 20;
  border-width: 1;
  border-color: #555555;
}

.toast-text {
  color: #ffffff;
  font-size: 16;
  font-weight: bold;
  text-align: center;
}
</style>
