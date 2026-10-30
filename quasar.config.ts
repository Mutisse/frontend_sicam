// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from "#q-app";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig((ctx) => {
  return {
    boot: ["pinia", "i18n"],

    css: ["app.scss"],

    extras: ["roboto-font", "material-icons"],

    build: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "src": resolve(__dirname, "./src"),
      },

      typescript: {
        strict: true,
        vueShim: true,
      },

      // ✅ Mantido "hash" — não precisa de rewrite no Render
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
          color: "red",
          size: "3px",
          position: "top",
          speed: 100,
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

    // ✅ PWA — manifest está em src-pwa/manifest.json (não duplicar aqui)
    pwa: {
      workboxMode: "GenerateSW",

      metaVariables: {
        appleMobileWebAppCapable: "yes",
        appleMobileWebAppStatusBarStyle: "default",
        appleMobileWebAppTitle: "SICAM STI",
        appleTouchIcon120: "icons/apple-icon-120x120.png",
        appleTouchIcon152: "icons/apple-icon-152x152.png",
        appleTouchIcon167: "icons/apple-icon-167x167.png",
        appleTouchIcon180: "icons/apple-icon-180x180.png",
        // ✅ Corrigido: 144x144 não foi gerado; usar 128x128 (existe)
        msapplicationTileImage: "icons/icon-128x128.png",
      },
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