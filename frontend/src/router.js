import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "guide.html",
    },
    {
      path: "/guide.html",
      name: "guide",
      component: () => import("@/views/Guide/index.vue"),
    },
    {
      path: "/login.html",
      name: "login",
      component: () => import("@/views/Login/index.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      redirect: "guide",
    },
  ],
});

router.resolve({
  name: "not-found",
  params: { pathMatch: ["not", "found"] },
}).href;

router.beforeEach((to, _, next) => {
  if (to.meta?.title) {
    document.title = to.meta.title;
  }
  next();
});

export default router;
