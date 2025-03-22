<template>
  <section class="container">
    <n-card title="卡片">
      <n-space>
        <n-button>Default</n-button>
        <n-button type="tertiary">
          Tertiary
        </n-button>
        <n-button type="primary">
          <a href="/login.html">去登录</a>
        </n-button>
        <n-button type="info">
          Info
        </n-button>
        <n-button type="success">
          Success
        </n-button>
        <n-button type="warning">
          Warning
        </n-button>
        <n-button type="error">
          Error
        </n-button>
      </n-space>
    </n-card>
  </section>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";

const showPage = ref(false);

onMounted(async () => {

});
</script>
<style lang="scss" src="./style.scss"></style>
