// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from "#q-app";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig((ctx) => {
  return {
    // ✅ Pinia ANTES de i18n — obrigatório para o guard do router
    boot: ["pinia", "i18n"],

    css: ["app.scss"],

    extras: ["roboto-font", "material-icons"],

    build: {
      // ✅ Alias
      alias: {
        "@": resolve(__dirname, "./src"),
        "src": resolve(__dirname, "./src"), // opcional
      },

      typescript: {
        strict: true,
        vueShim: true,
      },

      vueRouterMode: "hash",

      vitePlugins: [
        [
          "@intlify/unplugin-vue-i18n/vite",
          {
            ssr: ctx.mode.ssr || ctx.mode.ssg,
            include: [ctx.appPaths.resolve.app("src/i18n")],
          },
        ],
      ],
    },

    devServer: {
      open: true,
    },

    framework: {
      config: {
        loadingBar: {
          color: "red",     // ⭐ VERMELHO
          size: "3px",
          position: "top",
          speed: 100,        // rápido (~1s)
          reverse: false,
          skipHijack: false,
        },
      },
      plugins: [
        "Notify",
        "Dialog",
        "Loading",
        "LoadingBar",
        "Dark",
        "LocalStorage",
        "Screen",
      ],
    },

    animations: [],

    ssr: {
      prodPort: 3000,
      middlewares: ["render"],
    },

    ssg: {},

    pwa: {
      workboxMode: "GenerateSW",
    },

    cordova: {},

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      preloadScripts: ["electron-preload"],
      inspectPort: 5858,
      bundler: "packager",
      packager: {},
      builder: {
        appId: "frontend-sicam",
      },
    },

    bex: {
      extraScripts: [],
    },
  };
});