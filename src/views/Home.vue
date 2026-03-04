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

      <GridLayout
        ref="bottomBar"
        row="1"
        columns="*, *, *, *, *"
        class="bottom-bar"
      >
        <StackLayout
          v-for="(tab, index) in tabs"
          :key="index"
          :col="index"
          :ref="'tab_' + index"
          class="tab-item"
          @tap="onTabTap(index)"
          verticalAlignment="center"
          horizontalAlignment="center"
        >
          <Label :text="tab.icon" class="tab-icon" />
          <Label
            :text="tab.title"
            class="tab-title"
            :class="{ 'tab-title--active': selectedIndex === index }"
          />
        </StackLayout>
      </GridLayout>

    </GridLayout>
  </Page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Animation, View, isAndroid } from "@nativescript/core";
import FeedTab from "./tabs/FeedTab.vue";
import ProfileTab from "./tabs/ProfileTab.vue";

interface Tab {
  icon: string;
  title: string;
}

interface Toast {
  id: number;
}

export default defineComponent({
  name: "Home",
  components: { FeedTab, ProfileTab },
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
      this.animateTab(this.selectedIndex, true, true);
    }, 100);
  },
  methods: {
    disableClipping(): void {
      if (!isAndroid) return;

      const barRef = this.$refs["bottomBar"];
      const barView: View | null = barRef
        ? ((Array.isArray(barRef) ? barRef[0] : barRef) as any)?.nativeView ?? null
        : null;

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
        const view = this.getTabView(i);
        if (view?.android) {
          view.android.setClipChildren(false);
          view.android.setClipToPadding(false);
        }
      }
    },

    getTabView(index: number): View | null {
      const ref = this.$refs["tab_" + index];
      if (!ref) return null;
      const item = Array.isArray(ref) ? ref[0] : ref;
      return (item as any)?.nativeView ?? null;
    },

    animateTab(index: number, isActive: boolean, instant = false): void {
      const view = this.getTabView(index);
      if (!view) return;

      if (isAndroid && view.android) {
        view.android.setElevation(isActive ? 64 : 32);
        view.android.setTranslationZ(isActive ? 64 : 32);
      }

      new Animation([{
        target: view,
        scale: { x: isActive ? 1.2 : 1, y: isActive ? 1.2 : 1 },
        translate: { x: 0, y: isActive ? -12 : 0 },
        duration: instant ? 0 : 200,
        curve: "easeOut",
      }]).play().catch(() => {});
    },

    async showToastAnimated(): Promise<void> {
      const id = ++this.toastCounter;
      this.toasts.push({ id });

      await this.$nextTick();

      const ref = this.$refs["toast_" + id];
      const view: View | null = ref
        ? ((Array.isArray(ref) ? ref[0] : ref) as any)?.nativeView ?? null
        : null;

      if (!view) {
        this.toasts = this.toasts.filter(t => t.id !== id);
        return;
      }

      view.opacity = 0;
      view.translateY = 16;

      await new Animation([{
        target: view,
        opacity: 1,
        translate: { x: 0, y: 0 },
        duration: 300,
        curve: "easeOut",
      }]).play();

      await new Promise(resolve => setTimeout(resolve, 1200));

      await new Animation([{
        target: view,
        opacity: 0,
        translate: { x: 0, y: -8 },
        duration: 300,
        curve: "easeIn",
      }]).play();

      this.toasts = this.toasts.filter(t => t.id !== id);
    },

    onTabTap(index: number): void {
      if (this.inProgressTabs.includes(index)) {
        this.showToastAnimated();
        return;
      }

      if (index === this.selectedIndex) return;

      this.animateTab(this.selectedIndex, false);
      this.animateTab(index, true);
      this.selectedIndex = index;
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
  background-color: #ffffff;
  height: 64;
  border-top-width: 1;
  border-top-color: #e0e0e0;
}

.tab-item {
  padding: 6 0;
}

.tab-icon {
  font-size: 22;
  text-align: center;
}

.tab-title {
  font-size: 10;
  color: #888888;
  text-align: center;
  margin-top: 2;
}

.tab-title--active {
  color: #ffcc00;
  font-weight: bold;
}

.toast-badge {
  background-color: #333333;
  border-radius: 20;
  padding: 12 24;
  margin-bottom: 10;
}

.toast-text {
  color: #ffffff;
  font-size: 15;
  font-weight: bold;
  text-align: center;
}
</style>
