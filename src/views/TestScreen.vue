<template>
  <Page
    actionBarHidden="true"
    statusBarStyle="light"
    androidStatusBarBackground="transparent"
    :backgroundSpanUnderStatusBar="true"
  >
    <ScrollView clipToPadding="false">
      <StackLayout>
        <StackLayout height="100" backgroundColor="red" />
        <StackLayout height="100" backgroundColor="blue" />
        <StackLayout height="100" backgroundColor="green" />
        <StackLayout height="100" backgroundColor="yellow" />
        <StackLayout height="100" backgroundColor="purple" />
        <StackLayout height="100" backgroundColor="orange" />
        <StackLayout height="100" backgroundColor="red" />
        <StackLayout height="100" backgroundColor="blue" />
        <StackLayout height="100" backgroundColor="green" />
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "TestScreen",
});
</script>
