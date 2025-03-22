<template>
  <suspense>
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </suspense>
</template>
<script setup lang="ts">
import { RouterView } from "vue-router";
</script>
