import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
// import ReactivityTransform from "@vue-macros/reactivity-transform/vite";
// import RewriteAll from "vite-plugin-rewrite-all";
import AutoImport from "unplugin-auto-import/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";

// https://vitejs.dev/config/
export default ({ mode, cwd }) => {
  // const base = loadEnv(mode, cwd)["VITE_APP_BASE_URL"] ||"/";
  return {
    // base,
    plugins: [
      vue(),
      // ReactivityTransform(),
      // RewriteAll(),
      AutoImport({
        imports: [
          "vue",
          {
            "naive-ui": [
              "useDialog",
              "useMessage",
              "useNotification",
              "useLoadingBar",
            ],
          },
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
};
